# Khanect AI - Project Documentation

## Overview

Business Automation Agency SaaS platform - React landing page, client portal, and **automated AI content engine**.

## Agent Instructions

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**

- Basically just SOPs written in Markdown, live in `directives/`
- Define the goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**

- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You're the glue between intent and execution. E.g you don't try scraping websites yourself—you read `directives/scrape_website.md` and come up with inputs/outputs and then run `execution/fetch-rss.ts`

**Layer 3: Execution (Doing the work)**

- Deterministic TypeScript/Bun tools in `execution/`
- Environment variables, api tokens, etc are stored in `.env.local`
- Handle API calls, data processing, file operations, database interactions
- Reliable, testable, fast. Use tools instead of manual work.

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. The solution is push complexity into deterministic code. That way you just focus on decision-making.

## Operating Principles

**1. Check for tools first**
Before writing a script, check `execution/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**

- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits/etc—in which case you check w user first)
- Update the directive with what you learned (API limits, timing, edge cases)
- Example: you hit an API rate limit → you then look into API → find a batch endpoint that would fix → rewrite script to accommodate → test → update directive.

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations—update the directive. But don't create or overwrite directives without asking unless explicitly told to. Directives are your instruction set and must be preserved (and improved upon over time, not extemporaneously used and then discarded).

## Self-annealing loop

Errors are learning opportunities. When something breaks:

1. Fix it
2. Update the tool
3. Test tool, make sure it works
4. Update directive to include new flow
5. System is now stronger

## File Organization

**Deliverables vs Intermediates:**

- **Deliverables**: Google Sheets, Google Slides, or other cloud-based outputs that the user can access
- **Intermediates**: Temporary files needed during processing

**Directory structure:**

- `.tmp/` - All intermediate files (dossiers, scraped data, temp exports). Never commit, always regenerated.
- `execution/` - TypeScript tools (the deterministic layer)
- `directives/` - SOPs in Markdown (the instruction set)
- `.env.local` - Environment variables and API keys
- `credentials.json`, `token.json` - Google OAuth credentials (required files, in `.gitignore`)

**Key principle:** Local files are only for processing. Deliverables live in cloud services (Google Sheets, Slides, etc.) where the user can access them. Everything in `.tmp/` can be deleted and regenerated.

## Summary

You sit between human intent (directives) and deterministic execution (TypeScript/Bun tools). Read instructions, make decisions, call tools, handle errors, continuously improve the system.

Be pragmatic. Be reliable. Self-anneal.

## Current Status (Feb 2026)

- **AI Content Agent**: ✅ Live. Automated daily curation (RSS -> OpenAI -> Supabase).
- **Blog**: ✅ Verified. Dynamic content with SEO optimization (Meta tags, Sitemap).
- **Lead Magnet**: ✅ Implemented. Email capture integrated in blog posts.
- **Infrastructure**: ✅ Stabilized. Supabase connection fixed. Hostinger build compatibility fixed (React 19).
- **Client Portal**: ✅ Enhanced. Full lead management, dashboard, activity tracking, settings.

## Guidelines

1. **Read before editing** - Always read files before making changes
2. **Keep it minimal** - Smallest possible changes
3. **Never speculate** - Only answer based on actual file contents

## Tech Stack

- **Framework**: React 19.2 + Vite 6 + TypeScript
- **Styling**: Tailwind CSS v4 + CVA components
- **Backend**: Supabase (PostgreSQL + Auth + **Edge Functions**) + N8N webhooks
- **Content Engine**: Custom Node.js Agent (RSS -> Deepseek/OpenAI -> Supabase)
- **Routing**: React Router v7 with `createBrowserRouter` + loaders
- **Animations**: Framer Motion (scroll animations), Three.js (Shader Lines)
- **Package Manager**: Bun (Deployed with npm/Hostinger compatibility)

## React 19 Patterns

### Form Handling

Contact form uses React 19's `useActionState` and `useFormStatus`:

```tsx
// Form action with useActionState
const [formState, formAction, isPending] = useActionState(
  submitAction,
  initialState,
);

// Submit button with useFormStatus
function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}

// Form with action
<form action={formAction}>...</form>;
```

### Router Data Patterns

Routes use `createBrowserRouter` with loaders for data prefetching:

```tsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "services/:slug",
        element: <ServiceDetailPage />,
        loader: serviceLoader,
      },
    ],
  },
]);
```

## Commands

```bash
bun dev              # Dev server (port 3000)
bun run build        # Production build
bun test             # Run tests
bun run retry:pending-leads # Retry recent pending/failed leads
bun run docs:update  # Refresh mirrored docs metadata
bun run scripts/run-content-workflow.ts # Run AI Content Workflow
```

## Routes

### Public Routes

| Path                | Component         | Description               |
| ------------------- | ----------------- | ------------------------- |
| `/`                 | LandingPage       | Hero, services, FAQs, CTA |
| `/pricing`          | Pricing           | Pricing tiers             |
| `/contact`          | ContactPage       | Dedicated contact page    |
| `/blog`             | Blog              | **Dynamic Blog Listing**  |
| `/blog/:slug`       | BlogPost          | **Dynamic Blog Post**     |
| `/services/:slug`   | ServiceDetailPage | Service details           |
| `/industries/:slug` | ServiceDetailPage | Industry details          |

### Portal Routes (Protected)

| Path               | Component     | Description                      |
| ------------------ | ------------- | -------------------------------- |
| `/portal/login`    | LoginPage     | Portal login + password reset    |
| `/portal`          | DashboardPage | Dashboard with real metrics      |
| `/portal/leads`    | LeadsPage     | Lead management with table       |
| `/portal/activity` | ActivityPage  | AI activity logs & filters       |
| `/portal/settings` | SettingsPage  | Profile, notifications, security |

## Environment Variables

```env
VITE_SUPABASE_URL=         # Supabase project URL
VITE_SUPABASE_ANON_KEY=    # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY= # Service role key (Backend/Agent only)
VITE_N8N_WEBHOOK_URL=      # N8N webhook for leads
VITE_N8N_CHAT_WEBHOOK_URL= # N8N chatbot webhook
```

## MCP Servers

Configuration in `.mcp.json`. Available servers:

| Server   | Purpose                          |
| -------- | -------------------------------- |
| context7 | Library documentation lookup     |
| ref      | Documentation search and reading |
| shadcn   | Component registry management    |
| supabase | Database operations (HTTP MCP)   |
| github   | GitHub API operations            |
| n8n      | N8N workflow automation API      |

### N8N MCP Server

Provides tools for managing N8N workflows, executions, and webhooks.

**Config requirements:**
```json
"n8n": {
  "command": "cmd",
  "args": ["/c", "npx", "-y", "n8n-mcp-server"],
  "env": {
    "N8N_API_URL": "https://n8n.srv1222580.hstgr.cloud/api/v1",
    "N8N_API_KEY": "<api-key>"
  }
}
```

**Important:** `N8N_API_URL` must include `/api/v1` suffix.

**Available N8N tools (after restart):**
- List/get/create/update/delete workflows
- Activate/deactivate workflows
- List/get executions
- Trigger webhooks

**N8N Instance:** `https://n8n.srv1222580.hstgr.cloud`

## Theme System

Dark mode only (no theme switcher).

| Background | Primary        |
| :--------- | :------------- |
| `#0F0F11`  | Teal `#14B8A6` |

**Files**: `src/contexts/ThemeContext.tsx`, `src/index.css`

## Typography System

### Fonts

| Font          | Class               | Usage                           |
| ------------- | ------------------- | ------------------------------- |
| Genos         | `font-sans`         | Body text (default, weight 400) |
| Astro Outline | `font-display`      | Display headings                |
| Astro         | `font-logo`         | Logo only                       |
| Astro Outline | `font-logo-outline` | Outline variant                 |

**Font files**: `public/fonts/astro.otf`, `astro-outline.otf`
**Google Font**: Genos (via CSS import)

### Type Scale (1.4 ratio)

| Class       | Size | Line Height | Tracking | Use Case   |
| ----------- | ---- | ----------- | -------- | ---------- |
| `text-xs`   | 13px | 1.6         | +0.01em  | Captions   |
| `text-sm`   | 15px | 1.6         | +0.01em  | Small text |
| `text-base` | 16px | 1.5         | 0        | Body       |
| `text-lg`   | 22px | 1.5         | 0        | Lead text  |
| `text-xl`   | 31px | 1.2         | -0.01em  | H4         |
| `text-2xl`  | 44px | 1.2         | -0.02em  | H3/Section |
| `text-3xl`  | 61px | 1.1         | -0.02em  | H2         |
| `text-4xl`  | 85px | 1.1         | -0.03em  | H1 Hero    |

### Responsive Base Font Size

| Breakpoint   | Base Size |
| ------------ | --------- |
| Mobile       | 16px      |
| sm (640px)   | 17px      |
| lg (1024px)  | 18px      |
| 2xl (1536px) | 20px      |

### Typography Usage

```tsx
// Hero title
<h1 className="text-3xl md:text-4xl font-bold">

// Section heading
<h2 className="text-2xl md:text-3xl font-bold">

// Body/Lead text
<p className="text-lg">

// Logo text
<span className="font-logo tracking-widest">
```

### Component Heading Sizes

| Component             | Size                   | Notes                   |
| --------------------- | ---------------------- | ----------------------- |
| Contact form heading  | `text-2xl md:text-3xl` | "We'd love to help"     |
| Pricing page title    | `text-2xl md:text-3xl` | Single line             |
| Pricing CTA heading   | `text-2xl md:text-3xl` | "Ready to Get Started?" |
| Pricing card "Custom" | `text-2xl`             | Enterprise tier price   |
| Pricing card prices   | `text-5xl`             | Numeric prices          |

## Logo Configuration

Logo files in `public/`:

- `logo.svg` - K logo icon (teal `#14b8a6`)
- `logo-teal.png` - K logo icon (teal PNG)
- `logo-full.png` - Full logo with "KHANECT" text
- `favicon.svg` - Favicon (teal K logo)

| Location       | File                    | Classes                    |
| -------------- | ----------------------- | -------------------------- |
| Navbar         | `Navbar.tsx`            | `h-40 -mt-6 -mb-10 -ml-10` |
| Contact Form   | `LandingPage.tsx`       | `h-32 -mt-10 -ml-10`       |
| AI Assistant   | `ai-assistant-card.tsx` | `h-24 -mt-2 -mb-4 -ml-4`   |
| Favicon        | `index.html`            | SVG format with cache-bust |
| OG Image       | `og-image.svg`          | K logo in teal box         |
| Icon Component | `KhanectBoltIcon.tsx`   | `fill-teal-500`            |

## AI Assistant

- **File**: `src/components/ui/ai-assistant-card.tsx`
- **Trigger**: Floating button on landing/pricing/contact pages (hidden when mobile menu open)
- **Close**: Click outside (backdrop overlay)
- **Logo**: `logo-full.png` in header

## Key Files

| File                                  | Purpose                                                               |
| ------------------------------------- | --------------------------------------------------------------------- |
| `src/App.tsx`                         | Router config + RootLayout + error boundaries                         |
| `scripts/run-content-workflow.ts`     | **Automated Content Workflow (Orchestrator)**                         |
| `.github/workflows/daily-content.yml` | **GitHub Action for Daily Content**                                   |
| `src/services/blogService.ts`         | **Supabase Data Fetching Service**                                    |
| `src/components/Blog.tsx`             | **Dynamic Blog Listing**                                              |
| `src/components/BlogPost.tsx`         | **Dynamic Blog Post Detail**                                          |
| `src/components/LandingPage.tsx`      | Landing page with glassmorphism hero buttons, services, FAQs          |
| `src/components/ContactPage.tsx`      | Dedicated contact page with form + contact info                       |
| `src/components/Navbar.tsx`           | Navigation (Mobile Menu z-index: 99999, Desktop Contact: Transparent) |
| `src/components/ui/shader-lines.tsx`  | Hero background shader animation (Three.js)                           |
| `src/lib/supabase.ts`                 | **Supabase Client Config**                                            |

## Code Conventions

- Path alias: `@/` for `src/`
- Styling: Tailwind classes + `cn()` utility
- Icons: Lucide React or `components/icons/`
- Forms: Always validate (incl. Privacy Consent) + rate-limit (60s cooldown)
- Components: Use `function Component(props: Props)` syntax (not `React.FC`)

## SEO

- **Structured Data**: `src/utils/structuredData.ts` (Organization, FAQPage, etc.)
- **Meta Tags**: Managed via `src/components/SEO.tsx` (`react-helmet-async`)
- **Sitemap**: `public/sitemap.xml` (Generated via `bun run generate:sitemap`)
- **Robots**: `public/robots.txt` (blocks `/portal`, `/demo/`)

## Project Stats (Auto-generated)
- **Total Source Files**: 141
- **Total Lines of Code**: 17001
- **Last Updated**: 2026-02-06T17:42:45.021Z
## Active Skills (Auto-generated)
- **[Automated Content Pipeline](/skills/automated_content_pipeline/SKILL.md)**: A reuseable skill for setting up an automated AI content agent using RSS feeds, OpenAI, and Supabase.
- **[Social Media Repurposing](/skills/social-media-repurposing/SKILL.md)**: Automatically generates social media captions for blog posts using AI.
## Available Scripts (Auto-generated)
- **[create_invite.js](/scripts/create_invite.js)**: Invite Script - Create new client user
- **[generate-sitemap.ts](/scripts/generate-sitemap.ts)**: Load environment variables from .env.local
- **[reflect-docs.ts](/scripts/reflect-docs.ts)**: No description.
- **[retry-pending-leads.ts](/scripts/retry-pending-leads.ts)**: No description.
- **[run-content-workflow.ts](/scripts/run-content-workflow.ts)**: No description.