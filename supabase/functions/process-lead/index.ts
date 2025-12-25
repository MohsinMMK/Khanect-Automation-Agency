/**
 * Process Lead Edge Function
 * Qualifies and scores leads using OpenAI GPT-4
 * Schedules automated follow-up emails based on lead quality
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { OpenAIClient, MODELS, calculateCost } from '../_shared/openai-client.ts';

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lead qualification system prompt
const LEAD_QUALIFICATION_PROMPT = `You are an expert lead qualification AI for Khanect Automation Agency, a company that provides AI automation services including workflow automation, AI chatbots, CRM integrations, and lead generation systems.

Analyze the provided contact submission and score the lead. Consider that our target customers are businesses looking to automate their operations and scale efficiently.

## Scoring Criteria (0-100):

### Business Indicators (40 points max):
- Has a website: +10 points
- Website appears professional/established: +5-15 points
- Business name suggests established company: +5-10 points
- Industry alignment with our services (Healthcare, Automobile, E-Commerce, Real Estate, Coaching, Agency): +5-10 points

### Contact Quality (30 points max):
- Professional email domain (not gmail/yahoo/hotmail): +15 points
- Complete phone number provided: +5 points
- Full name provided properly (not single word): +5 points
- Website URL provided: +5 points

### Urgency/Intent Signals (30 points max):
- Business appears to have automation needs based on industry: +10-20 points
- Contact details are complete and professional: +5-10 points

## Categories:
- HOT (80-100): Ready to buy, high-value potential - immediate follow-up required
- WARM (50-79): Good fit, needs nurturing - standard follow-up sequence
- COLD (25-49): Potential future customer - nurture sequence
- UNQUALIFIED (0-24): Poor fit or incomplete information - minimal follow-up

## Follow-up Sequences:
- immediate: HOT leads - same day response, demo offer
- standard: WARM leads - 3-email sequence over 1 week
- nurture: COLD leads - 5-email sequence over 3 weeks
- minimal: UNQUALIFIED - single acknowledgment email only

You MUST respond with a valid JSON object only, no additional text.`;

// Request interface
interface ProcessLeadRequest {
  submissionId: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website?: string;
}

// Lead score result interface
interface LeadScoreResult {
  score: number;
  category: 'hot' | 'warm' | 'cold' | 'unqualified';
  reasoning: string;
  budget_indicator: 'high' | 'medium' | 'low' | 'unknown';
  urgency_indicator: 'high' | 'medium' | 'low';
  decision_maker_likelihood: number;
  industry_fit_score: number;
  recommended_followup_sequence: 'immediate' | 'standard' | 'nurture' | 'minimal';
  key_talking_points: string[];
}

// Follow-up email schedule based on sequence type
const FOLLOWUP_SCHEDULES: Record<string, { type: string; delayHours: number }[]> = {
  immediate: [
    { type: 'welcome', delayHours: 0 },
    { type: 'demo_invite', delayHours: 4 },
    { type: 'check_in', delayHours: 24 },
  ],
  standard: [
    { type: 'welcome', delayHours: 1 },
    { type: 'value_prop', delayHours: 48 },
    { type: 'demo_invite', delayHours: 120 },
  ],
  nurture: [
    { type: 'welcome', delayHours: 1 },
    { type: 'value_prop', delayHours: 72 },
    { type: 'case_study', delayHours: 168 },
    { type: 'demo_invite', delayHours: 336 },
    { type: 'final', delayHours: 504 },
  ],
  minimal: [{ type: 'welcome', delayHours: 1 }],
};

// Schedule follow-up emails
async function scheduleFollowups(
  contactSubmissionId: string,
  leadScoreId: string,
  sequenceType: string
): Promise<void> {
  const schedule = FOLLOWUP_SCHEDULES[sequenceType] || FOLLOWUP_SCHEDULES.minimal;
  const now = new Date();

  const followups = schedule.map((item, index) => ({
    contact_submission_id: contactSubmissionId,
    lead_score_id: leadScoreId,
    sequence_number: index + 1,
    email_type: item.type,
    scheduled_for: new Date(now.getTime() + item.delayHours * 60 * 60 * 1000).toISOString(),
    status: 'pending',
  }));

  const { error } = await supabase.from('followup_queue').insert(followups);

  if (error) {
    console.error('Error scheduling followups:', error);
  } else {
    console.log(`Scheduled ${followups.length} follow-up emails for lead ${contactSubmissionId}`);
  }
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const leadData: ProcessLeadRequest = await req.json();

    if (!leadData.submissionId || !leadData.email) {
      return errorResponse('Missing required fields: submissionId and email', 400);
    }

    // Update contact submission status to processing
    await supabase
      .from('contact_submissions')
      .update({ processing_status: 'processing' })
      .eq('id', leadData.submissionId);

    // Build the prompt with lead information
    const leadInfo = `
## Lead Information:
- Full Name: ${leadData.fullName}
- Email: ${leadData.email}
- Phone: ${leadData.phone}
- Business Name: ${leadData.businessName}
- Website: ${leadData.website || 'Not provided'}
- Submission Time: ${new Date().toISOString()}

Analyze this lead and provide your assessment as a JSON object with the following structure:
{
  "score": <number 0-100>,
  "category": "<hot|warm|cold|unqualified>",
  "reasoning": "<brief explanation>",
  "budget_indicator": "<high|medium|low|unknown>",
  "urgency_indicator": "<high|medium|low>",
  "decision_maker_likelihood": <number 0-100>,
  "industry_fit_score": <number 0-100>,
  "recommended_followup_sequence": "<immediate|standard|nurture|minimal>",
  "key_talking_points": ["<point1>", "<point2>", "<point3>"]
}`;

    // Get OpenAI client
    const openai = new OpenAIClient();

    // Call GPT-4 for lead qualification (use full model for quality)
    const response = await openai.createChatCompletion({
      model: MODELS.GPT4O,
      messages: [
        { role: 'system', content: LEAD_QUALIFICATION_PROMPT },
        { role: 'user', content: leadInfo },
      ],
      max_tokens: 1024,
      temperature: 0.3, // Lower temperature for more consistent scoring
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    // Parse the JSON response
    let leadScore: LeadScoreResult;
    try {
      // Extract JSON from response (handle potential markdown code blocks)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      leadScore = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Default to warm lead if parsing fails
      leadScore = {
        score: 50,
        category: 'warm',
        reasoning: 'Unable to fully analyze - defaulting to warm lead',
        budget_indicator: 'unknown',
        urgency_indicator: 'medium',
        decision_maker_likelihood: 50,
        industry_fit_score: 50,
        recommended_followup_sequence: 'standard',
        key_talking_points: ['Follow up to learn more about their needs'],
      };
    }

    // Store lead score in database
    const { data: leadScoreData, error: leadScoreError } = await supabase
      .from('lead_scores')
      .insert({
        contact_submission_id: leadData.submissionId,
        score: leadScore.score,
        category: leadScore.category,
        reasoning: leadScore.reasoning,
        budget_indicator: leadScore.budget_indicator,
        urgency_indicator: leadScore.urgency_indicator,
        decision_maker_likelihood: leadScore.decision_maker_likelihood,
        industry_fit_score: leadScore.industry_fit_score,
        ai_analysis: {
          key_talking_points: leadScore.key_talking_points,
          recommended_followup_sequence: leadScore.recommended_followup_sequence,
          raw_response: aiResponse,
        },
      })
      .select()
      .single();

    if (leadScoreError) {
      console.error('Error storing lead score:', leadScoreError);
    }

    // Schedule follow-up emails
    if (leadScoreData) {
      await scheduleFollowups(
        leadData.submissionId,
        leadScoreData.id,
        leadScore.recommended_followup_sequence
      );
    }

    // Update contact submission status to completed
    await supabase
      .from('contact_submissions')
      .update({
        processing_status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', leadData.submissionId);

    // Track interaction for cost monitoring
    const cost = calculateCost(MODELS.GPT4O, inputTokens, outputTokens);
    await supabase.from('agent_interactions').insert({
      interaction_type: 'lead_processing',
      contact_submission_id: leadData.submissionId,
      model_used: MODELS.GPT4O,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_cost_usd: cost,
      success: true,
    });

    return jsonResponse({
      success: true,
      leadScore: {
        score: leadScore.score,
        category: leadScore.category,
        reasoning: leadScore.reasoning,
      },
      followupsScheduled: FOLLOWUP_SCHEDULES[leadScore.recommended_followup_sequence]?.length || 0,
    });
  } catch (error) {
    console.error('Process lead error:', error);

    // Track failed interaction
    try {
      await supabase.from('agent_interactions').insert({
        interaction_type: 'lead_processing',
        model_used: MODELS.GPT4O,
        success: false,
        error_message: error.message,
      });
    } catch {
      // Ignore tracking errors
    }

    return errorResponse(error.message || 'Failed to process lead', 500);
  }
});
