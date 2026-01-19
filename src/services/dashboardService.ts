/**
 * Dashboard Service
 * Fetches aggregated statistics and metrics for the dashboard
 */

import { supabase } from '@/lib/supabase';
import type { DashboardStats, ChartDataPoint } from '@/types/portal';

export interface DashboardServiceError {
  message: string;
  code?: string;
}

export interface DashboardStatsResult {
  success: boolean;
  data?: DashboardStats;
  error?: DashboardServiceError;
}

export interface ChartDataResult {
  success: boolean;
  data?: ChartDataPoint[];
  error?: DashboardServiceError;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStatsResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    // Get current date info for filtering
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    // Fetch all data in parallel
    const [
      totalLeadsResult,
      leadsThisMonthResult,
      leadsLastMonthResult,
      leadScoresResult,
      agentInteractionsResult,
      followupsResult,
    ] = await Promise.all([
      // Total leads
      supabase.from('contact_submissions').select('id', { count: 'exact', head: true }),
      // Leads this month
      supabase.from('contact_submissions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfMonth),
      // Leads last month
      supabase.from('contact_submissions')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startOfLastMonth)
        .lt('created_at', startOfMonth),
      // Lead scores by category
      supabase.from('lead_scores').select('category'),
      // Agent interactions for cost
      supabase.from('agent_interactions')
        .select('total_cost_usd, created_at'),
      // Follow-ups sent
      supabase.from('followup_queue')
        .select('status, created_at')
        .eq('status', 'sent'),
    ]);

    // Calculate totals
    const totalLeads = totalLeadsResult.count || 0;
    const leadsThisMonth = leadsThisMonthResult.count || 0;
    const leadsLastMonth = leadsLastMonthResult.count || 0;

    // Calculate lead change percentage
    const leadsChange = leadsLastMonth > 0 
      ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100)
      : leadsThisMonth > 0 ? 100 : 0;

    // Count leads by category
    const leadCategories = leadScoresResult.data || [];
    const hotLeads = leadCategories.filter(l => l.category === 'hot').length;
    const warmLeads = leadCategories.filter(l => l.category === 'warm').length;
    const coldLeads = leadCategories.filter(l => l.category === 'cold').length;

    // Calculate costs
    const interactions = agentInteractionsResult.data || [];
    const totalCost = interactions.reduce((sum, i) => sum + (i.total_cost_usd || 0), 0);
    const costThisMonth = interactions
      .filter(i => i.created_at >= startOfMonth)
      .reduce((sum, i) => sum + (i.total_cost_usd || 0), 0);

    // Count emails sent
    const followups = followupsResult.data || [];
    const emailsSent = followups.length;
    const emailsThisMonth = followups.filter(f => f.created_at >= startOfMonth).length;

    // Calculate conversion rate (scored leads / total leads)
    const conversionRate = totalLeads > 0 
      ? Math.round((leadCategories.length / totalLeads) * 100)
      : 0;

    const stats: DashboardStats = {
      totalLeads,
      leadsThisMonth,
      leadsChange,
      hotLeads,
      warmLeads,
      coldLeads,
      totalCost: Math.round(totalCost * 100) / 100,
      costThisMonth: Math.round(costThisMonth * 100) / 100,
      emailsSent,
      emailsThisMonth,
      conversionRate,
    };

    return { success: true, data: stats };
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return { success: false, error: { message: 'Failed to fetch dashboard statistics' } };
  }
}

/**
 * Get chart data for leads over time
 */
export async function getLeadsChartData(days = 30): Promise<ChartDataResult> {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' } };
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch leads, interactions, and emails within the date range
    const [leadsResult, interactionsResult, emailsResult] = await Promise.all([
      supabase.from('contact_submissions')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true }),
      supabase.from('agent_interactions')
        .select('created_at, total_cost_usd')
        .gte('created_at', startDate.toISOString()),
      supabase.from('followup_queue')
        .select('created_at')
        .eq('status', 'sent')
        .gte('created_at', startDate.toISOString()),
    ]);

    // Group data by date
    const dataByDate = new Map<string, ChartDataPoint>();

    // Initialize all dates in the range
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const dateKey = date.toISOString().split('T')[0];
      dataByDate.set(dateKey, {
        date: dateKey,
        leads: 0,
        cost: 0,
        emails: 0,
      });
    }

    // Count leads per day
    (leadsResult.data || []).forEach(lead => {
      const dateKey = lead.created_at.split('T')[0];
      const point = dataByDate.get(dateKey);
      if (point) {
        point.leads++;
      }
    });

    // Sum costs per day
    (interactionsResult.data || []).forEach(interaction => {
      const dateKey = interaction.created_at.split('T')[0];
      const point = dataByDate.get(dateKey);
      if (point) {
        point.cost += interaction.total_cost_usd || 0;
      }
    });

    // Count emails per day
    (emailsResult.data || []).forEach(email => {
      const dateKey = email.created_at.split('T')[0];
      const point = dataByDate.get(dateKey);
      if (point) {
        point.emails++;
      }
    });

    // Convert to array and round costs
    const chartData = Array.from(dataByDate.values()).map(point => ({
      ...point,
      cost: Math.round(point.cost * 100) / 100,
    }));

    return { success: true, data: chartData };
  } catch (err) {
    console.error('Error fetching chart data:', err);
    return { success: false, error: { message: 'Failed to fetch chart data' } };
  }
}

/**
 * Get recent activity for the dashboard
 */
export async function getRecentActivity(limit = 10) {
  if (!supabase) {
    return { success: false, error: { message: 'Database not configured' }, data: [] };
  }

  try {
    const { data, error } = await supabase
      .from('agent_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activity:', error);
      return { success: false, error: { message: error.message }, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching activity:', err);
    return { success: false, error: { message: 'Failed to fetch activity' }, data: [] };
  }
}
