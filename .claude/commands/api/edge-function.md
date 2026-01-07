---
description: Create or modify Supabase Edge Functions
allowed-tools: Read, Write, Edit, Glob, Grep
argument-hint: [function-name]
---

# Khanect AI - Supabase Edge Functions

## Location
`supabase/functions/[function-name]/index.ts`

## Edge Function Template

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data } = await req.json();

    // Function logic here

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Existing Function: chat-agent
Called by: `src/services/chatbotService.ts`

```tsx
const { data, error } = await supabase.functions.invoke('chat-agent', {
  body: { messages, sessionId }
});
```

## Environment Variables (Edge Functions)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`
- `FROM_EMAIL`

## Deploy Command
```bash
supabase functions deploy [function-name]
```

## Task: $ARGUMENTS
