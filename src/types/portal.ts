/**
 * Portal Type Definitions
 * Types for the client portal, leads management, and activity tracking
 */

// ============================================================================
// Client Types
// ============================================================================

export interface Client {
  id: string;
  user_id: string;
  business_name: string;
  full_name?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'pending';
  notification_preferences?: NotificationPreferences;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationPreferences {
  email_new_leads: boolean;
  email_lead_scored: boolean;
  email_weekly_digest: boolean;
  email_followup_sent: boolean;
}

// ============================================================================
// Lead Types
// ============================================================================

export interface Lead {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  business_name: string;
  website?: string;
  message?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at?: string;
  created_at: string;
  updated_at?: string;
  // Joined data
  lead_score?: LeadScore;
  followups?: FollowUp[];
}

export interface LeadScore {
  id: string;
  contact_submission_id: string;
  score: number; // 0-100
  category: 'hot' | 'warm' | 'cold' | 'unqualified';
  reasoning?: string;
  budget_indicator?: 'high' | 'medium' | 'low' | 'unknown';
  urgency_indicator?: 'high' | 'medium' | 'low';
  decision_maker_likelihood?: number; // 0-100
  industry_fit_score?: number; // 0-100
  engagement_score?: number; // 0-100
  ai_analysis?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
}

export type LeadCategory = LeadScore['category'];
export type LeadProcessingStatus = Lead['processing_status'];

// ============================================================================
// Follow-up Types
// ============================================================================

export interface FollowUp {
  id: string;
  contact_submission_id: string;
  lead_score_id?: string;
  sequence_number: number;
  email_type: FollowUpEmailType;
  scheduled_for: string;
  sent_at?: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  email_subject?: string;
  email_body?: string;
  error_message?: string;
  created_at: string;
  updated_at?: string;
}

export type FollowUpEmailType = 
  | 'welcome' 
  | 'value_prop' 
  | 'case_study' 
  | 'demo_invite' 
  | 'check_in' 
  | 'final';

export type FollowUpStatus = FollowUp['status'];

// ============================================================================
// Activity Types
// ============================================================================

export interface Activity {
  id: string;
  interaction_type: ActivityType;
  session_id?: string;
  contact_submission_id?: string;
  model_used: string;
  input_tokens?: number;
  output_tokens?: number;
  total_cost_usd?: number;
  latency_ms?: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export type ActivityType = 'chat' | 'lead_processing' | 'email_generation';

// ============================================================================
// Dashboard Types
// ============================================================================

export interface DashboardStats {
  totalLeads: number;
  leadsThisMonth: number;
  leadsChange: number; // percentage change from last month
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  totalCost: number;
  costThisMonth: number;
  emailsSent: number;
  emailsThisMonth: number;
  conversionRate: number;
}

export interface ChartDataPoint {
  date: string;
  leads: number;
  cost: number;
  emails: number;
}

// ============================================================================
// Filter & Pagination Types
// ============================================================================

export interface LeadFilters {
  search?: string;
  category?: LeadCategory[];
  status?: LeadProcessingStatus[];
  dateFrom?: string;
  dateTo?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationState;
}

export interface ApiError {
  message: string;
  code?: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface ProfileFormData {
  full_name: string;
  phone: string;
  business_name: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
