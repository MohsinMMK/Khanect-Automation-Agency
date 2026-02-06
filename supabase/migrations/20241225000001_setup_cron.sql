-- Enable required extensions for scheduled jobs
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Grant usage to postgres role
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

-- Schedule followup-scheduler to run every 15 minutes
select cron.schedule(
  'send-followup-emails',  -- job name
  '*/15 * * * *',          -- every 15 minutes
  $$
  select net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/followup-scheduler',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
