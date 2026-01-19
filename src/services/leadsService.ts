/**
 * Leads Service
 * Handles fetching and managing lead data from Supabase
 */

import { supabase } from '@/lib/supabase';
import type { Lead, LeadScore, FollowUp, LeadFilters, PaginatedResponse } from '@/types/portal';

export interface LeadsServiceError {
  message: string;
  code?: string;
}

export interface LeadsResult {
  success: boolean;
  data?: Lead[];
  error?: LeadsServiceError;
  count?: number;
}

export interface LeadResult {
  success: boolean;
  data?: Lead;
  error?: LeadsServiceError;
}

/**
 * Fetch all leads with optional filters and pagination
 */
export async function getLeads(
  filters?: LeadFilters,
  page = 1,
  pageSize = 20
): Promise<LeadsResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    // Start building the query
    let query = supabase
      .from('contact_submissions')
      .select(`
        *,
        lead_scores (
          id,
          score,
          category,
          reasoning,
          budget_indicator,
          urgency_indicator,
          decision_maker_likelihood,
          industry_fit_score,
          engagement_score,
          created_at
        )
      `, { count: 'exact' });

    // Apply search filter
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},business_name.ilike.${searchTerm}`);
    }

    // Apply category filter (from lead_scores)
    // Note: This requires a more complex join approach in Supabase
    // For now, we'll filter client-side after fetching

    // Apply status filter
    if (filters?.status && filters.status.length > 0) {
      query = query.in('processing_status', filters.status);
    }

    // Apply date range filters
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by created_at descending (newest first)
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching leads:', error);
      return { success: false, error: { message: error.message, code: error.code } };
    }

    // Transform the data to match our Lead interface
    const leads: Lead[] = (data || []).map((row: any) => ({
      id: row.id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      business_name: row.business_name,
      website: row.website,
      message: row.message,
      processing_status: row.processing_status || 'pending',
      processed_at: row.processed_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      // Get the first (most recent) lead score if exists
      lead_score: row.lead_scores?.[0] ? {
        id: row.lead_scores[0].id,
        contact_submission_id: row.id,
        score: row.lead_scores[0].score,
        category: row.lead_scores[0].category,
        reasoning: row.lead_scores[0].reasoning,
        budget_indicator: row.lead_scores[0].budget_indicator,
        urgency_indicator: row.lead_scores[0].urgency_indicator,
        decision_maker_likelihood: row.lead_scores[0].decision_maker_likelihood,
        industry_fit_score: row.lead_scores[0].industry_fit_score,
        engagement_score: row.lead_scores[0].engagement_score,
        created_at: row.lead_scores[0].created_at,
      } : undefined,
    }));

    // Client-side category filter (if needed)
    let filteredLeads = leads;
    if (filters?.category && filters.category.length > 0) {
      filteredLeads = leads.filter(lead => 
        lead.lead_score && filters.category!.includes(lead.lead_score.category)
      );
    }

    return { 
      success: true, 
      data: filteredLeads,
      count: count || 0
    };
  } catch (err) {
    console.error('Unexpected error fetching leads:', err);
    return { success: false, error: { message: 'An unexpected error occurred' } };
  }
}

/**
 * Fetch a single lead by ID with full details including follow-ups
 */
export async function getLeadById(id: string): Promise<LeadResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    // Fetch the lead with lead_scores and followup_queue
    const { data, error } = await supabase
      .from('contact_submissions')
      .select(`
        *,
        lead_scores (
          id,
          score,
          category,
          reasoning,
          budget_indicator,
          urgency_indicator,
          decision_maker_likelihood,
          industry_fit_score,
          engagement_score,
          ai_analysis,
          created_at,
          updated_at
        ),
        followup_queue (
          id,
          sequence_number,
          email_type,
          scheduled_for,
          sent_at,
          status,
          email_subject,
          email_body,
          error_message,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching lead:', error);
      return { success: false, error: { message: error.message, code: error.code } };
    }

    if (!data) {
      return { success: false, error: { message: 'Lead not found' } };
    }

    // Transform the data
    const lead: Lead = {
      id: data.id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      business_name: data.business_name,
      website: data.website,
      message: data.message,
      processing_status: data.processing_status || 'pending',
      processed_at: data.processed_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      lead_score: data.lead_scores?.[0] ? {
        id: data.lead_scores[0].id,
        contact_submission_id: data.id,
        score: data.lead_scores[0].score,
        category: data.lead_scores[0].category,
        reasoning: data.lead_scores[0].reasoning,
        budget_indicator: data.lead_scores[0].budget_indicator,
        urgency_indicator: data.lead_scores[0].urgency_indicator,
        decision_maker_likelihood: data.lead_scores[0].decision_maker_likelihood,
        industry_fit_score: data.lead_scores[0].industry_fit_score,
        engagement_score: data.lead_scores[0].engagement_score,
        ai_analysis: data.lead_scores[0].ai_analysis,
        created_at: data.lead_scores[0].created_at,
        updated_at: data.lead_scores[0].updated_at,
      } : undefined,
      followups: (data.followup_queue || []).map((f: any) => ({
        id: f.id,
        contact_submission_id: data.id,
        sequence_number: f.sequence_number,
        email_type: f.email_type,
        scheduled_for: f.scheduled_for,
        sent_at: f.sent_at,
        status: f.status,
        email_subject: f.email_subject,
        email_body: f.email_body,
        error_message: f.error_message,
        created_at: f.created_at,
      })).sort((a: FollowUp, b: FollowUp) => a.sequence_number - b.sequence_number),
    };

    return { success: true, data: lead };
  } catch (err) {
    console.error('Unexpected error fetching lead:', err);
    return { success: false, error: { message: 'An unexpected error occurred' } };
  }
}

/**
 * Update a lead's processing status
 */
export async function updateLeadStatus(
  id: string,
  status: Lead['processing_status']
): Promise<LeadResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ 
        processing_status: status,
        processed_at: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead status:', error);
      return { success: false, error: { message: error.message, code: error.code } };
    }

    return { success: true, data: data as Lead };
  } catch (err) {
    console.error('Unexpected error updating lead:', err);
    return { success: false, error: { message: 'An unexpected error occurred' } };
  }
}
