---
description: Add or modify FAQ items
allowed-tools: Read, Write, Edit
argument-hint: [section] [action]
---

# Khanect AI - FAQ Data

## File Location
`src/data/faqs.ts`

## FAQ Interface

```tsx
export interface FAQ {
  question: string;
  answer: string;
  category?: 'general' | 'pricing' | 'technical';
}
```

## FAQ Sections
1. **General FAQs** - Landing page (`src/components/LandingPage.tsx`)
2. **Pricing FAQs** - Pricing page (`src/components/Pricing.tsx`)

## Adding FAQ

```tsx
export const faqs: FAQ[] = [
  {
    question: 'Your question here?',
    answer: 'Detailed answer with enough information to be helpful.',
    category: 'general',
  },
];
```

## Component
`src/components/FAQItem.tsx` - Accordion-style expandable item

## Task: $ARGUMENTS
