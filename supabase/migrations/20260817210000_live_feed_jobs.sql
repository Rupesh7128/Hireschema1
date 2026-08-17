-- Migration: Create live_feed_jobs table

CREATE TABLE public.live_feed_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT NOT NULL,
    work_type TEXT,
    salary TEXT,
    url TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days'
);

-- Enable RLS
ALTER TABLE public.live_feed_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access to live feed jobs
CREATE POLICY "Allow public read access on live_feed_jobs"
ON public.live_feed_jobs
FOR SELECT
TO public, anon, authenticated
USING (true);

-- Allow service role to insert/update (backend and sync bots)
CREATE POLICY "Allow service role insert on live_feed_jobs"
ON public.live_feed_jobs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow service role update on live_feed_jobs"
ON public.live_feed_jobs
FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Allow service role delete on live_feed_jobs"
ON public.live_feed_jobs
FOR DELETE
TO service_role
USING (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_feed_jobs;

-- Cleanup Cron Job (Requires pg_cron extension)
-- Assuming pg_cron is enabled via core_tables.sql
SELECT cron.schedule(
  'cleanup_live_feed_jobs',
  '0 0 * * *', -- Run daily at midnight
  $$ DELETE FROM public.live_feed_jobs WHERE expires_at < NOW(); $$
);
