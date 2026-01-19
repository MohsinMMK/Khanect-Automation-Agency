/**
 * Activity Service
 * Fetches AI agent interactions and activity logs from Supabase
 */

import { supabase } from '@/lib/supabase';
import type { Activity, ActivityType } from '@/types/portal';

export interface ActivityFilters {
  type?: ActivityType[];
  dateFrom?: string;
  dateTo?: string;
  success?: boolean;
}

export interface ActivityResult {
  success: boolean;
  data?: Activity[];
  error?: { message: string };
  count?: number;
}

/**
 * Fetch activity logs with optional filters
 */
export async function getActivities(
  filters?: ActivityFilters,
  page = 1,
  pageSize = 20
): Promise<ActivityResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    let query = supabase
      .from('agent_interactions')
      .select('*', { count: 'exact' });

    // Apply type filter
    if (filters?.type && filters.type.length > 0) {
      query = query.in('interaction_type', filters.type);
    }

    // Apply date range filters
    if (filters?.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    // Apply success filter
    if (filters?.success !== undefined) {
      query = query.eq('success', filters.success);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by created_at descending (newest first)
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching activities:', error);
      return { success: false, error: { message: error.message } };
    }

    const activities: Activity[] = (data || []).map((row: any) => ({
      id: row.id,
      interaction_type: row.interaction_type,
      session_id: row.session_id,
      contact_submission_id: row.contact_submission_id,
      model_used: row.model_used,
      input_tokens: row.input_tokens,
      output_tokens: row.output_tokens,
      total_cost_usd: row.total_cost_usd,
      latency_ms: row.latency_ms,
      success: row.success,
      error_message: row.error_message,
      created_at: row.created_at,
    }));

    return { success: true, data: activities, count: count || 0 };
  } catch (err) {
    console.error('Unexpected error fetching activities:', err);
    return { success: false, error: { message: 'An unexpected error occurred' } };
  }
}

/**
 * Get activity statistics
 */
export async function getActivityStats() {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();

    const [totalResult, todayResult, weekResult, failedResult] = await Promise.all([
      supabase.from('agent_interactions').select('id', { count: 'exact', head: true }),
      supabase.from('agent_interactions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfDay),
      supabase.from('agent_interactions')
        .select('total_cost_usd')
        .gte('created_at', startOfWeek),
      supabase.from('agent_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('success', false),
    ]);

    const totalInteractions = totalResult.count || 0;
    const todayInteractions = todayResult.count || 0;
    const weekCost = (weekResult.data || []).reduce((sum, i) => sum + (i.total_cost_usd || 0), 0);
    const failedInteractions = failedResult.count || 0;

    return {
      success: true,
      data: {
        totalInteractions,
        todayInteractions,
        weekCost: Math.round(weekCost * 100) / 100,
        failedInteractions,
        successRate: totalInteractions > 0 
          ? Math.round(((totalInteractions - failedInteractions) / totalInteractions) * 100)
          : 100,
      },
    };
  } catch (err) {
    console.error('Error fetching activity stats:', err);
    return { success: false, error: { message: 'Failed to fetch activity statistics' } };
  }
}
