/**
 * Automation Service
 * Triggers N8N workflows for manual follow-ups and other automations
 */

const N8N_WEBHOOK_BASE = import.meta.env.VITE_N8N_WEBHOOK_URL?.replace('/lead-processor', '') || '';

// Request timeout in milliseconds (15 seconds)
const REQUEST_TIMEOUT_MS = 15000;

export interface TriggerFollowUpPayload {
  leadId: string;
  emailType: 'welcome' | 'value_prop' | 'case_study' | 'demo_invite' | 'check_in' | 'final';
  scheduledFor?: string; // ISO date string, defaults to immediate
}

export interface CancelFollowUpPayload {
  followupId: string;
}

export interface ResendEmailPayload {
  followupId: string;
}

export interface AutomationResult {
  success: boolean;
  error?: string;
}

/**
 * Trigger a follow-up email for a lead
 * Calls N8N webhook: POST /webhook/trigger-followup
 */
export async function triggerFollowUp(payload: TriggerFollowUpPayload): Promise<AutomationResult> {
  const webhookUrl = `${N8N_WEBHOOK_BASE}/trigger-followup`;

  if (!N8N_WEBHOOK_BASE) {
    console.warn('N8N webhook URL not configured');
    return { success: false, error: 'Automation service not configured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        scheduledFor: payload.scheduledFor || new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Trigger follow-up error:', response.status, errorText);
      return { success: false, error: 'Failed to trigger follow-up' };
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please try again.' };
    }

    console.error('Trigger follow-up error:', error);
    return { success: false, error: 'Failed to connect to automation service' };
  }
}

/**
 * Cancel a scheduled follow-up email
 * Calls N8N webhook: POST /webhook/cancel-followup
 */
export async function cancelFollowUp(payload: CancelFollowUpPayload): Promise<AutomationResult> {
  const webhookUrl = `${N8N_WEBHOOK_BASE}/cancel-followup`;

  if (!N8N_WEBHOOK_BASE) {
    console.warn('N8N webhook URL not configured');
    return { success: false, error: 'Automation service not configured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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
      console.error('Cancel follow-up error:', response.status, errorText);
      return { success: false, error: 'Failed to cancel follow-up' };
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please try again.' };
    }

    console.error('Cancel follow-up error:', error);
    return { success: false, error: 'Failed to connect to automation service' };
  }
}

/**
 * Resend a failed follow-up email
 * Calls N8N webhook: POST /webhook/resend-email
 */
export async function resendEmail(payload: ResendEmailPayload): Promise<AutomationResult> {
  const webhookUrl = `${N8N_WEBHOOK_BASE}/resend-email`;

  if (!N8N_WEBHOOK_BASE) {
    console.warn('N8N webhook URL not configured');
    return { success: false, error: 'Automation service not configured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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
      console.error('Resend email error:', response.status, errorText);
      return { success: false, error: 'Failed to resend email' };
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please try again.' };
    }

    console.error('Resend email error:', error);
    return { success: false, error: 'Failed to connect to automation service' };
  }
}

/**
 * Mark a lead as contacted (updates processing_status)
 */
export async function markLeadAsContacted(leadId: string): Promise<AutomationResult> {
  // This would typically call a Supabase update directly
  // But for consistency, we'll use N8N to handle status updates
  const webhookUrl = `${N8N_WEBHOOK_BASE}/mark-contacted`;

  if (!N8N_WEBHOOK_BASE) {
    console.warn('N8N webhook URL not configured');
    return { success: false, error: 'Automation service not configured' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leadId }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Mark contacted error:', response.status, errorText);
      return { success: false, error: 'Failed to update lead status' };
    }

    return { success: true };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please try again.' };
    }

    console.error('Mark contacted error:', error);
    return { success: false, error: 'Failed to connect to automation service' };
  }
}
