# Security Documentation

## Overview

This document outlines security measures, best practices, and configurations implemented in the KHANECT AI codebase.

---

## Authentication

### Supabase Auth

**Configuration:** `src/lib/supabase.ts`

```typescript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
```

**Features:**
- Email/password authentication
- JWT-based sessions
- Auto token refresh
- Session persistence in localStorage

---

## Authorization (Row Level Security)

### RLS Policies

| Table | Anonymous | Authenticated | Service Role |
|-------|-----------|---------------|--------------|
| `contact_submissions` | INSERT only | - | Full access |
| `clients` | - | Own records | Full access |
| `conversation_history` | - | - | Full access |
| `lead_scores` | - | - | Full access |
| `followup_queue` | - | - | Full access |
| `agent_interactions` | - | - | Full access |

**Key Policy:**
```sql
-- Allow anonymous form submissions
CREATE POLICY "Allow anonymous inserts to contact_submissions"
ON contact_submissions
FOR INSERT TO anon WITH CHECK (true);
```

---

## CORS Configuration

**Location:** `supabase/functions/_shared/cors.ts`

### Allowed Origins

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'https://khanect.com',
  'https://www.khanect.com',
];
```

### Security Headers

```typescript
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};
```

**Note:** Update `ALLOWED_ORIGINS` when deploying to production with your actual domain.

---

## Input Validation

### Client-Side Validation

**Location:** `src/utils/validation.ts`

**Max Length Limits:**
| Field | Max Length |
|-------|------------|
| Name | 100 |
| Email | 254 |
| Phone | 20 |
| Business Name | 200 |
| Website | 253 |
| Message | 2000 |

**Validation Functions:**
- `validateEmail()` - RFC 5322 regex
- `validatePhone()` - 10-15 digits
- `validateUrl()` - Domain format validation
- `validateName()` - Min 2 chars, must contain letters
- `sanitizeInput()` - Strips HTML tags

### HTML Input Attributes

All form inputs include `maxLength` attribute for browser-level enforcement:

```tsx
<input maxLength={MAX_LENGTHS.name} />
<textarea maxLength={MAX_LENGTHS.message} />
```

---

## Rate Limiting

### Contact Form

**Location:** `src/components/LandingPage.tsx`

```typescript
const RATE_LIMIT_SECONDS = 60;
const RATE_LIMIT_KEY = 'khanect_last_submission';
```

**Implementation:**
- 60-second cooldown between submissions
- Timestamp stored in sessionStorage
- Button disabled during cooldown
- Countdown displayed to user

---

## XSS Prevention

### React Auto-Escaping

React automatically escapes content in JSX expressions.

### Email HTML Sanitization

**Location:** `supabase/functions/followup-scheduler/index.ts`

```typescript
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

function sanitizeUrl(url: string): string {
  // Only allow http/https protocols
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return '#';
  }
  return escapeHtml(url);
}
```

### Input Sanitization

```typescript
// src/utils/validation.ts
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input.replace(/<[^>]*>/g, '').trim();
};
```

---

## Environment Variables

### Frontend (Exposed to Browser)

```bash
# These are PUBLIC - safe to expose
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...  # Has limited permissions via RLS
VITE_N8N_WEBHOOK_URL=https://n8n.example.com/webhook/...
```

### Backend (Never in Frontend)

```bash
# These are SECRET - never expose to browser
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # Full database access
OPENAI_API_KEY=sk-...
RESEND_API_KEY=re_...
```

**Best Practices:**
1. Never commit `.env` to version control (add to `.gitignore`)
2. Use `.env.example` for documentation
3. Store secrets in Supabase Dashboard for Edge Functions
4. Use VITE_ prefix only for public variables

---

## Error Handling

### Error Boundary

**Location:** `src/components/ErrorBoundary.tsx`

- Catches React component errors
- Displays user-friendly error UI
- Logs errors only in development mode

### Production Error Logging

```typescript
// Only log in development
if (import.meta.env.DEV) {
  console.error('Error:', error);
}
```

---

## API Security

### Edge Function Authentication

All Edge Functions validate authorization:

```typescript
// Verify service role for admin endpoints
const authHeader = req.headers.get('Authorization');
if (!authHeader?.startsWith('Bearer ')) {
  return errorResponse('Unauthorized', 401);
}
```

### Webhook Security

N8N webhook URL should be kept confidential. Consider adding:
- Request signing
- IP allowlisting
- Webhook secrets

---

## Security Checklist

### Development

- [ ] Use `.env.local` for local secrets
- [ ] Never commit real API keys
- [ ] Test with dev Supabase project

### Deployment

- [ ] Update CORS allowed origins for production domain
- [ ] Enable RLS on all tables
- [ ] Set Edge Function secrets in Supabase Dashboard
- [ ] Use HTTPS only
- [ ] Enable Supabase Auth email verification

### Ongoing

- [ ] Rotate API keys periodically
- [ ] Monitor for unusual activity
- [ ] Keep dependencies updated
- [ ] Review RLS policies after schema changes

---

## Known Limitations

1. **No server-side rate limiting** - Rely on Supabase defaults
2. **No CAPTCHA** - Could add hCaptcha/Turnstile for spam protection
3. **No MFA** - Could enable via Supabase Auth
4. **No audit logging** - Could add for compliance

---

## Incident Response

If you suspect a security breach:

1. **Immediately** rotate affected API keys
2. Check Supabase logs for unusual activity
3. Review Edge Function invocation logs
4. Contact Supabase support if needed
5. Notify affected users if data was compromised

---

## Reporting Security Issues

Report security vulnerabilities to: security@khanect.com

Do not create public GitHub issues for security concerns.
