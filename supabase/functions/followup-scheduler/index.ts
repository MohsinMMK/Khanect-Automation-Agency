/**
 * Follow-up Scheduler Edge Function
 * Sends scheduled follow-up emails using Resend and GPT-4
 * Triggered by Supabase pg_cron or manually
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { OpenAIClient, MODELS, calculateCost } from '../_shared/openai-client.ts';

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Resend API
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Khanect <hello@khanect.com>';

// Email generation system prompt
const EMAIL_GENERATION_PROMPT = `You are an email copywriter for Khanect Automation Agency. Generate personalized follow-up emails based on lead information and email type.

## About Khanect:
Khanect Automation Agency provides AI-powered automation solutions including workflow automation, AI chatbots, CRM integrations, and lead generation systems.

## Email Types:
1. WELCOME - Initial thank you and value proposition introduction
2. VALUE_PROP - Deep dive into specific service benefits relevant to their business
3. CASE_STUDY - Share relevant success stories from similar businesses
4. DEMO_INVITE - Direct invitation to book a demo with clear value proposition
5. CHECK_IN - Friendly follow-up checking if they have questions
6. FINAL - Last attempt with special offer or alternative contact method

## Guidelines:
- Keep emails concise (150-250 words)
- Personalize based on business name and any available context
- Focus on value and ROI, not features
- Include clear CTA (call-to-action)
- Sound human and helpful, not salesy
- Use the lead's first name naturally
- Don't use exclamation marks excessively

## Output Format (JSON only):
{
  "subject": "Email subject line (max 60 chars)",
  "body": "Full email body in plain text with natural paragraph breaks",
  "cta_text": "Call-to-action button text",
  "cta_url": "https://khanect.com#contact"
}`;

// Email type descriptions for context
const EMAIL_TYPE_CONTEXT: Record<string, string> = {
  welcome: 'Welcome email thanking them for their interest and briefly introducing Khanect',
  value_prop: 'Email highlighting specific automation benefits and ROI potential for their business type',
  case_study: 'Email sharing a relevant success story or client result',
  demo_invite: 'Direct invitation to book a personalized demo',
  check_in: 'Friendly check-in asking if they have questions or need more information',
  final: 'Final outreach with special offer or alternative ways to connect',
};

// Contact submission interface
interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  business_name: string;
  website: string | null;
}

// Followup queue item interface
interface FollowupItem {
  id: string;
  contact_submission_id: string;
  lead_score_id: string | null;
  sequence_number: number;
  email_type: string;
  scheduled_for: string;
  status: string;
}

// Lead score interface
interface LeadScore {
  score: number;
  category: string;
  reasoning: string;
  ai_analysis: {
    key_talking_points?: string[];
  };
}

// Send email using Resend
async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured - email sending disabled');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html: htmlBody,
        text: textBody,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Escape HTML entities to prevent XSS in emails
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitize URL for safe use in href attributes
 * Only allow http/https protocols
 */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  // Only allow http and https protocols
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return '#';
  }
  return escapeHtml(trimmed);
}

// Convert plain text to simple HTML with XSS protection
function textToHtml(text: string, ctaText?: string, ctaUrl?: string): string {
  // Escape HTML in text content, then convert newlines
  const escapedText = escapeHtml(text);
  const paragraphs = escapedText.split('\n\n').map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`);

  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${paragraphs.join('')}
  `;

  if (ctaText && ctaUrl) {
    const safeCtaText = escapeHtml(ctaText);
    const safeCtaUrl = sanitizeUrl(ctaUrl);
    html += `
      <p style="margin-top: 24px;">
        <a href="${safeCtaUrl}" style="display: inline-block; background-color: #D3F36B; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
          ${safeCtaText}
        </a>
      </p>
    `;
  }

  html += `
      <hr style="margin-top: 32px; border: none; border-top: 1px solid #e5e5e5;">
      <p style="font-size: 12px; color: #666;">
        Khanect Automation Agency<br>
        Making Deep Work Possible
      </p>
    </div>
  `;

  return html;
}

// Process a single followup item
async function processFollowup(
  followup: FollowupItem,
  contact: ContactSubmission,
  leadScore: LeadScore | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const openai = new OpenAIClient();

    // Build context for email generation
    const firstName = contact.full_name.split(' ')[0];
    const context = `
## Lead Information:
- Name: ${contact.full_name} (use "${firstName}" in the email)
- Business: ${contact.business_name}
- Website: ${contact.website || 'Not provided'}
- Email Type: ${followup.email_type.toUpperCase()}
- Email Purpose: ${EMAIL_TYPE_CONTEXT[followup.email_type] || 'General follow-up'}
- Sequence Number: ${followup.sequence_number} of the follow-up sequence
${leadScore ? `
## Lead Analysis:
- Score: ${leadScore.score}/100 (${leadScore.category})
- Key Points: ${leadScore.ai_analysis?.key_talking_points?.join(', ') || 'Focus on automation benefits'}
` : ''}

Generate a personalized ${followup.email_type} email for this lead.`;

    // Generate email with GPT-4o-mini (cost-effective for email generation)
    const response = await openai.createChatCompletion({
      model: MODELS.GPT4O_MINI,
      messages: [
        { role: 'system', content: EMAIL_GENERATION_PROMPT },
        { role: 'user', content: context },
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    // Parse email content
    let emailContent: { subject: string; body: string; cta_text?: string; cta_url?: string };
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found');
      emailContent = JSON.parse(jsonMatch[0]);
    } catch {
      console.error('Failed to parse email content:', aiResponse);
      return { success: false, error: 'Failed to generate email content' };
    }

    // Convert to HTML
    const htmlBody = textToHtml(emailContent.body, emailContent.cta_text, emailContent.cta_url);

    // Send the email
    const emailResult = await sendEmail(
      contact.email,
      emailContent.subject,
      htmlBody,
      emailContent.body
    );

    // Update followup record
    await supabase
      .from('followup_queue')
      .update({
        status: emailResult.success ? 'sent' : 'failed',
        sent_at: emailResult.success ? new Date().toISOString() : null,
        email_subject: emailContent.subject,
        email_body: emailContent.body,
        error_message: emailResult.error || null,
      })
      .eq('id', followup.id);

    // Track interaction
    const cost = calculateCost(MODELS.GPT4O_MINI, inputTokens, outputTokens);
    await supabase.from('agent_interactions').insert({
      interaction_type: 'email_generation',
      contact_submission_id: contact.id,
      model_used: MODELS.GPT4O_MINI,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_cost_usd: cost,
      success: emailResult.success,
      error_message: emailResult.error,
    });

    return emailResult;
  } catch (error) {
    console.error('Process followup error:', error);
    return { success: false, error: error.message };
  }
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get pending followups that are scheduled for now or earlier
    const { data: pendingFollowups, error: fetchError } = await supabase
      .from('followup_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(10); // Process max 10 at a time

    if (fetchError) {
      console.error('Error fetching followups:', fetchError);
      return errorResponse('Failed to fetch pending followups', 500);
    }

    if (!pendingFollowups || pendingFollowups.length === 0) {
      return jsonResponse({ message: 'No pending followups to process', processed: 0 });
    }

    console.log(`Processing ${pendingFollowups.length} pending followups`);

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const followup of pendingFollowups) {
      // Get contact submission
      const { data: contact, error: contactError } = await supabase
        .from('contact_submissions')
        .select('*')
        .eq('id', followup.contact_submission_id)
        .single();

      if (contactError || !contact) {
        console.error('Contact not found:', followup.contact_submission_id);
        results.push({ id: followup.id, success: false, error: 'Contact not found' });
        continue;
      }

      // Get lead score if available
      let leadScore: LeadScore | null = null;
      if (followup.lead_score_id) {
        const { data: scoreData } = await supabase
          .from('lead_scores')
          .select('score, category, reasoning, ai_analysis')
          .eq('id', followup.lead_score_id)
          .single();
        leadScore = scoreData;
      }

      // Process the followup
      const result = await processFollowup(followup, contact, leadScore);
      results.push({ id: followup.id, success: result.success, error: result.error });

      // Small delay between emails to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return jsonResponse({
      message: `Processed ${results.length} followups`,
      success: successCount,
      failed: failCount,
      results,
    });
  } catch (error) {
    console.error('Followup scheduler error:', error);
    return errorResponse(error.message || 'Failed to process followups', 500);
  }
});
