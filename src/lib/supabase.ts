import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../utils/env';

// Get Supabase configuration from environment variables
const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Validate configuration
const isValidSupabaseConfig =
  supabaseUrl &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 20;

if (!isValidSupabaseConfig && import.meta.env.DEV) {
  console.error(
    '⚠️ Supabase not configured! Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  );
}

// Create and export the Supabase client
export const supabase = isValidSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Type definitions for our database
export interface Client {
  id: string;
  user_id: string;
  email: string;
  business_name: string;
  full_name: string | null;
  phone: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  website: string | null;
  created_at: string;
}
