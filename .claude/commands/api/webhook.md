---
description: N8N webhook integration patterns
allowed-tools: Read, Write, Edit, Glob
argument-hint: [action]
---

# Khanect AI - N8N Webhook Integration

## Service File
`src/services/n8nService.ts`

```tsx
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export interface LeadData {
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website?: string;
  message: string;
  source: string;
  timestamp: string;
}

export async function sendLeadToN8N(leadData: LeadData): Promise<{ success: boolean }> {
  if (!N8N_WEBHOOK_URL) {
    console.warn('N8N webhook URL not configured');
    return { success: false };
  }

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });

  return { success: response.ok };
}
```

## Usage in LandingPage.tsx

```tsx
import { sendLeadToN8N } from '@/services/n8nService';

// In form submit handler:
await sendLeadToN8N({
  ...formData,
  source: 'contact_form',
  timestamp: new Date().toISOString(),
});
```

## N8N Workflow Handles
1. Lead scoring
2. CRM integration
3. Email follow-up scheduling
4. Slack notifications

## Environment Variable
`VITE_N8N_WEBHOOK_URL` - Webhook endpoint URL

## Task: $ARGUMENTS
