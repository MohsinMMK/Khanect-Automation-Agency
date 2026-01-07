---
description: Add or modify service offerings
allowed-tools: Read, Write, Edit
argument-hint: [action] [service-slug]
---

# Khanect AI - Services Data

## File Location
`src/data/services.ts`

## Service Interface

```tsx
export interface Service {
  slug: string;
  title: string;
  description: string;
  icon: string; // Icon component name
  features: string[];
  benefits: string[];
  process: {
    step: number;
    title: string;
    description: string;
  }[];
}
```

## Current Services
1. `n8n-automation` - N8N Workflow Automation
2. `ai-chatbots` - AI-Powered Chatbots
3. `crm-integration` - CRM Integrations
4. `lead-generation` - Lead Generation Automation

## Adding New Service

```tsx
export const services: Service[] = [
  // ... existing services
  {
    slug: 'new-service',
    title: 'New Service Name',
    description: 'Service description here',
    icon: 'IconName', // Must exist in src/components/icons/
    features: [
      'Feature 1',
      'Feature 2',
      'Feature 3',
    ],
    benefits: [
      'Benefit 1',
      'Benefit 2',
    ],
    process: [
      { step: 1, title: 'Step 1', description: 'Description' },
      { step: 2, title: 'Step 2', description: 'Description' },
    ],
  },
];
```

## Related Files
- `src/components/ServiceCard.tsx` - Card display
- `src/components/ServiceDetailPage.tsx` - Detail page
- `src/components/LandingPage.tsx` - Services section

## Task: $ARGUMENTS
