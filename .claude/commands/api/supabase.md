---
description: Supabase database, auth, and query patterns
allowed-tools: Read, Write, Edit, Glob, Grep
argument-hint: [action] [table-or-feature]
---

# Khanect AI - Supabase Integration

## Client Setup
File: `src/lib/supabase.ts`

```tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

## Database Types (src/types.ts)

```tsx
export interface Client {
  id: string;
  email: string;
  company_name: string;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  website?: string;
  message: string;
  created_at: string;
}
```

## Common Patterns

### Insert Data
```tsx
const { data, error } = await supabase
  .from('contact_submissions')
  .insert([{ full_name, email, phone, business_name, website, message }])
  .select();
```

### Query with Filter
```tsx
const { data, error } = await supabase
  .from('clients')
  .select('*')
  .eq('email', email)
  .single();
```

### Auth - Get User
```tsx
const { data: { user } } = await supabase.auth.getUser();
```

### Auth - Sign In
```tsx
const { data, error } = await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: window.location.origin + '/portal' }
});
```

## Environment Variables
- `VITE_SUPABASE_URL` - Project URL
- `VITE_SUPABASE_ANON_KEY` - Anonymous key (frontend)
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (Edge Functions only)

## Key Files
- `src/lib/supabase.ts` - Client initialization
- `src/types.ts` - TypeScript interfaces
- `src/components/LandingPage.tsx` - Form submission example
- `supabase/` - Edge functions, migrations

## Task: $ARGUMENTS
