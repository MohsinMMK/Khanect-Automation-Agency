# Database Schema Documentation

## Overview

KHANECT AI uses **Supabase PostgreSQL** as the backend database. The schema supports lead generation, client management, AI conversations, and automated email sequences.

## Connection

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## Tables

### 1. contact_submissions

Stores lead form submissions from the dedicated `/contact` page.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `full_name` | TEXT | No | - | Contact's full name |
| `email` | TEXT | No | - | Contact's email address |
| `phone` | TEXT | No | - | Phone with country code |
| `business_name` | TEXT | No | - | Company/business name |
| `website` | TEXT | Yes | NULL | Optional website URL |
| `message` | TEXT | Yes | NULL | Optional message |
| `processing_status` | TEXT | No | `'pending'` | Status: pending, processing, completed, failed |
| `processed_at` | TIMESTAMPTZ | Yes | NULL | When lead was processed |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Submission timestamp |

**RLS Policies:**
- `Allow anonymous inserts` - Anonymous users can INSERT (for public form)
- `Service role full access` - Backend automations have full access

---

### 2. clients

Stores authenticated client accounts for the client portal.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `user_id` | TEXT | No | - | Foreign key to auth.users |
| `email` | TEXT | No | - | Client email |
| `business_name` | TEXT | No | - | Business name |
| `full_name` | TEXT | Yes | NULL | Client's full name |
| `phone` | TEXT | Yes | NULL | Phone number |
| `status` | TEXT | No | `'pending'` | Status: active, inactive, pending |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Account creation |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update |

**RLS Policies:**
- Authenticated users can read their own records
- Service role has full access

---

### 3. conversation_history

Stores AI chatbot conversation logs for context and analytics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `session_id` | TEXT | No | - | Browser session ID |
| `role` | TEXT | No | - | Message role: user, assistant, system |
| `content` | TEXT | No | - | Message content |
| `model_used` | TEXT | Yes | NULL | AI model (e.g., gpt-4o-mini) |
| `tokens_used` | INTEGER | Yes | NULL | Token count |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Message timestamp |
| `metadata` | JSONB | No | `'{}'` | Additional metadata |

**Indexes:**
- `idx_conversation_session` on `session_id`
- `idx_conversation_created` on `created_at`

**RLS Policies:**
- Service role only (Edge Functions)

---

### 4. lead_scores

Stores AI-generated lead qualification scores and analysis.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `contact_submission_id` | UUID | No | - | FK to contact_submissions |
| `score` | INTEGER | No | - | Lead score (0-100) |
| `category` | TEXT | No | - | Category: hot, warm, cold, unqualified |
| `reasoning` | TEXT | Yes | NULL | AI reasoning |
| `budget_indicator` | TEXT | Yes | NULL | Budget: high, medium, low, unknown |
| `urgency_indicator` | TEXT | Yes | NULL | Urgency: high, medium, low |
| `decision_maker_likelihood` | INTEGER | Yes | NULL | Likelihood (0-100) |
| `industry_fit_score` | INTEGER | Yes | NULL | Fit score (0-100) |
| `engagement_score` | INTEGER | Yes | NULL | Engagement (0-100) |
| `ai_analysis` | JSONB | Yes | NULL | Full AI analysis JSON |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update |

**Indexes:**
- `idx_lead_scores_category` on `category`
- `idx_lead_scores_score` on `score DESC`
- `idx_lead_scores_contact` on `contact_submission_id`

**Foreign Keys:**
- `contact_submission_id` -> `contact_submissions.id` ON DELETE CASCADE

**RLS Policies:**
- Service role only (Edge Functions)

---

### 5. followup_queue

Manages automated email sequences for lead nurturing.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `contact_submission_id` | UUID | No | - | FK to contact_submissions |
| `lead_score_id` | UUID | Yes | NULL | FK to lead_scores |
| `sequence_number` | INTEGER | No | `1` | Email sequence number |
| `email_type` | TEXT | No | - | Type: welcome, value_prop, case_study, demo_invite, check_in, final |
| `scheduled_for` | TIMESTAMPTZ | No | - | Scheduled send time |
| `sent_at` | TIMESTAMPTZ | Yes | NULL | Actual send time |
| `status` | TEXT | No | `'pending'` | Status: pending, sent, failed, cancelled |
| `email_subject` | TEXT | Yes | NULL | Email subject line |
| `email_body` | TEXT | Yes | NULL | Email body content |
| `error_message` | TEXT | Yes | NULL | Error if failed |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `NOW()` | Last update |

**Indexes:**
- `idx_followup_status` on `(status, scheduled_for)`
- `idx_followup_contact` on `contact_submission_id`

**Foreign Keys:**
- `contact_submission_id` -> `contact_submissions.id` ON DELETE CASCADE
- `lead_score_id` -> `lead_scores.id` ON DELETE SET NULL

**RLS Policies:**
- Service role only (Edge Functions)

---

### 6. agent_interactions

Tracks AI usage for cost monitoring and analytics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `interaction_type` | TEXT | No | - | Type: chat, lead_processing, email_generation |
| `session_id` | TEXT | Yes | NULL | Browser session ID |
| `contact_submission_id` | UUID | Yes | NULL | FK to contact_submissions |
| `model_used` | TEXT | No | - | AI model used |
| `input_tokens` | INTEGER | Yes | NULL | Input token count |
| `output_tokens` | INTEGER | Yes | NULL | Output token count |
| `total_cost_usd` | DECIMAL(10,6) | Yes | NULL | Cost in USD |
| `latency_ms` | INTEGER | Yes | NULL | Response latency |
| `success` | BOOLEAN | No | `true` | Success flag |
| `error_message` | TEXT | Yes | NULL | Error if failed |
| `created_at` | TIMESTAMPTZ | No | `NOW()` | Timestamp |

**Indexes:**
- `idx_agent_interactions_type` on `interaction_type`
- `idx_agent_interactions_date` on `created_at`

**RLS Policies:**
- Service role only (Edge Functions)

---

## Data Flow

1. User submits form on `/contact`.
2. Browser inserts into `contact_submissions` (anon policy).
3. Browser asynchronously calls n8n lead webhook (`processLead`) after insert success.
4. If webhook dispatch fails, UI still shows success and also shows a non-blocking warning toast.
5. n8n and backend automations process lead scoring/follow-up scheduling and update downstream tables.
6. Hourly retry job (`retry-pending-leads.yml`) replays recent `pending`/`failed` leads and marks dispatch failures as `failed`.
7. `followup-scheduler` and email delivery update `followup_queue` and write `agent_interactions`.

---

## Migrations

Located in `supabase/migrations/`:

| File | Description |
|------|-------------|
| `20241225_add_ai_tables.sql` | Creates AI tables (conversation_history, lead_scores, followup_queue, agent_interactions) |
| `20241225_setup_cron.sql` | Sets up pg_cron for automated email scheduling |
| `20241226_fix_contact_rls.sql` | Fixes RLS policies for anonymous inserts |

---

## TypeScript Interfaces

```typescript
// src/lib/supabase.ts

export interface Client {
  id: string;
  user_id: string;
  email: string;
  business_name: string;
  full_name: string | null;
  phone: string | null;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  website: string | null;
  created_at: string;
}
```

