# Khanect AI - Business Automation Agency

<div align="center">

AI-powered automation agency platform featuring an intelligent n8n chatbot, secure client portal, and comprehensive analytics dashboard.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://khanect.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

</div>

## Overview

Khanect AI is a modern automation agency platform that helps businesses streamline their operations through intelligent automation solutions. The platform features:

- **AI-Powered Chatbot**: n8n webhook-based intelligent assistant for business consultations
- **Contact Form**: Lead capture with automated follow-up scheduling
- **Client Portal**: Secure authentication system with invite-only access
- **Analytics Dashboard**: Real-time ROI tracking and performance metrics
- **Industry Solutions**: Tailored automation solutions for multiple industries

## Features

### AI Business Consultant
- Intelligent chatbot powered by n8n workflows
- Natural language processing for business queries
- Session-based conversation persistence
- Real-time response streaming

### Lead Management
- Contact form with validation and rate limiting
- Automated follow-up email scheduling via Supabase Edge Functions
- Lead scoring and tracking
- CRM-ready data structure

### Client Portal
- Invite-only authentication system via Supabase
- Row-Level Security (RLS) for data protection
- Status-based access control (active, inactive, pending)
- Client-specific ROI dashboards with interactive charts

### Security
- CORS origin whitelisting (localhost + production)
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- Rate limiting on form submissions (60-second cooldown)
- Input validation with max length limits
- HTML sanitization for email content (XSS prevention)
- React Error Boundaries for graceful error handling

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 19.2, TypeScript 5.8 |
| Styling | Tailwind CSS 4.1 |
| Build Tool | Vite 6.2 |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Edge Functions | Supabase Edge Functions (Deno) |
| AI Backend | n8n Webhook Integration |
| Charts | Recharts |
| Smooth Scroll | Lenis |
| Testing | Vitest, React Testing Library |

## Prerequisites

- **Bun** 1.0+ (recommended: 1.3+) - [Install Bun](https://bun.sh)
- **Supabase Account** (for authentication and database)
- **n8n Instance** (for chatbot functionality)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohsinMMK/Khanect-Automation-Agency.git
   cd Khanect-Automation-Agency
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # n8n Chatbot Webhook
   VITE_N8N_WEBHOOK_URL=your_n8n_webhook_url
   ```

4. **Set up Supabase Database**

   See [docs/DATABASE.md](docs/DATABASE.md) for complete schema and RLS policies.

5. **Run the development server**
   ```bash
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun test` | Run tests in watch mode |
| `bun run test:run` | Run tests once |
| `bun run test:coverage` | Run tests with coverage |

## Project Structure

```
khanect-ai/
├── public/                    # Static assets
│   ├── favicon.svg           # Lightning bolt icon
│   └── og-image.svg          # Social sharing image
├── src/
│   ├── components/           # React components
│   │   ├── __tests__/       # Component tests
│   │   ├── icons/           # Custom SVG icons
│   │   ├── AiConsultant.tsx # AI chatbot component
│   │   ├── ClientPortal.tsx # Client dashboard
│   │   ├── ErrorBoundary.tsx # Error handling
│   │   ├── LandingPage.tsx  # Main landing page
│   │   └── ...
│   ├── data/                # Static data
│   │   ├── faqs.ts
│   │   ├── industries.ts
│   │   ├── pricing.ts
│   │   └── services.ts
│   ├── lib/                 # Library configs
│   │   └── supabase.ts
│   ├── services/            # API services
│   │   └── chatbotService.ts
│   ├── utils/               # Utilities
│   │   ├── env.ts
│   │   └── validation.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── types.ts
├── supabase/
│   └── functions/           # Edge Functions
│       ├── _shared/
│       │   └── cors.ts      # CORS & security headers
│       └── followup-scheduler/
│           └── index.ts     # Follow-up email scheduler
├── docs/                    # Documentation
│   ├── API.md              # Edge Functions API
│   ├── AUTH_SETUP.md       # Auth setup guide
│   ├── COMPONENTS.md       # Component documentation
│   ├── DATABASE.md         # Database schema
│   └── SECURITY.md         # Security policies
├── scripts/
│   └── create_invite.js    # Client invite script
└── .env.local              # Environment variables
```

## Documentation

| Document | Description |
|----------|-------------|
| [DATABASE.md](docs/DATABASE.md) | Database schema, tables, and RLS policies |
| [API.md](docs/API.md) | Edge Functions endpoints and usage |
| [COMPONENTS.md](docs/COMPONENTS.md) | React component hierarchy and props |
| [SECURITY.md](docs/SECURITY.md) | Security implementation details |
| [AUTH_SETUP.md](docs/AUTH_SETUP.md) | Authentication setup guide |

## Database Schema

The platform uses 6 PostgreSQL tables:

| Table | Purpose |
|-------|---------|
| `contact_submissions` | Lead capture from contact form |
| `clients` | Authenticated client accounts |
| `conversation_history` | AI chatbot conversations |
| `lead_scores` | Lead qualification scores |
| `followup_queue` | Scheduled follow-up emails |
| `agent_interactions` | Agent activity tracking |

See [docs/DATABASE.md](docs/DATABASE.md) for complete schema.

## Deployment

### Hostinger (Recommended)
1. Build: `bun run build`
2. Upload `dist/` folder
3. Configure environment variables

### Vercel / Netlify
1. Connect GitHub repository
2. Build command: `bun run build`
3. Output directory: `dist`
4. Add environment variables

### Supabase Edge Functions
```bash
supabase functions deploy followup-scheduler
```

## Authentication

The platform uses **invite-only** authentication:

1. Admin creates invites via `create_invite.js`
2. Users receive password reset emails
3. Status-based access control (active/inactive/pending)
4. Row Level Security protects all data

```bash
# Create a client invite
node scripts/create_invite.js email@example.com "Business Name" "Full Name" "+1234567890"
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Links

- **Live Demo**: [khanect.com](https://khanect.com)
- **Repository**: [GitHub](https://github.com/MohsinMMK/Khanect-Automation-Agency)

## Author

**Mohsin MMK**
- GitHub: [@MohsinMMK](https://github.com/MohsinMMK)
- Email: mohsinkhanking1999@gmail.com

---

<div align="center">

**Khanect AI - Business Automation Agency**

Powered by AI | Built for Scale | Secure by Design

</div>
