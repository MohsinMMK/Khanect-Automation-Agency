# Khanect AI - Project Documentation

## Overview

Business Automation Agency SaaS platform - React landing page and client portal for AI-powered workflow automation.

## Guidelines

1. **Read before editing** - Always read files before making changes
2. **Keep it minimal** - Smallest possible changes
3. **Never speculate** - Only answer based on actual file contents

## Tech Stack

- **Framework**: React 19.2 + Vite 6 + TypeScript
- **Styling**: Tailwind CSS v4 + CVA components
- **Backend**: Supabase (PostgreSQL + Auth) + N8N webhooks
- **Animations**: GSAP, Framer Motion, Three.js
- **Package Manager**: Bun

## Commands

```bash
bun dev              # Dev server (port 3000)
bun run build        # Production build
bun test             # Run tests
```

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | LandingPage | Hero, services, FAQs, contact form |
| `/pricing` | Pricing | Pricing tiers |
| `/portal` | ClientPortal | Authenticated dashboard |
| `/services/:slug` | ServiceDetailPage | Service details |
| `/industries/:slug` | ServiceDetailPage | Industry details |

## Environment Variables

```env
VITE_SUPABASE_URL=         # Supabase project URL
VITE_SUPABASE_ANON_KEY=    # Supabase anonymous key
VITE_N8N_WEBHOOK_URL=      # N8N webhook for leads
```

## Theme System

3 themes (default: Oak), toggle cycles: Oak → Light → Dark → Oak

| Theme | Background | Primary |
|-------|------------|---------|
| Light | `#FFFFFF` | Teal `#14B8A6` |
| Dark | `#0F0F11` | Teal `#14B8A6` |
| Oak | `#DDD9CE` | Brown `#3C2415` |

**Files**: `src/contexts/ThemeContext.tsx`, `src/index.css`

## Logo Configuration

All logos use `public/logo-full.png` (combined icon + "KHANECT" text).

| Location | File | Classes |
|----------|------|---------|
| Navbar | `Navbar.tsx` | `h-40 -mt-6 -mb-10 -ml-10` |
| Contact Form | `LandingPage.tsx:475` | `h-32 -mt-10 -ml-10` |
| AI Assistant | `ai-assistant-card.tsx` | `h-24 -mt-2 -mb-4 -ml-4` |
| Favicon | `index.html:37` | PNG format |

## AI Assistant

- **File**: `src/components/ui/ai-assistant-card.tsx`
- **Trigger**: Floating button on landing/pricing pages
- **Close**: Click outside (backdrop overlay)
- **Logo**: `logo-full.png` in header, left-aligned

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main routing + chat widget |
| `src/components/LandingPage.tsx` | Landing page + contact form |
| `src/components/Navbar.tsx` | Navigation + theme toggle |
| `src/components/ui/ai-assistant-card.tsx` | AI chat widget |
| `src/contexts/ThemeContext.tsx` | Theme state |
| `src/services/n8nChatbotService.ts` | Chat API |
| `src/index.css` | Global styles + theme variables |

## Fonts

- **Body**: Plus Jakarta Sans
- **Display**: Space Grotesk
- **Logo**: Blockat (custom, `/public/fonts/Blockat.otf`)

## Code Conventions

- Path alias: `@/` for `src/`
- Styling: Tailwind classes + `cn()` utility
- Icons: Lucide React or `components/icons/`
- Forms: Always validate + rate-limit (60s cooldown)

## SEO

- **Structured Data**: `src/utils/structuredData.ts` (Organization, FAQPage, etc.)
- **Sitemap**: `public/sitemap.xml`
- **Robots**: `public/robots.txt` (blocks `/portal`, `/demo/`)
- **Canonical URLs**: `useCanonicalUrl` hook
