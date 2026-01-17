---
name: Automated Content Pipeline
description: A reuseable skill for setting up an automated AI content agent using RSS feeds, OpenAI, and Supabase.
---

# Automated Content Pipeline Skill

This skill allows you to deploy a self-driving content engine that fetches industry news, rewrites it using AI, and publishes it to your Supabase-backed blog.

## Prerequisites

- **Node.js / Bun**
- **Supabase Project** (with a `posts` table)
- **OpenAI API Key**
- **GitHub Repository** (for actions)

## Setup Instructions

### 1. Database Setup (Supabase)

Make sure you have a `posts` table with the following schema:

```sql
create table posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  is_published boolean default false,
  source_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
```

### 2. Environment Variables

Add these to your `.env` and GitHub Secrets:

```env
VITE_SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

### 3. The Agent Script

Create `scripts/content-agent.ts`. This script should:

1.  **Fetch RSS Feeds**: Use `rss-parser` to get latest news.
2.  **Filter**: Select relevant articles (e.g., "AI", "Automation").
3.  **Synthesize**: Use `openai` (GPT-4o-mini) to rewrite the content.
    - _Prompt_: "Act as an expert. Rewrite this news for [Target Audience]. Use Markdown."
4.  **Upsert**: Save to Supabase `posts` table using `slug` as ID.

### 4. Automation (GitHub Actions)

Create `.github/workflows/daily-content.yml`:

```yaml
name: Daily Content Agent
on:
  schedule:
    - cron: "0 9 * * *" # 9 AM UTC
  workflow_dispatch:

jobs:
  run-agent:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run scripts/content-agent.ts
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

## Usage

- **Manual Run**: `bun run scripts/content-agent.ts`
- **Production**: Trigger via GitHub Actions.

## Customization

- **Prompts**: Edit the system prompt in the script to change the writing voice.
- **Feeds**: Add more RSS sources to the `RSS_FEEDS` array.
