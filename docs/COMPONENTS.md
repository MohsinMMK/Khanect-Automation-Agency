# Component Documentation

## Overview

KHANECT AI is built with **React 18** + **TypeScript** using **Vite** as the build tool. Components follow a modular architecture with clear separation of concerns.

---

## Component Hierarchy

```
App
├── Navbar
├── ErrorBoundary
│   ├── LandingPage
│   │   ├── StaggerContainer
│   │   │   └── ServiceCard (x4-6)
│   │   ├── ProcessStep (x6)
│   │   ├── FAQItem (x6)
│   │   ├── TabSwitch
│   │   └── CountryCodeSelect
│   │
│   ├── Pricing
│   │   └── PricingCard (x4)
│   │
│   └── ClientPortal
│
├── AiConsultant (floating widget)
└── Footer
```

---

## Page Components

### App

**Location:** `src/App.tsx`

Root component managing routing and global state.

**State:**
- `currentView: ViewState` - Current page (LANDING, DEMO, PRICING, PORTAL)
- `theme: 'light' | 'dark'` - Theme with localStorage persistence
- `showScrollTop: boolean` - Scroll-to-top button visibility

**Props:** None

---

### LandingPage

**Location:** `src/components/LandingPage.tsx`

Main marketing page with hero, services, process, FAQ, and contact form.

**Props:**
```typescript
interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}
```

**State:**
- `formData: FormData` - Form field values
- `formErrors: FormErrors` - Validation error messages
- `touchedFields: Set<string>` - Fields user has interacted with
- `countryCode: string` - Selected phone country code
- `isSubmitting: boolean` - Form submission in progress
- `submitStatus: 'idle' | 'success' | 'error'` - Submission result
- `rateLimitCooldown: number` - Seconds until next submission allowed
- `activeTab: 'services' | 'industries'` - Solutions tab selection
- `openFAQ: string | null` - Currently expanded FAQ

**Sections:**
1. Hero Section
2. Solutions Section (Services/Industries tabs)
3. Process Section (6-step timeline)
4. FAQ Section
5. Contact Form Section

---

### Pricing

**Location:** `src/components/Pricing.tsx`

Pricing tiers and comparison page.

**Props:**
```typescript
interface PricingProps {
  onNavigate: (view: ViewState) => void;
}
```

**Sections:**
1. Hero with trust indicators
2. Pricing Cards Grid (4 tiers)
3. Feature Comparison Table
4. Pricing FAQs
5. CTA Section

---

### ClientPortal

**Location:** `src/components/ClientPortal.tsx`

Authenticated client dashboard.

**Props:** None

**State:**
- `user: User | null` - Supabase auth user
- `client: Client | null` - Client data from database
- `loading: boolean` - Loading state
- `authError: string` - Login error message
- `lastUpdated: Date` - Dashboard refresh time

**Features:**
- Email/password login
- Session persistence
- Stats dashboard with charts (Recharts)

---

### AiConsultant

**Location:** `src/components/AiConsultant.tsx`

Floating AI chatbot widget.

**Props:**
```typescript
interface AiConsultantProps {
  onNavigate: () => void; // Close handler
}
```

**State:**
- `messages: Message[]` - Chat history
- `input: string` - Current input
- `isTextLoading: boolean` - Waiting for AI response
- `inputError: string` - Validation error

**Features:**
- Suggestion buttons
- Markdown rendering
- Auto-scroll to latest message
- Session persistence (localStorage)
- Retry logic (max 2 retries)

---

## UI Components

### Navbar

**Location:** `src/components/Navbar.tsx`

Fixed navigation header.

**Props:**
```typescript
interface NavbarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
```

**Features:**
- Logo and navigation links
- Theme toggle button
- Mobile hamburger menu
- CTA button

---

### ServiceCard

**Location:** `src/components/ServiceCard.tsx`

Card displaying service or industry info.

**Props:**
```typescript
interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  isIndustry?: boolean;
}
```

---

### PricingCard

**Location:** `src/components/PricingCard.tsx`

Pricing tier card.

**Props:**
```typescript
interface PricingCardProps {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
  onSelect: () => void;
}
```

---

### ProcessStep

**Location:** `src/components/ProcessStep.tsx`

Single step in the 6-step process timeline.

**Props:**
```typescript
interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  isLast?: boolean;
}
```

---

### FAQItem

**Location:** `src/components/FAQItem.tsx`

Expandable FAQ accordion item.

**Props:**
```typescript
interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}
```

---

### TabSwitch

**Location:** `src/components/TabSwitch.tsx`

Toggle between Services and Industries.

**Props:**
```typescript
interface TabSwitchProps {
  activeTab: 'services' | 'industries';
  onTabChange: (tab: 'services' | 'industries') => void;
}
```

---

### StaggerContainer

**Location:** `src/components/StaggerContainer.tsx`

GSAP-powered stagger animation wrapper.

**Props:**
```typescript
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}
```

---

### CountryCodeSelect

**Location:** `src/components/CountryCodeSelect.tsx`

Searchable country code dropdown for phone input.

**Props:**
```typescript
interface CountryCodeSelectProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}
```

---

### ErrorBoundary

**Location:** `src/components/ErrorBoundary.tsx`

React error boundary for graceful error handling.

**Props:**
```typescript
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
```

**Features:**
- Catches JavaScript errors in child tree
- Displays user-friendly error UI
- "Try again" and "Refresh" buttons
- Dev-only error logging

---

## Icon Components

**Location:** `src/components/icons/`

| Component | Usage |
|-----------|-------|
| `KhanectBoltIcon` | Brand logo |
| `WorkflowIcon` | Workflow automation service |
| `ChatbotIcon` | AI chatbots service |
| `CRMIcon` | CRM integration service |
| `LeadGenIcon` | Lead generation service |
| `HealthcareIcon` | Healthcare industry |
| `AutomobileIcon` | Automobile industry |
| `EcommerceIcon` | E-commerce industry |
| `RealEstateIcon` | Real estate industry |
| `CoachingIcon` | Coaching industry |
| `AgencyIcon` | Agency industry |
| `CheckmarkIcon` | Feature checkmarks |
| `ChevronIcon` | Accordion arrows |

---

## Data Files

**Location:** `src/data/`

| File | Content |
|------|---------|
| `services.ts` | 4 core service definitions |
| `industries.ts` | 6 industry solutions |
| `pricing.ts` | 4 pricing tier configs |
| `process.ts` | 6-step process definitions |
| `faqs.ts` | FAQ content |

---

## Hooks

**Location:** `src/hooks/`

### useGSAPStagger

GSAP ScrollTrigger stagger animation hook.

```typescript
function useGSAPStagger(
  containerRef: RefObject<HTMLElement>,
  options?: {
    stagger?: number;
    duration?: number;
    y?: number;
  }
): void
```

### useGSAPFadeIn

Simple fade-in animation on scroll.

```typescript
function useGSAPFadeIn(
  elementRef: RefObject<HTMLElement>,
  options?: {
    duration?: number;
    delay?: number;
  }
): void
```

---

## Utilities

### validation.ts

**Location:** `src/utils/validation.ts`

Form validation functions with max length enforcement.

```typescript
// Max lengths
const MAX_LENGTHS = {
  name: 100,
  email: 254,
  phone: 20,
  businessName: 200,
  website: 253,
  message: 2000,
};

// Functions
validateEmail(email: string): ValidationResult
validatePhone(phone: string): ValidationResult
validateUrl(url: string): ValidationResult
validateName(name: string, fieldName: string): ValidationResult
validateBusinessName(name: string): ValidationResult
validateMessage(message: string): ValidationResult
sanitizeInput(input: string): string
```

### formatMessage.tsx

**Location:** `src/utils/formatMessage.tsx`

Markdown to React converter for chat messages.

```typescript
function formatMessage(text: string): React.ReactNode
```

Supports:
- Bold (`**text**`)
- Italic (`*text*`)
- Headers (`#`, `##`)
- Bullet points
- Numbered lists
- Code blocks
- Links

---

## Styling

### Tailwind Config

**Location:** `tailwind.config.js`

Custom theme:
- **Colors:** `brand.lime` (#14B8A6), `brand.dark` (#050505)
- **Fonts:** Plus Jakarta Sans, Space Grotesk
- **Animations:** fade-in-up, pulse-slow, float, claude-fade

### Global Styles

**Location:** `src/index.css`

- Button system (primary, secondary, tertiary)
- Glass morphism effects
- Soft shadows
- Form styling
- Dark mode support
- Reduced motion support
