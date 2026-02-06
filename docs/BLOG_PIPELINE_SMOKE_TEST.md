# Blog Pipeline Smoke Test

## Purpose
Validate the blog content pipeline contract before deploy without consuming paid model tokens or writing live content.

## Scope
- `execution/fetch-rss.ts` behavior is represented by stubbed feed items.
- `execution/generate-post.ts` behavior is represented by stubbed generation output.
- `execution/publish-supabase.ts` behavior is represented by stubbed publish responses.

## Deterministic Smoke Test (Stubbed)
Run:

```bash
bun run test:run src/tests/integration/content-workflow-smoke.test.ts
```

The smoke test validates:
1. Matching RSS item flows through fetch -> generate -> publish.
2. Publish payload includes expected fields (`title`, `source_url`, `is_published`).
3. Non-matching items are skipped.
4. Generation failure (`null`) does not publish and is logged as an error.

## Full Blog Regression Bundle
Run:

```bash
bun run test:run src/tests/integration/blog.test.tsx src/tests/integration/blog-post.test.tsx src/services/blogService.test.ts src/tests/integration/content-workflow-smoke.test.ts
```

Expected:
1. All tests pass.
2. No `dangerouslySetInnerHTML` regression.
3. Blog service mapping checks pass (`read_time -> readTime`, `cover_image -> coverImage`).

## Optional Live Pipeline Check (Writes Data)
Only run when production/test credentials are intentionally set in `.env.local`.

```bash
bun run content:workflow
```

Live-check exit criteria:
1. Workflow processes feeds without missing-script errors.
2. Upsert does not create duplicate slugs.
3. Post-publish sitemap generation still succeeds:

```bash
bun run generate:sitemap
```
