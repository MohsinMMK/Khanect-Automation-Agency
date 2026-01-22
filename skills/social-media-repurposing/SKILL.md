---
name: Social Media Repurposing
description: Automatically generates social media captions for blog posts using AI.
---

# Social Media Repurposing Skill

This skill extends the content agent to generate social media content (LinkedIn, Twitter) for every blog post it creates.

## functionality

When `scripts/run-content-workflow.ts` runs:

1.  Fetches and rewrites articles (standard agent behavior).
2.  **NEW**: Calls `generateSocialPost(title, content)`.
3.  Generates a JSON object with `linkedin` and `twitter` fields.
4.  Logs the output to the console (currently).

## Future Improvements

- Save the social captions to a `social_content` table in Supabase.
- Automatically post to flexible social media APIs (e.g. Typefully, Buffer) via N8N or direct API.
