# Khanect AI - Project Documentation

## Overview

Khanect AI is a Business Automation Agency SaaS platform - a modern React landing page and client portal for an AI automation agency that helps businesses streamline operations through AI-powered solutions and workflow automation.

## Development Guidelines

1. **Think first, then act** - Read relevant files in the codebase before making changes
2. **Check in before major changes** - Verify the plan with the user before implementing significant modifications
3. **Explain at a high level** - Provide concise explanations of what changes were made at each step
4. **Keep it simple** - Every change should be as minimal as possible, impacting the least amount of code
5. **Document the architecture** - Maintain this file to describe how the app works inside and out
6. **Never speculate** - Always read files before answering questions about them. If a user references a specific file, read it first. Give grounded, hallucination-free answers

## Tech Stack

| Category        | Technology                       |
| --------------- | -------------------------------- |
| Framework       | React 19.2 + Vite 6              |
| Language        | TypeScript (ES2022)              |
| Styling         | Tailwind CSS v4 + PostCSS        |
| UI Components   | Custom CVA components + Radix UI |
| Database/Auth   | Supabase (PostgreSQL + Auth)     |
| Animations      | Framer Motion, GSAP, Three.js    |
| Charts          | Recharts                         |
| Icons           | Lucide React + Custom SVG        |
| Routing         | React Router v7                  |
| Smooth Scroll   | Lenis                            |
| Testing         | Vitest + React Testing Library   |
| Package Manager | Bun                              |

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # UI primitives (button, card, badge, select, textarea)
│   ├── icons/           # Custom SVG icon components (15 icons)
│   ├── __tests__/       # Component tests
│   ├── LandingPage.tsx  # Main landing page with contact form
│   ├── Navbar.tsx       # Navigation with theme toggle
│   ├── Pricing.tsx      # Pricing page
│   ├── ClientPortal.tsx # Authenticated dashboard
│   └── ...
├── contexts/
│   └── ThemeContext.tsx # Light/dark/oak theme management (3 themes)
├── data/                # Static data definitions
│   ├── services.ts      # Service offerings
│   ├── industries.ts    # Industry solutions
│   ├── pricing.ts       # Pricing packages
│   ├── process.ts       # Process steps
│   └── faqs.ts          # FAQ content
├── hooks/               # Custom React hooks
│   ├── useAnimatedText.ts
│   ├── useCanonicalUrl.ts  # Dynamic canonical URL updates
│   ├── useGSAPStagger.ts
│   └── useStructuredData.ts # JSON-LD schema injection
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # cn() utility
├── services/            # API integrations
│   ├── chatbotService.ts # Supabase Edge Function calls
│   └── n8nService.ts    # N8N webhook integration
├── utils/
│   ├── validation.ts       # Form validation
│   ├── structuredData.ts   # SEO schema generators
│   ├── formatMessage.tsx
│   └── env.ts
├── test/
│   └── setup.ts         # Vitest setup
├── types.ts             # TypeScript interfaces
├── App.tsx              # Main app with routing
├── index.tsx            # Entry point
└── index.css            # Global styles + animations
```

## Commands

```bash
bun dev            # Start dev server (port 3000)
bun run build      # Build for production
bun run preview    # Preview production build (port 3001)
bun test           # Run tests in watch mode
bun run test:run   # Run tests once
bun run test:coverage # Generate coverage report
```

## Routes

| Path                   | Component         | Description                        |
| ---------------------- | ----------------- | ---------------------------------- |
| `/`                    | LandingPage       | Hero, services, FAQs, contact form |
| `/pricing`             | Pricing           | Pricing tiers                      |
| `/portal`              | ClientPortal      | Authenticated client dashboard     |
| `/services/:slug`      | ServiceDetailPage | Service details                    |
| `/industries/:slug`    | ServiceDetailPage | Industry details                   |
| `/demo/dotted-surface` | DottedSurfaceDemo | 3D background demo                 |

## Environment Variables

```env
# Frontend (VITE_ prefix)
VITE_SUPABASE_URL=         # Supabase project URL
VITE_SUPABASE_ANON_KEY=    # Supabase anonymous key
VITE_N8N_WEBHOOK_URL=      # N8N webhook for lead processing

# Backend (Edge Functions)
SUPABASE_SERVICE_ROLE_KEY= # Admin access
OPENAI_API_KEY=            # GPT-4 for chatbot
RESEND_API_KEY=            # Email service
FROM_EMAIL=                # Sender email
```

## Key Patterns

### Component Styling

- Uses `class-variance-authority (CVA)` for component variants
- `cn()` utility combines `clsx` + `tailwind-merge`
- Theme switching via class strategy (`.dark`, `.oak` classes on `<html>`)

### Animation Stack

- **GSAP**: Scroll-triggered stagger animations (`useGSAPStagger`)
- **Framer Motion**: Component animations (`useAnimatedText`)
- **Three.js**: 3D dotted surface background
- **CSS**: Keyframe animations (meteors, fade-in, float)

### State Management

- React Context for theme (ThemeContext)
- Component-level useState for forms
- localStorage for persistence

### Form Handling

- Validation in `utils/validation.ts`
- Rate limiting (60s cooldown)
- Submits to Supabase + n8n webhook

### API Integration

- Supabase Edge Functions for AI chatbot
- N8N webhooks for lead processing automation

## Brand Colors

```javascript
brand: {
  lime: '#14B8A6',      // Primary teal
  limeHover: '#0D9488', // Darker teal
  dark: '#050505',      // Background dark
  card: '#0A0A0B',      // Card background
}
```

## Theme System

The app supports 3 themes (no system preference option):

| Theme | Background | Primary           | Description                 |
| ----- | ---------- | ----------------- | --------------------------- |
| Light | `#FFFFFF`  | Teal (`#14B8A6`)  | Clean white background      |
| Dark  | `#0F0F11`  | Teal (`#14B8A6`)  | Dark mode with cyan accents |
| Oak   | `#DDD9CE`  | Brown (`#3C2415`) | Warm beige/wood toned       |

### Oak Theme Colors

```css
/* Pale Oak Palette */
--background: #ddd9ce; /* oklch(0.88 0.015 85) */
--foreground: #3c2415; /* Dark brown text */
--primary: #3c2415; /* Dark brown */
--accent: #4a3020; /* Medium brown */
```

### Theme Implementation

- Theme context: `src/contexts/ThemeContext.tsx`
- CSS variables: `src/index.css` (`:root`, `.dark`, `.oak` blocks)
- Toggle cycles: Light → Dark → Oak → Light

## Fonts

- **Body**: Plus Jakarta Sans
- **Display**: Space Grotesk
- **Logo**: Blockat (custom)

## Logo Configuration

The navbar logo uses a combined image (`/public/logo-full.png`) containing both the icon and "KHANECT" text.

### Navbar Logo Styling

```css
/* Current logo classes in Navbar.tsx */
h-40           /* Height: 160px */
-mt-6          /* Negative top margin for vertical positioning */
-mb-10         /* Negative bottom margin to keep navbar compact */
-ml-10         /* Negative left margin to align with page content */
object-contain /* Preserve aspect ratio */
```

### Key Files

| File                        | Purpose                           |
| --------------------------- | --------------------------------- |
| `public/logo-full.png`      | Combined logo with icon + text    |
| `public/logo.png`           | Icon-only variant                 |
| `src/components/Navbar.tsx` | Logo implementation (lines 70-74) |

### Alignment Notes

- Logo is left-aligned to match the "Deep Work" heading in the hero section
- Negative margins compensate for whitespace in the logo image
- Navbar has `py-0` (no vertical padding) for minimal height

## Key Files to Know

| File                                      | Purpose                           |
| ----------------------------------------- | --------------------------------- |
| `src/components/LandingPage.tsx`          | Main landing page with form logic |
| `src/components/ui/ai-assistant-card.tsx` | Floating AI chat widget           |
| `src/components/ui/dotted-surface.tsx`    | Three.js 3D background            |
| `src/components/ui/meteors.tsx`           | Meteor particle effect            |
| `src/contexts/ThemeContext.tsx`           | Theme state management            |
| `src/services/chatbotService.ts`          | AI chat API integration           |
| `src/services/n8nService.ts`              | Lead processing webhook           |
| `src/utils/validation.ts`                 | Form validation logic             |
| `tailwind.config.js`                      | Custom theme configuration        |
| `vite.config.ts`                          | Build configuration with chunking |

## Testing

- Framework: Vitest with jsdom
- Component testing: React Testing Library
- Test files: Co-located in `__tests__/` directories
- Run: `bun test`

## Code Conventions

1. **Path Alias**: Use `@/` for `src/` imports
2. **Components**: Functional components with TypeScript interfaces
3. **Styling**: Tailwind classes, avoid inline styles
4. **Icons**: Use Lucide React or custom icons from `components/icons/`
5. **Animations**: Prefer GSAP for scroll-triggered, Framer Motion for interactions
6. **Forms**: Always validate, always rate-limit submissions

## Security

- CORS whitelisting configured
- Input validation with max lengths
- HTML sanitization for XSS prevention
- Supabase RLS policies for data protection
- No secrets in frontend code

## Performance

- Code splitting: vendor, charts, supabase, ui chunks
- Console/debugger removed in production
- Mobile-optimized particle counts in 3D
- Smooth scrolling with Lenis

## SEO

### Structured Data (JSON-LD)

Rich snippets enabled via `useStructuredData` hook and schema generators in `src/utils/structuredData.ts`.

| Page           | Schemas                                     |
| -------------- | ------------------------------------------- |
| Homepage       | Organization, WebSite, FAQPage, HowTo       |
| Pricing        | Organization, BreadcrumbList, Product/Offer |
| Service Pages  | Organization, BreadcrumbList, Service       |
| Industry Pages | Organization, BreadcrumbList, Service       |

**Key Files:**

- `src/utils/structuredData.ts` - Schema generator functions
- `src/hooks/useStructuredData.ts` - JSON-LD injection hook

### Sitemap & Robots

- `public/sitemap.xml` - All 12 indexable pages
- `public/robots.txt` - Crawler directives, blocks `/portal` and `/demo/`

### Canonical URLs

- Static canonical in `index.html` for homepage
- Dynamic canonicals via `useCanonicalUrl` hook in `src/hooks/useCanonicalUrl.ts`
- Updates `og:url` and `twitter:url` meta tags on route change

### Redirects (.htaccess)

- HTTP → HTTPS (301 redirect)
- www → non-www (301 redirect to `https://khanect.com`)
- SPA routing fallback to `index.html`

### Verification Tools

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)
- Google Search Console for indexing status
