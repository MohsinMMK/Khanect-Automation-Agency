import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const DEFAULT_LOOKBACK_HOURS = 72;
const DEFAULT_BATCH_SIZE = 50;
const DEFAULT_MAX_PER_RUN = 200;
const DEFAULT_TIMEOUT_MS = 10000;

type RetryStatus = 'pending' | 'failed';

interface ContactSubmissionRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  business_name: string;
  website: string | null;
  message: string | null;
  processing_status: RetryStatus | 'processing' | 'completed';
  created_at: string;
}

interface LeadWebhookPayload {
  submissionId: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website?: string;
  message?: string;
}

interface DispatchResult {
  success: boolean;
  status?: number;
  error?: string;
}

interface RunStats {
  scanned: number;
  claimed: number;
  dispatchedOk: number;
  failed: number;
  skipped: number;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

async function dispatchLead(
  webhookUrl: string,
  payload: LeadWebhookPayload,
  timeoutMs: number,
): Promise<DispatchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        status: response.status,
        error: errorText || `Webhook returned ${response.status}`,
      };
    }

    return { success: true, status: response.status };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: `Request timed out after ${timeoutMs}ms` };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown webhook dispatch error',
    };
  }
}

async function main(): Promise<void> {
  const supabaseUrl = envOrThrow('VITE_SUPABASE_URL');
  const serviceRoleKey = envOrThrow('SUPABASE_SERVICE_ROLE_KEY');
  const webhookUrl = envOrThrow('VITE_N8N_WEBHOOK_URL');

  const lookbackHours = parsePositiveInt(process.env.LEAD_RETRY_LOOKBACK_HOURS, DEFAULT_LOOKBACK_HOURS);
  const batchSize = parsePositiveInt(process.env.LEAD_RETRY_BATCH_SIZE, DEFAULT_BATCH_SIZE);
  const maxPerRun = parsePositiveInt(process.env.LEAD_RETRY_MAX_PER_RUN, DEFAULT_MAX_PER_RUN);
  const timeoutMs = parsePositiveInt(process.env.LEAD_RETRY_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);

  const cutoffIso = new Date(Date.now() - lookbackHours * 60 * 60 * 1000).toISOString();
  const statusesToRetry: RetryStatus[] = ['pending', 'failed'];

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log(
    `[retry-pending-leads] Starting run (window=${lookbackHours}h, batch=${batchSize}, max=${maxPerRun}, timeout=${timeoutMs}ms)`,
  );

  const { data: submissions, error: fetchError } = await supabase
    .from('contact_submissions')
    .select('id, full_name, email, phone, business_name, website, message, processing_status, created_at')
    .in('processing_status', statusesToRetry)
    .gte('created_at', cutoffIso)
    .order('created_at', { ascending: true })
    .limit(maxPerRun);

  if (fetchError) {
    throw new Error(`Failed to fetch retry candidates: ${fetchError.message}`);
  }

  const candidates = (submissions ?? []) as ContactSubmissionRow[];
  const stats: RunStats = { scanned: candidates.length, claimed: 0, dispatchedOk: 0, failed: 0, skipped: 0 };

  if (candidates.length === 0) {
    console.log('[retry-pending-leads] No pending/failed submissions found in retry window.');
    return;
  }

  for (let start = 0; start < candidates.length; start += batchSize) {
    const batch = candidates.slice(start, Math.min(start + batchSize, maxPerRun));

    for (const submission of batch) {
      const { data: claimedRows, error: claimError } = await supabase
        .from('contact_submissions')
        .update({ processing_status: 'processing' })
        .eq('id', submission.id)
        .in('processing_status', statusesToRetry)
        .select('id')
        .limit(1);

      if (claimError) {
        console.warn(`[retry-pending-leads] Claim failed for ${submission.id}: ${claimError.message}`);
        stats.failed += 1;
        continue;
      }

      if (!claimedRows || claimedRows.length === 0) {
        stats.skipped += 1;
        continue;
      }

      stats.claimed += 1;

      const payload: LeadWebhookPayload = {
        submissionId: submission.id,
        fullName: submission.full_name,
        email: submission.email,
        phone: submission.phone ?? '',
        businessName: submission.business_name,
        website: submission.website ?? undefined,
        message: submission.message ?? undefined,
      };

      const dispatchResult = await dispatchLead(webhookUrl, payload, timeoutMs);

      if (dispatchResult.success) {
        stats.dispatchedOk += 1;
        continue;
      }

      const { error: updateError } = await supabase
        .from('contact_submissions')
        .update({ processing_status: 'failed' })
        .eq('id', submission.id);

      if (updateError) {
        console.warn(
          `[retry-pending-leads] Failed to mark ${submission.id} as failed after dispatch error: ${updateError.message}`,
        );
      }

      stats.failed += 1;
      console.warn(
        `[retry-pending-leads] Dispatch failed for ${submission.id} (status=${dispatchResult.status ?? 'n/a'}): ${dispatchResult.error}`,
      );
    }
  }

  console.log(
    `[retry-pending-leads] Completed run: scanned=${stats.scanned}, claimed=${stats.claimed}, dispatched_ok=${stats.dispatchedOk}, failed=${stats.failed}, skipped=${stats.skipped}`,
  );
}

main().catch((error) => {
  console.error('[retry-pending-leads] Fatal error:', error);
  process.exit(1);
});
