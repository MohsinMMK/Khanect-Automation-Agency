-- Migration: Chatbot Leads Table
-- Description: Store leads captured from the Khanect AI chatbot across all channels

-- Create chatbot_leads table
CREATE TABLE IF NOT EXISTS chatbot_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  business_type TEXT,
  pain_points TEXT,
  source_channel TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chatbot_leads ENABLE ROW LEVEL SECURITY;

-- Service role has full access (for n8n webhook inserts)
CREATE POLICY "Service role full access" ON chatbot_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated portal users can view chatbot leads
CREATE POLICY "Authenticated users can view chatbot_leads"
  ON chatbot_leads
  FOR SELECT
  TO authenticated
  USING (true);

-- Create index on source_channel for filtering
CREATE INDEX IF NOT EXISTS idx_chatbot_leads_source_channel ON chatbot_leads(source_channel);

-- Create index on created_at for date range queries
CREATE INDEX IF NOT EXISTS idx_chatbot_leads_created_at ON chatbot_leads(created_at DESC);

-- Add comment to table
COMMENT ON TABLE chatbot_leads IS 'Leads captured from Khanect AI chatbot across WhatsApp, Instagram, Messenger, and web channels';
