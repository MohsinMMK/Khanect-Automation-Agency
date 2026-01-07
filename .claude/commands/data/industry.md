---
description: Add or modify industry solutions
allowed-tools: Read, Write, Edit
argument-hint: [action] [industry-slug]
---

# Khanect AI - Industries Data

## File Location
`src/data/industries.ts`

## Industry Interface

```tsx
export interface Industry {
  slug: string;
  title: string;
  description: string;
  icon: string;
  solutions: string[];
  useCases: string[];
  stats?: {
    label: string;
    value: string;
  }[];
}
```

## Current Industries
1. `healthcare` - Healthcare (HIPAA-compliant)
2. `automobile` - Automobile Dealerships
3. `ecommerce` - E-Commerce
4. `real-estate` - Real Estate
5. `coaching` - Coaching & Consulting
6. `agency` - Agencies

## Adding New Industry

```tsx
export const industries: Industry[] = [
  // ... existing
  {
    slug: 'new-industry',
    title: 'Industry Name',
    description: 'Industry description',
    icon: 'IconName',
    solutions: [
      'Solution 1',
      'Solution 2',
    ],
    useCases: [
      'Use case 1',
      'Use case 2',
    ],
    stats: [
      { label: 'Metric', value: '50%' },
    ],
  },
];
```

## Related Files
- `src/components/ServiceCard.tsx` - Card display
- `src/components/ServiceDetailPage.tsx` - Detail page
- `src/components/LandingPage.tsx` - Industries section

## Task: $ARGUMENTS
