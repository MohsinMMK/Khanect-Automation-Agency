# Khanect Chatbot Enhancement

## Goal

Enhance the Khanect AI chatbot with lead capture, calendar booking, and human escalation capabilities.

## Prerequisites

- N8N instance: `https://n8n.srv1222580.hstgr.cloud`
- Main chatbot workflow: `BgaY3sr0dqC90XuQ`
- Supporting workflows created via this enhancement:
  - Calendar API: `pMqmIcIkI5jxmgvi`
  - Escalation Handler: `naNC0gUEZJpZ24sq`

## Migration: Supabase Table

Run the migration: `supabase/migrations/20260129_chatbot_leads.sql`

```sql
CREATE TABLE IF NOT EXISTS chatbot_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  business_type TEXT,
  pain_points TEXT,
  source_channel TEXT NOT NULL,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Manual N8N Changes Required

### 1. Fix Switch Node (Messenger Condition)

In workflow `BgaY3sr0dqC90XuQ`, edit the **Switch** node:
- Find the condition for "messenger"
- Change `"messenger "` (with trailing space) to `"messenger"`

### 2. Fix Messenger Reply Body

In the **HTTP Request1** (Messenger Reply) node:
- Current body: `"body": "="`
- Change to:
```json
={
  "recipient": { "id": "{{ $node['normalize message'].json.from }}" },
  "message": { "text": "{{ $json.output }}" }
}
```

### 3. Add Instagram Reply Node

Add new HTTP Request node after Switch output index 2:
- **Name**: Instagram Reply
- **Method**: POST
- **URL**: `https://graph.facebook.com/v22.0/me/messages`
- **Authentication**: Bearer Auth (use "facebook page auth" credential)
- **Body**:
```json
={
  "recipient": { "id": "{{ $node['normalize message'].json.from }}" },
  "message": { "text": "{{ $json.output }}" }
}
```
- Connect Switch output 2 (instagram) to this node

### 4. Add AI Agent Tools

Add these 4 HTTP Request Tool nodes to the Generic AI Agent:

#### Tool 1: Save Lead (`save_lead`)
- **Type**: `@n8n/n8n-nodes-langchain.toolHttpRequest`
- **Name**: Save Lead Tool
- **Description**: Save a qualified lead to the database. Use after collecting: name, phone, business type, and pain points from the user.
- **Method**: POST
- **URL**: `https://ddmbekdbwuolpsjdhgub.supabase.co/rest/v1/chatbot_leads`
- **Headers**:
  - `apikey`: `{service_role_key}`
  - `Authorization`: `Bearer {service_role_key}`
  - `Content-Type`: `application/json`
  - `Prefer`: `return=representation`
- **Placeholders**:
  - `name` (string): Customer's name
  - `phone` (string): Customer's phone number
  - `email` (string): Customer's email address
  - `business_type` (string): Type of business
  - `pain_points` (string): Customer's challenges/needs
  - `source_channel` (string): Channel (whatsapp/instagram/messenger)
- **Body**:
```json
{
  "name": "{name}",
  "phone": "{phone}",
  "email": "{email}",
  "business_type": "{business_type}",
  "pain_points": "{pain_points}",
  "source_channel": "{source_channel}"
}
```

#### Tool 2: Check Calendar Availability (`check_calendar_availability`)
- **Type**: `@n8n/n8n-nodes-langchain.toolHttpRequest`
- **Name**: Check Calendar Availability
- **Description**: Check available 30-minute slots for discovery calls on a specific date.
- **Method**: POST
- **URL**: `https://n8n.srv1222580.hstgr.cloud/webhook/khanect-check-availability`
- **Placeholders**:
  - `date` (string): Date in YYYY-MM-DD format
- **Body**:
```json
{
  "date": "{date}"
}
```

#### Tool 3: Book Discovery Call (`book_discovery_call`)
- **Type**: `@n8n/n8n-nodes-langchain.toolHttpRequest`
- **Name**: Book Discovery Call
- **Description**: Book a 30-minute discovery call after the user confirms a time slot.
- **Method**: POST
- **URL**: `https://n8n.srv1222580.hstgr.cloud/webhook/khanect-book-call`
- **Placeholders**:
  - `date` (string): Date in YYYY-MM-DD format
  - `slot_start` (string): Start time in HH:MM format
  - `name` (string): Customer's name
  - `phone` (string): Customer's phone number
  - `email` (string): Customer's email address
- **Body**:
```json
{
  "date": "{date}",
  "slot_start": "{slot_start}",
  "name": "{name}",
  "phone": "{phone}",
  "email": "{email}"
}
```

#### Tool 4: Escalate to Human (`escalate_to_human`)
- **Type**: `@n8n/n8n-nodes-langchain.toolHttpRequest`
- **Name**: Escalate to Human
- **Description**: Escalate conversation to human team member when you cannot help the user or they request human assistance.
- **Method**: POST
- **URL**: `https://n8n.srv1222580.hstgr.cloud/webhook/khanect-escalation`
- **Placeholders**:
  - `reason` (string): Why escalation is needed
  - `summary` (string): Summary of the conversation so far
  - `contact_info` (string): Customer's contact information if available
  - `channel` (string): Source channel (whatsapp/instagram/messenger)
  - `session_id` (string): Chat session identifier
- **Body**:
```json
{
  "reason": "{reason}",
  "summary": "{summary}",
  "contact_info": "{contact_info}",
  "channel": "{channel}",
  "session_id": "{session_id}"
}
```

### 5. Update System Prompt

Add the following to the AI Agent's system prompt:

```
## Available Tools

### 1. Save Lead (save_lead)
Save interested users to the database after collecting their information: name, phone, business type, and pain points.
- Use after meaningful conversation - don't ask for all info at once
- Collect information naturally throughout the conversation
- Confirm with user before saving

### 2. Check Availability (check_calendar_availability)
Check available 30-minute slots for discovery calls.
- Ask user for their preferred date first
- Present 2-3 available options
- Format: "I have availability on [date] at [time1], [time2], or [time3]. Which works best?"

### 3. Book Discovery Call (book_discovery_call)
Book a confirmed time slot for a discovery call.
- Only use after user confirms specific date and time
- Requires: name, phone, email, date, and time slot
- Confirm booking details with user

### 4. Escalate to Human (escalate_to_human)
Use when:
- You cannot answer after searching the knowledge base
- User explicitly requests human assistance
- Complex or custom requirements beyond standard packages
- Customer complaints or frustration

Tell user: "I'm connecting you with our team. Someone will reach out within 24 hours."

## Tool Usage Guidelines
- Build rapport before collecting contact information
- Present 2-3 time options when booking calls
- Always confirm bookings with the user
- Inform the user before escalating
- Never collect information all at once - be conversational
```

## Supporting Workflows Configuration

### Calendar API Workflow (`pMqmIcIkI5jxmgvi`)

1. Open workflow in N8N
2. Configure Google Calendar credential (select the calendar to check)
3. Configure Google Sheets credential (create or select a sheet for booking logs)
4. Update the sheet columns: Date, Time, Name, Phone, Email, Booked At
5. Activate the workflow

### Escalation Handler Workflow (`naNC0gUEZJpZ24sq`)

1. Open workflow in N8N
2. Configure Gmail credential for sending notifications
3. Update the "To" email address in Gmail node (default: mohsinkhanking1999@gmail.com)
4. Configure Google Sheets credential (create or select an escalation log sheet)
5. Update the sheet columns: Timestamp, Reason, Summary, Contact Info, Channel, Session ID, Status
6. Activate the workflow

## Testing Checklist

1. [ ] Send test message via WhatsApp - verify reply works
2. [ ] Send test message via Instagram - verify reply works (was broken before)
3. [ ] Send test message via Messenger - verify reply works
4. [ ] Say "I'm interested in automation for my business" - verify lead capture works
5. [ ] Say "I want to book a call" - verify availability check and booking works
6. [ ] Say "I need to speak to a human" - verify escalation email is sent
7. [ ] Check Supabase `chatbot_leads` table for new entries
8. [ ] Check Google Calendar for booked appointments
9. [ ] Check Google Sheets for booking and escalation logs

## Edge Cases

- **Rate Limits**: Supabase REST API has generous limits, but monitor if high volume
- **Calendar Busy**: If no slots available, suggest alternate dates
- **Email Failures**: Gmail has sending limits (500/day), monitor if high escalation volume
- **Webhook Timeouts**: N8N webhooks timeout after 120s, keep processing fast
