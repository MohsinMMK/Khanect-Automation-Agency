# Authentication Setup Guide

This document explains how to set up the invite-only authentication system for the Khanect AI platform.

## Overview

The platform uses an **invite-only** authentication model where:
- ✅ No public sign-ups allowed
- ✅ Admins create users via invite script
- ✅ Client data stored in `clients` table (source of truth)
- ✅ Status-based access control (`active`, `inactive`, `pending`)
- ✅ Automatic Row Level Security (RLS) enforcement

---

## 1. Database Setup (Supabase)

### Step 1.1: Run SQL Schema

Go to **Supabase Dashboard → SQL Editor** and execute:

```sql
-- Create clients table (Source of Truth)
CREATE TABLE IF NOT EXISTS clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email text NOT NULL UNIQUE,
  business_name text NOT NULL,
  full_name text,
  phone text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can view own data
CREATE POLICY "Clients can view own data"
ON clients
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Service role full access
CREATE POLICY "Service role full access"
ON clients
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger function for auto-insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.clients (user_id, email, business_name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'business_name', 'Not Provided'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT SELECT ON clients TO authenticated;
GRANT ALL ON clients TO service_role;
```

### Step 1.2: Disable Public Sign-ups

**Critical Step:**

1. Go to **Supabase Dashboard → Authentication → Settings**
2. Find "**Enable email signup**"
3. **Turn it OFF** (toggle to disabled)
4. Save changes

This ensures only invited users can access the platform.

---

## 2. Environment Configuration

### Step 2.1: Get Your Service Role Key

1. Go to **Supabase Dashboard → Project Settings → API**
2. Copy the **`service_role`** key (NOT the `anon` key)
3. **⚠️ IMPORTANT**: Never commit this key to git!

### Step 2.2: Update `.env.local`

Add the service role key to your `.env.local`:

```env
GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Add this line
VITE_N8N_WEBHOOK_URL=your_webhook_url
```

---

## 3. Creating Client Invites

### Method 1: Using the Invite Script (Recommended)

```bash
# Basic usage
node scripts/create_invite.js <email> <business_name>

# With optional fields
node scripts/create_invite.js <email> <business_name> <full_name> <phone>

# Example
node scripts/create_invite.js john@acme.com "Acme Corp" "John Doe" "+1234567890"
```

**What happens:**
1. ✅ Creates auth user in Supabase
2. ✅ Automatically creates client record (via trigger)
3. ✅ Sends password reset email to user
4. ✅ Outputs temporary password (if email fails)

### Method 2: Manual via Supabase Dashboard

1. **Go to Authentication → Users**
2. **Click "Invite User"**
3. **Enter email**
4. **Add metadata** (click "Add user metadata"):
   ```json
   {
     "business_name": "Acme Corp",
     "full_name": "John Doe",
     "phone": "+1234567890"
   }
   ```
5. **Send invite**

---

## 4. User Login Flow

### For Invited Users:

1. Receive password reset email
2. Click link and set password
3. Go to `http://localhost:3000`
4. Click "Client Portal"
5. Sign in with email and new password

### After Login:

- ✅ System checks `clients` table for user record
- ✅ Verifies `status = 'active'`
- ✅ Loads personalized dashboard with business name
- ✅ Shows metrics and automation data

---

## 5. Managing Client Access

### Change Client Status

```sql
-- Deactivate a client
UPDATE clients
SET status = 'inactive'
WHERE email = 'john@acme.com';

-- Reactivate a client
UPDATE clients
SET status = 'active'
WHERE email = 'john@acme.com';

-- Set to pending (awaiting approval)
UPDATE clients
SET status = 'pending'
WHERE email = 'john@acme.com';
```

**Effect:**
- `active`: Full access to dashboard
- `inactive`: Cannot log in (gets error message)
- `pending`: Cannot log in (gets error message)

### View All Clients

```sql
SELECT
  email,
  business_name,
  full_name,
  status,
  created_at
FROM clients
ORDER BY created_at DESC;
```

---

## 6. Security Checklist

- [ ] Disabled public sign-ups in Supabase Dashboard
- [ ] RLS policies enabled on `clients` table
- [ ] Service role key stored in `.env.local` (NOT committed to git)
- [ ] `.env.local` added to `.gitignore`
- [ ] Tested login with invited user
- [ ] Verified status-based access control

---

## 7. Troubleshooting

### User can't log in

**Check:**
1. Is `status = 'active'` in `clients` table?
2. Did they confirm their email or set password?
3. Is Supabase project active?

```sql
-- Check user status
SELECT email, status FROM clients WHERE email = 'user@example.com';
```

### Client record not created

**Fix:**
```sql
-- Manually create client record
INSERT INTO clients (user_id, email, business_name, full_name, status)
VALUES (
  'user_id_from_auth_users_table',
  'user@example.com',
  'Business Name',
  'Full Name',
  'active'
);
```

### Trigger not working

**Verify trigger exists:**
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

**Recreate if missing:**
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 8. Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Authentication Flow                 │
└─────────────────────────────────────────────────────┘

1. Admin runs invite script
   ↓
2. Supabase creates auth.users record
   ↓
3. Trigger auto-creates clients record
   ↓
4. User receives password reset email
   ↓
5. User sets password and logs in
   ↓
6. ClientPortal.tsx checks:
   - Is user authenticated?
   - Does client record exist?
   - Is status = 'active'?
   ↓
7. Dashboard loaded with personalized data
```

---

## 9. Files Modified

- ✅ `src/lib/supabase.ts` - Centralized Supabase client
- ✅ `src/components/ClientPortal.tsx` - Real auth implementation
- ✅ `src/components/LandingPage.tsx` - Uses centralized client
- ✅ `scripts/create_invite.js` - Invite script
- ✅ `.env.example` - Updated with service role key
- ✅ `docs/AUTH_SETUP.md` - This guide

---

## 10. Next Steps

1. **Test the flow:**
   - Create a test invite
   - Log in as that user
   - Verify dashboard loads

2. **Customize dashboard:**
   - Add real metrics from `clients` table
   - Connect to actual automation data
   - Implement per-client data filtering

3. **Add admin panel** (optional):
   - View all clients
   - Manage status
   - View analytics

---

## Support

If you encounter issues, check:
- Supabase logs (Dashboard → Logs)
- Browser console (F12 → Console tab)
- Network tab (F12 → Network tab)

For questions about this setup, refer to the Supabase documentation:
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
