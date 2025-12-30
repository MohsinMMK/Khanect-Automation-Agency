/**
 * N8N Service for lead processing
 * Replaces Supabase Edge Function invocation with N8N webhook
 */

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

interface LeadData {
  submissionId: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website?: string;
  message?: string;
}

interface ProcessLeadResult {
  success: boolean;
  error?: string;
}

/**
 * Send lead data to N8N webhook for processing
 * N8N handles: lead scoring, database updates, follow-up scheduling
 */
export async function processLead(leadData: LeadData): Promise<ProcessLeadResult> {
  if (!N8N_WEBHOOK_URL) {
    console.warn('N8N webhook URL not configured - skipping lead processing');
    return { success: false, error: 'Lead processing not configured' };
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('N8N webhook error:', response.status, errorText);
      return { success: false, error: 'Lead processing failed' };
    }

    return { success: true };
  } catch (error) {
    console.error('N8N webhook error:', error);
    return { success: false, error: 'Failed to connect to lead processing service' };
  }
}
