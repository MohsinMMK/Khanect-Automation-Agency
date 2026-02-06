## 1. Current Blog Context

1. Routing
- `src/App.tsx` exposes `/blog` and `/blog/:slug`.

2. Data Flow
- `Blog.tsx` -> `blogService.getLatestPosts()` -> Supabase `posts`.
- `BlogPost.tsx` -> `blogService.getPostBySlug(slug)` -> Supabase `posts`.
- Service mapping normalizes DB fields (`read_time`, `cover_image`) into UI fields (`readTime`, `coverImage`).

3. Content Pipeline
- `scripts/run-content-workflow.ts` orchestrates:
  - `execution/fetch-rss.ts`
  - `execution/generate-post.ts`
  - `execution/publish-supabase.ts`
- `scripts/run-content-workflow.ts` now exports `runContentWorkflow()` with injectable dependencies for deterministic smoke testing.
- CI workflow `.github/workflows/daily-content.yml` runs `bun run scripts/run-content-workflow.ts`.
- Package alias exists: `content:workflow -> bun run scripts/run-content-workflow.ts`.

4. SEO and Discovery
- `scripts/generate-sitemap.ts` generates `public/sitemap.xml`.
- Sitemap generation queries only published posts and includes `lastmod`.
- Blog canonical URLs:
  - Index: `https://khanect.com/blog`
  - Detail: `https://khanect.com/blog/:slug`
- Blog detail injects Article structured data via `useStructuredData` + `generateArticleSchema`.

5. Lead Magnet in Blog
- `EmailCapture.tsx` is used in blog index and post detail.

## 2. Known Gaps (Current)

1. `src/data/blogPosts.ts` is still unused legacy/static data and can be removed after confirming no rollback requirement.
2. Execution-layer modules (`execution/fetch-rss.ts`, `execution/generate-post.ts`, `execution/publish-supabase.ts`) still rely on live dependencies for full-path verification; deterministic coverage is at orchestrator level.
3. Content workflow observability is log-based; no explicit metrics sink/alerts are defined in-repo.
4. Migration IDs were normalized (`20241225_*` -> `20241225000000_*`, `20241225000001_*`) to align Supabase history. Keep these filenames stable to avoid future history drift.

## 3. Phased Execution Plan

### Phase 1: Pipeline and CI Alignment
Status: Complete
1. Workflow script path fixed in `.github/workflows/daily-content.yml`.
2. Package script alias `content:workflow` added in `package.json`.
3. Manual workflow dispatch on `main` succeeded after push (`Daily Content Agent` run `21760048111` on 2026-02-06 UTC).

### Phase 2: Data Contract and Schema Hardening
Status: Complete
1. `posts` schema migration added at `supabase/migrations/20260206_blog_posts_schema.sql`.
2. Columns/constraints enforced for `id`, `slug` unique, `title`, `excerpt`, `content`, `tags`, `cover_image`, `read_time`, `source_url`, `is_published`, `created_at`, `updated_at`.
3. RLS intent implemented:
- public read for published posts
- service role full access for writes.
4. Migration history reconciled and verified with `supabase migration list`.

### Phase 3: Rendering and Security Hardening
Status: Complete
1. Removed `dangerouslySetInnerHTML` path from `BlogPost.tsx`.
2. Added safe markdown rendering with protocol-checked links and malformed content fallback.
3. Added explicit detail-page load error state.

### Phase 4: SEO and Structured Data Upgrade
Status: Complete
1. Canonical URLs added to blog index/detail SEO metadata.
2. Article structured data added for blog detail pages.
3. Sitemap behavior remained aligned to published posts with `lastmod`.

### Phase 5: Test and Observability Coverage
Status: Complete (current target scope)
1. Added/expanded tests for:
- Blog list success/loading/empty/error paths.
- Blog detail success/not-found/error paths.
- Service mapping (`read_time -> readTime`, `cover_image -> coverImage`).
2. Added pipeline-level deterministic smoke tests with stubs.
3. Added operator runbook: `docs/BLOG_PIPELINE_SMOKE_TEST.md`.

## Public APIs / Interfaces / Types Impact

1. `scripts/run-content-workflow.ts` now exposes:
- `runContentWorkflow(options)`
- `WorkflowDependencies`
- `WorkflowOptions`
2. `src/utils/structuredData.ts` now exports `generateArticleSchema(post, pathOrUrl)`.
3. `src/components/Blog.tsx` and `src/components/BlogPost.tsx` include explicit error-state rendering for failed fetch scenarios.
4. Route paths remain unchanged.

## Test Cases and Scenarios

1. Blog index loads posts, supports search, supports tag filtering, and handles empty/error states.
2. Blog detail handles success/not-found/error and safe markdown rendering.
3. Blog service mapping tests validate DB -> UI field mapping.
4. Pipeline smoke tests validate fetch -> generate -> publish flow using stubs.
5. Build verification passes (`bun run build`).
6. CI daily content workflow runs the correct script on `main`.
7. Live content workflow run completes and publishes without missing-script failure.

## Assumptions and Defaults

1. Blog source of truth remains Supabase `posts`.
2. Existing route structure remains unchanged.
3. Reliability/security takes priority over visual changes.
4. Documentation reflects repository and operational state as of 2026-02-06.
