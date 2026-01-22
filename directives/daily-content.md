# Automated Daily Content Workflow

## Goal

Curate, rewrite, and publish daily business automation news to the Khanect blog.

## Inputs

- **RSS Feeds**: TechCrunch AI, The Verge AI, OpenAI Blog.
- **Keywords**: "automation, agent, llm, business, workflow".

## Workflow Steps

1.  **Fetch RSS**:
    - Tool: `execution/fetch-rss.ts`
    - Action: Fetch items from each feed URL.
    - Logic: Filter by keywords. Check Supabase for duplicates (handled by `publish-supabase.ts` conflict).

2.  **Generate Content**:
    - Tool: `execution/generate-post.ts`
    - Action: AI rewrites the news into a business-focused article.
    - Action: AI generates social media copy (LinkedIn/Twitter).

3.  **Publish**:
    - Tool: `execution/publish-supabase.ts`
    - Action: Save the structured post to the `posts` table in Supabase.

## Edge Cases

- **Rate Limits**: If OpenAI errors, log and skip.
- **Duplicates**: If slug exists, skip (Supabase handles `onConflict`).
