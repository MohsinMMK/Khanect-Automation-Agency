## 1. Current Blog Context

1. Routing
- `src/App.tsx` exposes `/blog` and `/blog/:slug`.

2. Data Flow
- `Blog.tsx` -> `blogService.getLatestPosts()` -> Supabase `posts`.
- `BlogPost.tsx` -> `blogService.getPostBySlug(slug)` -> Supabase `posts`.

3. Content Pipeline
- `scripts/run-content-workflow.ts` orchestrates:
  - `execution/fetch-rss.ts`
  - `execution/generate-post.ts`
  - `execution/publish-supabase.ts`

4. SEO and Discovery
- `scripts/generate-sitemap.ts` generates `public/sitemap.xml`.

5. Lead Magnet in Blog
- `EmailCapture.tsx` is used in blog index and post detail.

## 2. Known Gaps (Current)

1. CI workflow mismatch
- `.github/workflows/daily-content.yml` calls missing `scripts/content-agent.ts`.

2. No package script alias for content workflow in `package.json`.

3. `src/data/blogPosts.ts` is currently unused legacy/static data.

4. `BlogPost.tsx` uses `dangerouslySetInnerHTML` in markdown renderer (security risk surface).

## 3. Phased Execution Plan

### Phase 1: Pipeline and CI Alignment

1. Fix workflow script path in `.github/workflows/daily-content.yml` to `scripts/run-content-workflow.ts`.

2. Add package script alias in `package.json`:
- `content:workflow`: `bun run scripts/run-content-workflow.ts`

3. Validate with dry run and workflow lint checks.

4. Exit criteria:
- CI job references existing script.
- Manual trigger executes without missing-file failure.

### Phase 2: Data Contract and Schema Hardening

1. Document and verify expected `posts` table columns and constraints:
- `id`, `slug` unique, `title`, `excerpt`, `content`, `tags`, `cover_image`, `read_time`, `source_url`, `is_published`, `created_at`, `updated_at`.

2. Add/verify migration source of truth under `supabase/migrations/` for blog schema.

3. Define RLS intent (public read for published posts; writes via service role).

4. Exit criteria:
- Schema is reproducible from migrations.
- Read/write policy intent is documented.

### Phase 3: Rendering and Security Hardening

1. Replace ad-hoc markdown rendering in `BlogPost.tsx` with a safe markdown pipeline.

2. Remove direct unsanitized HTML injection path or sanitize via trusted sanitizer.

3. Add explicit handling for malformed markdown content.

4. Exit criteria:
- No unsafe HTML injection path.
- Blog content still renders headings/lists/links reliably.

### Phase 4: SEO and Structured Data Upgrade

1. Add canonical URLs on blog index/detail pages via `SEO.tsx`.

2. Add Article structured data for post detail pages.

3. Keep sitemap generation tied to published posts and include `lastmod`.

4. Exit criteria:
- Blog pages output canonical + article metadata.
- Sitemap includes dynamic post URLs in production.

### Phase 5: Test and Observability Coverage

1. Add/expand tests for:
- Blog list success/loading/empty/error paths.
- Blog detail success/not-found/error.
- Service mapping (`read_time` -> `readTime`, `cover_image` -> `coverImage`).

2. Add pipeline-level smoke test plan (RSS fetch, generate, publish stubs).

3. Exit criteria:
- Deterministic tests cover critical blog behavior.
- Failures are detectable before deploy.

## Public APIs / Interfaces / Types Impact

1. `src/types.ts` (`BlogPost`) may be tightened:
- Keep DB fields and UI fields clearly separated or formalize a mapped DTO.

2. `src/services/blogService.ts` response contract should be documented:
- Always return UI-ready fields (`date`, `readTime`, `coverImage`).

3. No route-path changes expected.

## Test Cases and Scenarios

1. Blog index loads published posts sorted newest-first.
2. Blog index search and tag filters compose correctly.
3. Blog detail returns post by slug and handles 404/not-found cleanly.
4. Blog detail safely renders content with no script injection.
5. Sitemap generation includes `/blog` + dynamic `/blog/:slug`.
6. CI daily content workflow resolves script path and runs.
7. Pipeline upsert prevents duplicate slug inserts.

## Assumptions and Defaults

1. Default file location: repository root as `blog.md`.
2. Blog source of truth remains Supabase `posts` (not static `src/data/blogPosts.ts`).
3. Existing route structure remains unchanged.
4. Priority order is Phase 1 -> 2 -> 3 -> 4 -> 5.
5. If a tradeoff is needed, prioritize reliability/security over visual enhancements.
