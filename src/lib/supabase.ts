import { createClient } from '@supabase/supabase-js';

// Re-export portal types for convenience
export type { Client, Lead, LeadScore, FollowUp, Activity } from '@/types/portal';

const supabaseUrl = 'https://ddmbekdbwuolpsjdhgub.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbWJla2Rid3VvbHBzamRoZ3ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2NjcwOTQsImV4cCI6MjA4MjI0MzA5NH0.pILblItw_ExkIekfSH6Jk75zZZU3SQrLDS4ZjGaAnxE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
