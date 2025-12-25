-- Migration: Fix RLS policy for contact_submissions
-- Description: Allow anonymous users to insert contact form submissions

-- Allow anonymous users to insert new contact submissions
CREATE POLICY "Allow anonymous inserts to contact_submissions" ON contact_submissions
  FOR INSERT TO anon WITH CHECK (true);

-- Allow service role full access for edge functions to process leads
CREATE POLICY "Service role full access to contact_submissions" ON contact_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
