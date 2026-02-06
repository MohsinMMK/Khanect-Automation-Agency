## 1. Current Blog Context

1. Routing
- `src/App.tsx` keeps `/blog` and `/blog/:slug` unchanged.

2. Data Flow
- `Blog.tsx` uses `blogService.getLatestPosts()` and applies client-side search, tag filtering, and sort (`Newest` / `Most relevant`).
- `BlogPost.tsx` uses:
  - `blogService.getPostBySlug(slug)`
  - `blogService.getRelatedPosts(currentSlug, tags, limit)`
- Service mapping still normalizes DB fields (`read_time`, `cover_image`) to UI fields (`readTime`, `coverImage`).

3. UI Architecture (Editorial Glass)
- Shared blog UI primitives added:
  - `src/components/ui/blog-shell.tsx`
  - `src/components/ui/blog-card.tsx`
  - `src/components/ui/blog-cta-panel.tsx`
- Blog tokens/utilities added in `src/index.css`:
  - `--blog-surface`, `--blog-surface-2`, `--blog-border`, `--blog-glow`
  - `.blog-editorial-card`, `.blog-section-separator`, `.blog-sticky-rail`

4. Conversion Rails
- `/blog` now includes:
  - Hero CTA pair (newsletter + audit)
  - Mid-feed CTA insertion
  - End-of-page CTA panel wrapping `EmailCapture`
- `/blog/:slug` now includes:
  - Inline contextual CTA in article body (~40% insertion point)
  - Sticky rail CTA
  - End-of-article CTA panel with `EmailCapture`

5. Reading Experience
- Blog list: featured story + editorial staggered grid.
- Blog detail:
  - Reading progress bar
  - Generated TOC from `##` / `###` headings
  - Sticky desktop rail + mobile collapsible TOC
  - Mobile-first typography downscale for hero, cards, and article body copy
  - Related posts section (3 items)
  - Share button with clipboard fallback toast

6. Navbar/Interaction Fit
- Resolved mobile overlap where navbar logo blocked the `Back to Articles` link hit target.
- Adjusted blog post top spacing and mobile logo hitbox/alignment to preserve tap accessibility.

6. SEO and Discovery
- Canonical URLs remain:
  - `https://khanect.com/blog`
  - `https://khanect.com/blog/:slug`
- Article structured data remains via `useStructuredData` + `generateArticleSchema`.
- Route and metadata behavior preserved.

## 2. Known Gaps (Current)

1. CTA analytics instrumentation (explicit click/capture event tracking per placement) is not yet wired in code.
2. Related-post ranking is lightweight (tag overlap + recency), not semantic.
3. Markdown renderer intentionally supports a safe subset and does not yet include richer blocks (tables/code syntax highlighting).
4. Build still reports a large-chunk warning on main bundle; no additional splitting was added in this pass.

## 3. Phased Execution Plan

### Phase 1: Pipeline and CI Alignment
Status: Complete
1. Workflow script path fixed in `.github/workflows/daily-content.yml`.
2. Package alias `content:workflow` exists and maps to `scripts/run-content-workflow.ts`.
3. Daily workflow execution on `main` is aligned.

### Phase 2: Data Contract and Schema Hardening
Status: Complete
1. `posts` schema migration remains in place (`supabase/migrations/20260206_blog_posts_schema.sql`).
2. Required columns/constraints and publish-state behavior preserved.
3. No migration changes required for this redesign.

### Phase 3: Rendering and Security Hardening
Status: Complete
1. Safe markdown rendering remains in `BlogPost.tsx`.
2. Protocol checks for links remain enforced.
3. Blog loading/error/not-found states remain explicit.

### Phase 4: SEO and Structured Data Upgrade
Status: Complete
1. Blog canonical metadata remains in index/detail pages.
2. Article structured data remains injected on detail.
3. Sitemap flow remains tied to published posts.

### Phase 5: Core Blog Quality Coverage
Status: Complete
1. Integration tests cover blog list states/filtering and blog detail states/markdown safety.
2. Service tests cover DB-to-UI mapping.
3. Build verification passes.

### Phase 6: Editorial Glass + Conversion Redesign
Status: Complete
1. Redesigned `/blog` with hero strip, sticky filter row, featured story, editorial grid, and mid-feed CTA.
2. Redesigned `/blog/:slug` with wide hero, progress bar, two-column reading layout, TOC, sticky rail, inline CTA, and related posts.
3. Added reusable blog UI primitives and blog-specific visual tokens.
4. Added `blogService.getRelatedPosts(...)` with non-breaking service contract extension.
5. Tuned mobile typography scale for readability and balanced hierarchy.
6. Fixed mobile navbar/logo overlap and alignment issues affecting top-of-page interactions.
7. Preserved existing route structure, SEO behavior, and no schema migration.

## Public APIs / Interfaces / Types Impact

1. `src/services/blogService.ts` now includes:
- `getRelatedPosts(currentSlug: string, tags: string[], limit = 3): Promise<BlogPost[]>`

2. `src/types.ts` (`BlogPost`) now includes optional UI helpers:
- `isFeatured?: boolean`
- `toc?: Array<{ id: string; title: string; level: 2 | 3 }>`

3. New reusable UI components:
- `src/components/ui/blog-shell.tsx`
- `src/components/ui/blog-card.tsx`
- `src/components/ui/blog-cta-panel.tsx`

## Test Cases and Scenarios

1. Targeted integration/service tests pass:
- `bun run test:run src/tests/integration/blog.test.tsx src/tests/integration/blog-post.test.tsx src/services/blogService.test.ts`
- Result: 17/17 tests passed.

2. Production build passes:
- `bun run build`

3. Full `bun test` currently fails due pre-existing runner/environment mismatches outside this redesign scope (Bun runner vs Vitest-style tests and jsdom-dependent suites).

## Assumptions and Defaults

1. Supabase `posts` remains the source of truth.
2. No route changes (`/blog`, `/blog/:slug`) and no DB migration.
3. Dark + teal brand remains mandatory.
4. Documentation reflects repository state as of 2026-02-06.
