-- Migration: Portal RLS Policies
-- Description: Allow authenticated portal users to read leads and activity data

-- Allow authenticated users to read contact_submissions
CREATE POLICY "Authenticated users can view contact_submissions" 
  ON contact_submissions 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to read lead_scores
CREATE POLICY "Authenticated users can view lead_scores" 
  ON lead_scores 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to read agent_interactions  
CREATE POLICY "Authenticated users can view agent_interactions"
  ON agent_interactions 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to read followup_queue
CREATE POLICY "Authenticated users can view followup_queue"
  ON followup_queue 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Allow authenticated users to update their own client record
CREATE POLICY "Users can update own client record"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow authenticated users to read their own client record
CREATE POLICY "Users can view own client record"
  ON clients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Add notification_preferences column to clients table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients'
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE clients
    ADD COLUMN notification_preferences JSONB DEFAULT '{
      "email_new_leads": true,
      "email_lead_scored": true,
      "email_weekly_digest": true,
      "email_followup_sent": false
    }'::jsonb;
  END IF;
END $$;
