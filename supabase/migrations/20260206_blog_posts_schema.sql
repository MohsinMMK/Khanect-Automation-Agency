-- Migration: Blog Posts Schema + RLS
-- Description: Create and normalize the blog posts table contract used by /blog routes and content pipeline.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create table if missing.
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}'::text[],
  cover_image TEXT,
  read_time TEXT,
  source_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure required columns exist for pre-existing environments.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'id'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN id UUID DEFAULT gen_random_uuid();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN slug TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'title'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN title TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'excerpt'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN excerpt TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN content TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN tags TEXT[] DEFAULT '{}'::text[];
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN cover_image TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'read_time'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN read_time TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'source_url'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN source_url TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN is_published BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.posts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Backfill nulls before constraints are tightened.
UPDATE public.posts SET id = gen_random_uuid() WHERE id IS NULL;
UPDATE public.posts SET slug = 'post-' || replace(id::text, '-', '') WHERE slug IS NULL OR btrim(slug) = '';
UPDATE public.posts SET title = 'Untitled Post' WHERE title IS NULL OR btrim(title) = '';
UPDATE public.posts SET content = '' WHERE content IS NULL;
UPDATE public.posts SET excerpt = left(content, 150) WHERE excerpt IS NULL OR btrim(excerpt) = '';
UPDATE public.posts SET tags = '{}'::text[] WHERE tags IS NULL;
UPDATE public.posts SET is_published = false WHERE is_published IS NULL;
UPDATE public.posts SET created_at = NOW() WHERE created_at IS NULL;
UPDATE public.posts SET updated_at = NOW() WHERE updated_at IS NULL;

-- Enforce defaults + constraints that the app and pipeline rely on.
ALTER TABLE public.posts ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.posts ALTER COLUMN id SET NOT NULL;
ALTER TABLE public.posts ALTER COLUMN slug SET NOT NULL;
ALTER TABLE public.posts ALTER COLUMN title SET NOT NULL;
ALTER TABLE public.posts ALTER COLUMN excerpt SET NOT NULL;
ALTER TABLE public.posts ALTER COLUMN content SET NOT NULL;
ALTER TABLE public.posts ALTER COLUMN tags SET DEFAULT '{}'::text[];
ALTER TABLE public.posts ALTER COLUMN tags SET NOT NULL;
ALTER TABLE public.posts ALTER COLUMN is_published SET DEFAULT false;
ALTER TABLE public.posts ALTER COLUMN is_published SET NOT NULL;
ALTER TABLE public.posts ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE public.posts ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE public.posts ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE public.posts ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.posts'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_pkey PRIMARY KEY (id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'posts'
      AND indexdef ILIKE 'CREATE UNIQUE INDEX%'
      AND indexdef ILIKE '%(slug)%'
  ) THEN
    ALTER TABLE public.posts ADD CONSTRAINT posts_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_published_created_at
  ON public.posts (is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_created_at
  ON public.posts (created_at DESC);

-- Keep updated_at consistent on writes.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS intent:
-- 1) Public (anon + authenticated) can read published posts only.
-- 2) Writes are restricted to service role for pipeline/orchestrator usage.
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'posts'
      AND policyname = 'Public can read published posts'
  ) THEN
    CREATE POLICY "Public can read published posts"
      ON public.posts
      FOR SELECT
      TO anon, authenticated
      USING (is_published = true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'posts'
      AND policyname = 'Service role full access to posts'
  ) THEN
    CREATE POLICY "Service role full access to posts"
      ON public.posts
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

GRANT SELECT ON TABLE public.posts TO anon, authenticated;
GRANT ALL ON TABLE public.posts TO service_role;

COMMENT ON TABLE public.posts IS
  'Blog posts table used by /blog routes, sitemap generation, and the content workflow.';
