-- Migration: Add AI Agentic Workflow Tables
-- Description: Creates tables for conversation history, lead scoring, and follow-up automation

-- 1. Conversation History Table
-- Stores all chat conversations for context and analytics
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model_used TEXT,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for conversation history
CREATE INDEX IF NOT EXISTS idx_conversation_session ON conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created ON conversation_history(created_at);

-- 2. Lead Scores Table
-- Stores AI-generated lead qualification scores
CREATE TABLE IF NOT EXISTS lead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_submission_id UUID REFERENCES contact_submissions(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  category TEXT NOT NULL CHECK (category IN ('hot', 'warm', 'cold', 'unqualified')),
  reasoning TEXT,
  budget_indicator TEXT CHECK (budget_indicator IN ('high', 'medium', 'low', 'unknown')),
  urgency_indicator TEXT CHECK (urgency_indicator IN ('high', 'medium', 'low')),
  decision_maker_likelihood INTEGER CHECK (decision_maker_likelihood >= 0 AND decision_maker_likelihood <= 100),
  industry_fit_score INTEGER CHECK (industry_fit_score >= 0 AND industry_fit_score <= 100),
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lead scores
CREATE INDEX IF NOT EXISTS idx_lead_scores_category ON lead_scores(category);
CREATE INDEX IF NOT EXISTS idx_lead_scores_score ON lead_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_lead_scores_contact ON lead_scores(contact_submission_id);

-- 3. Follow-up Queue Table
-- Manages automated email sequences
CREATE TABLE IF NOT EXISTS followup_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_submission_id UUID REFERENCES contact_submissions(id) ON DELETE CASCADE,
  lead_score_id UUID REFERENCES lead_scores(id) ON DELETE SET NULL,
  sequence_number INTEGER NOT NULL DEFAULT 1,
  email_type TEXT NOT NULL CHECK (email_type IN ('welcome', 'value_prop', 'case_study', 'demo_invite', 'check_in', 'final')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  email_subject TEXT,
  email_body TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for follow-up queue
CREATE INDEX IF NOT EXISTS idx_followup_status ON followup_queue(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_followup_contact ON followup_queue(contact_submission_id);

-- 4. Agent Interactions Table
-- Tracks AI usage for cost monitoring
CREATE TABLE IF NOT EXISTS agent_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('chat', 'lead_processing', 'email_generation')),
  session_id TEXT,
  contact_submission_id UUID REFERENCES contact_submissions(id) ON DELETE SET NULL,
  model_used TEXT NOT NULL,
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_cost_usd DECIMAL(10, 6),
  latency_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent interactions
CREATE INDEX IF NOT EXISTS idx_agent_interactions_type ON agent_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_date ON agent_interactions(created_at);

-- 5. Update contact_submissions table
-- Add processing status column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_submissions'
    AND column_name = 'processing_status'
  ) THEN
    ALTER TABLE contact_submissions
    ADD COLUMN processing_status TEXT DEFAULT 'pending'
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'contact_submissions'
    AND column_name = 'processed_at'
  ) THEN
    ALTER TABLE contact_submissions
    ADD COLUMN processed_at TIMESTAMPTZ;
  END IF;
END $$;

-- 6. Row Level Security Policies

-- Enable RLS on new tables
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

-- Policies for conversation_history (service role only - edge functions)
CREATE POLICY "Service role full access to conversation_history" ON conversation_history
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for lead_scores (service role only)
CREATE POLICY "Service role full access to lead_scores" ON lead_scores
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for followup_queue (service role only)
CREATE POLICY "Service role full access to followup_queue" ON followup_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policies for agent_interactions (service role only)
CREATE POLICY "Service role full access to agent_interactions" ON agent_interactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_lead_scores_updated_at ON lead_scores;
CREATE TRIGGER update_lead_scores_updated_at
  BEFORE UPDATE ON lead_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_followup_queue_updated_at ON followup_queue;
CREATE TRIGGER update_followup_queue_updated_at
  BEFORE UPDATE ON followup_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
