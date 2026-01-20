# Khanect AI - Project Documentation

## Overview

Business Automation Agency SaaS platform - React landing page, client portal, and **automated AI content engine**.

## Current Status (Jan 2026)

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
bun run scripts/content-agent.ts # Run AI Content Agent manually
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

| Path                | Component      | Description                  |
| ------------------- | -------------- | ---------------------------- |
| `/portal/login`     | LoginPage      | Portal login + password reset|
| `/portal`           | DashboardPage  | Dashboard with real metrics  |
| `/portal/leads`     | LeadsPage      | Lead management with table   |
| `/portal/activity`  | ActivityPage   | AI activity logs & filters   |
| `/portal/settings`  | SettingsPage   | Profile, notifications, security |

## Environment Variables

```env
VITE_SUPABASE_URL=         # Supabase project URL
VITE_SUPABASE_ANON_KEY=    # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY= # Service role key (Backend/Agent only)
VITE_N8N_WEBHOOK_URL=      # N8N webhook for leads
```

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
| `scripts/content-agent.ts`            | **Automated Content Agent (RSS Fetcher)**                             |
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
- **Total Source Files**: 109
- **Total Lines of Code**: 11348
- **Last Updated**: 2026-01-17T15:57:52.809Z
## Active Skills (Auto-generated)
- **[Automated Content Pipeline](/skills/automated_content_pipeline/SKILL.md)**: A reuseable skill for setting up an automated AI content agent using RSS feeds, OpenAI, and Supabase.
- **[Social Media Repurposing](/skills/social-media-repurposing/SKILL.md)**: Automatically generates social media captions for blog posts using AI.
## Available Scripts (Auto-generated)
- **[content-agent.ts](/scripts/content-agent.ts)**: Load environment variables
- **[create_invite.js](/scripts/create_invite.js)**: Invite Script - Create new client user
- **[generate-sitemap.ts](/scripts/generate-sitemap.ts)**: Load environment variables from .env.local
- **[reflect-docs.ts](/scripts/reflect-docs.ts)**: Helper to count lines in a file
