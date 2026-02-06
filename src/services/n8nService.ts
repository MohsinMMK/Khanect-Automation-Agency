/**
 * N8N Service for lead processing
 * Replaces Supabase Edge Function invocation with N8N webhook
 */

// Request timeout in milliseconds (10 seconds)
const REQUEST_TIMEOUT_MS = 10000;

function getN8NWebhookUrl(): string | undefined {
  return import.meta.env.VITE_N8N_WEBHOOK_URL;
}

export interface LeadData {
  submissionId: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website?: string;
  message?: string;
}

export type ProcessLeadErrorCode =
  | 'MISSING_CONFIG'
  | 'TIMEOUT'
  | 'HTTP_ERROR'
  | 'NETWORK_ERROR';

export interface ProcessLeadResult {
  success: boolean;
  errorCode?: ProcessLeadErrorCode;
  errorMessage?: string;
  httpStatus?: number;
}

/**
 * Send lead data to N8N webhook for processing
 * N8N handles: lead scoring, database updates, follow-up scheduling
 */
export async function processLead(leadData: LeadData): Promise<ProcessLeadResult> {
  const n8nWebhookUrl = getN8NWebhookUrl();

  if (!n8nWebhookUrl) {
    console.warn('N8N webhook URL not configured - skipping lead processing');
    return {
      success: false,
      errorCode: 'MISSING_CONFIG',
      errorMessage: 'Lead processing not configured',
    };
  }

  // Create AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook error:', response.status, errorText);
      return {
        success: false,
        errorCode: 'HTTP_ERROR',
        httpStatus: response.status,
        errorMessage: errorText || 'Lead processing failed',
      };
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout specifically
    const errorName =
      error instanceof Error
        ? error.name
        : typeof error === 'object' && error !== null && 'name' in error
          ? String((error as { name?: unknown }).name)
          : '';

    if (errorName === 'AbortError') {
      console.error('N8N webhook timeout after', REQUEST_TIMEOUT_MS, 'ms');
      return {
        success: false,
        errorCode: 'TIMEOUT',
        errorMessage: `Request timed out after ${REQUEST_TIMEOUT_MS}ms`,
      };
    }

    console.error('N8N webhook error:', error);
    return {
      success: false,
      errorCode: 'NETWORK_ERROR',
      errorMessage: error instanceof Error ? error.message : 'Failed to connect to lead processing service',
    };
  }
}
