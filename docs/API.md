# API Documentation

## Overview

KHANECT AI uses **Supabase Edge Functions** for backend API endpoints. These are Deno-based serverless functions that handle AI processing, lead scoring, and email automation.

## Base URL

```
https://<project-id>.supabase.co/functions/v1/
```

---

## Edge Functions

### 1. chat-agent

AI-powered chatbot for website visitors.

**Endpoint:** `POST /functions/v1/chat-agent`

**Headers:**
```
Authorization: Bearer <SUPABASE_ANON_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "How can I automate my business?",
  "sessionId": "uuid-session-id",
  "history": [
    { "role": "user", "content": "Hello" },
    { "role": "assistant", "content": "Hi! How can I help?" }
  ]
}
```

**Response:**
```json
{
  "response": "Great question! Business automation can help...",
  "sessionId": "uuid-session-id"
}
```

**Error Response:**
```json
{
  "error": "Failed to process message"
}
```

**Location:** `supabase/functions/chat-agent/index.ts`

---

### 2. process-lead

Processes new lead submissions with AI scoring and follow-up scheduling.

**Endpoint:** `POST /functions/v1/process-lead`

**Headers:**
```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "submissionId": "uuid-submission-id",
  "fullName": "John Doe",
  "email": "john@company.com",
  "phone": "+1 555-123-4567",
  "businessName": "Acme Corp",
  "website": "acme.com",
  "message": "Looking to automate our sales process"
}
```

**Response:**
```json
{
  "success": true,
  "leadScore": {
    "score": 85,
    "category": "hot",
    "reasoning": "High intent signals...",
    "budget_indicator": "high",
    "urgency_indicator": "high"
  },
  "followupsScheduled": 6
}
```

**Error Response:**
```json
{
  "error": "Failed to process lead",
  "details": "Error message"
}
```

**Location:** `supabase/functions/process-lead/index.ts`

**Triggered by:** N8N webhook after form submission

---

### 3. followup-scheduler

Processes and sends scheduled follow-up emails.

**Endpoint:** `POST /functions/v1/followup-scheduler`

**Headers:**
```
Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "processed": 3,
  "sent": 2,
  "failed": 1,
  "results": [
    { "id": "uuid", "status": "sent" },
    { "id": "uuid", "status": "sent" },
    { "id": "uuid", "status": "failed", "error": "Invalid email" }
  ]
}
```

**Location:** `supabase/functions/followup-scheduler/index.ts`

**Triggered by:** pg_cron every 15 minutes

---

## Frontend Services

### n8nService

Sends lead data to N8N webhook for processing.

**Location:** `src/services/n8nService.ts`

```typescript
interface LeadData {
  submissionId: string;
  fullName: string;
  email: string;
  phone: string;
  businessName: string;
  website?: string;
  message?: string;
}

async function processLead(leadData: LeadData): Promise<{
  success: boolean;
  error?: string;
}>
```

**Usage:**
```typescript
import { processLead } from '../services/n8nService';

const result = await processLead({
  submissionId: 'uuid',
  fullName: 'John Doe',
  email: 'john@example.com',
  phone: '+1 555-1234',
  businessName: 'Acme Corp'
});
```

---

### chatbotService

Handles AI chatbot communication.

**Location:** `src/services/chatbotService.ts`

```typescript
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  retryCount?: number
): Promise<{
  response: string;
  sessionId: string;
}>
```

**Usage:**
```typescript
import { sendChatMessage } from '../services/chatbotService';

const result = await sendChatMessage(
  'How can you help my business?',
  previousMessages
);
```

---

## Environment Variables

### Frontend (Vite)

```bash
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
VITE_N8N_WEBHOOK_URL=https://n8n.example.com/webhook/...
```

### Edge Functions (Supabase Dashboard)

```bash
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
FROM_EMAIL=Khanect <hello@khanect.com>
```

---

## CORS Configuration

**Location:** `supabase/functions/_shared/cors.ts`

Allowed origins:
- `http://localhost:3000`
- `http://localhost:3001`
- `http://localhost:3002`
- `http://localhost:5173`
- `https://khanect.com`
- `https://www.khanect.com`

Security headers included:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (optional)"
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid auth)
- `500` - Internal Server Error

---

## Rate Limiting

- **Contact Form:** 60-second cooldown between submissions (client-side)
- **Edge Functions:** No server-side rate limiting (rely on Supabase defaults)

---

## Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────>│   Supabase  │────>│   Database  │
│  (React)    │     │  (Insert)   │     │ PostgreSQL  │
└─────────────┘     └─────────────┘     └─────────────┘
      │                                        │
      │                                        │
      v                                        v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    N8N      │────>│ process-lead│────>│ lead_scores │
│  Webhook    │     │ Edge Func   │     │   Table     │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           v
                    ┌─────────────┐
                    │ followup_   │
                    │   queue     │
                    └─────────────┘
                           │
                           │ (pg_cron)
                           v
                    ┌─────────────┐     ┌─────────────┐
                    │ followup-   │────>│   Resend    │
                    │ scheduler   │     │   Email     │
                    └─────────────┘     └─────────────┘
```
