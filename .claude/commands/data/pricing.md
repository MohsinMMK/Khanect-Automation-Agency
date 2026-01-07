---
description: Modify pricing plans and packages
allowed-tools: Read, Write, Edit
argument-hint: [action]
---

# Khanect AI - Pricing Data

## File Location
`src/data/pricing.ts`

## Pricing Interface

```tsx
export interface PricingPlan {
  name: string;
  price: number | 'Custom';
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}
```

## Current Plans

| Plan | Price | Highlighted |
|------|-------|-------------|
| Starter | $500 | No |
| Growth | $1000 | Yes (Popular) |
| Scale | $2000 | No |
| Enterprise | Custom | No |

## Plan Template

```tsx
{
  name: 'Plan Name',
  price: 1000, // or 'Custom'
  description: 'Brief description',
  features: [
    'Feature 1',
    'Feature 2',
    'Feature 3',
    'Feature 4',
  ],
  highlighted: false, // true for "Popular" badge
  cta: 'Get Started',
}
```

## Related Files
- `src/components/PricingCard.tsx` - Card display
- `src/components/Pricing.tsx` - Pricing page

## Task: $ARGUMENTS
