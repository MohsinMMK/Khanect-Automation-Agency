# Khanect AI Chatbot System

## Overview

Multi-channel AI chatbot for Khanect Automation Agency, handling customer inquiries across WhatsApp, Instagram, and Facebook Messenger. Built on N8N with GPT-4o-mini, Pinecone vector store for knowledge retrieval, and integrated tools for lead capture, calendar booking, and human escalation.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INCOMING MESSAGES                                  │
├─────────────────┬─────────────────┬─────────────────────────────────────────┤
│    WhatsApp     │    Instagram    │              Messenger                  │
│  (Meta Graph)   │  (Meta Graph)   │            (Meta Graph)                 │
└────────┬────────┴────────┬────────┴──────────────────┬──────────────────────┘
         │                 │                           │
         └─────────────────┼───────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     N8N WEBHOOK ENDPOINT                                     │
│         /webhook/3262e459-1150-47ae-ba85-51fe0efd609e                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Check Verification (Facebook webhook verification)                       │
│  2. Normalize Message (extract channel, from, text, sessionId)              │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI AGENT (GPT-4o-mini)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  - Postgres Chat Memory (10 message context)                                │
│  - Pinecone Vector Store (knowledge base retrieval)                         │
│  - 4 AI Tools: save_lead, check_availability, book_call, escalate           │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SWITCH (by channel)                                  │
├─────────────────┬─────────────────┬─────────────────────────────────────────┤
│    WhatsApp     │    Messenger    │              Instagram                  │
│   HTTP Reply    │   HTTP Reply    │             HTTP Reply                  │
│  (Graph v22.0)  │  (Graph v17.0)  │           (Graph v22.0)                 │
└─────────────────┴─────────────────┴─────────────────────────────────────────┘
```

---

## Workflows

### 1. Main Chatbot Workflow

| Property | Value |
|----------|-------|
| **Name** | Khanect Chatbot |
| **ID** | `BgaY3sr0dqC90XuQ` |
| **Status** | Active |
| **Webhook** | `https://n8n.srv1222580.hstgr.cloud/webhook/3262e459-1150-47ae-ba85-51fe0efd609e` |

### 2. Calendar API Workflow

| Property | Value |
|----------|-------|
| **Name** | Khanect Calendar API |
| **ID** | `pMqmIcIkI5jxmgvi` |
| **Status** | Active |
| **Check Availability** | `POST /webhook/khanect-check-availability` |
| **Book Call** | `POST /webhook/khanect-book-call` |

### 3. Escalation Handler Workflow

| Property | Value |
|----------|-------|
| **Name** | Khanect Escalation Handler |
| **ID** | `naNC0gUEZJpZ24sq` |
| **Status** | Active |
| **Webhook** | `POST /webhook/khanect-escalation` |

---

## Node Configuration

### Webhook Entry Point

```
Node: social media request
Type: Webhook
Path: 3262e459-1150-47ae-ba85-51fe0efd609e
Methods: GET (verification), POST (messages)
Response Mode: responseNode
```

### Message Normalizer

Extracts unified message format from WhatsApp, Instagram, and Messenger payloads:

```javascript
// Output format
{
  channel: "whatsapp" | "messenger" | "instagram",
  from: "<sender_id>",
  text: "<message_text>",
  sessionId: "<channel>:<sender_id>",
  profileName: "<optional>",
  id: "<message_id>",
  timestamp: "<unix_timestamp>"
}
```

### AI Agent Configuration

| Setting | Value |
|---------|-------|
| **Model** | GPT-4o-mini |
| **Memory** | Postgres Chat Memory (10 messages) |
| **Knowledge Base** | Pinecone Vector Store |
| **Tools** | 4 HTTP Request Tools |

### System Prompt

The AI agent uses a comprehensive system prompt that includes:

- Role definition (Khanect Automation Agency assistant)
- Knowledge retrieval instructions (always check Pinecone first)
- Core services overview (N8N, AI Chatbots, CRM, Lead Gen)
- Industries served (Healthcare, Auto, E-commerce, Real Estate, Coaching, Agencies)
- Pricing overview (Starter $1,500, Growth $3,500, Scale $7,500, Enterprise custom)
- Response guidelines (tone, length, lead qualification)
- Tool usage instructions for all 4 tools

---

## AI Agent Tools

### 1. save_lead

Saves qualified leads to Supabase after collecting information through conversation.

**Endpoint:** Supabase REST API
**Table:** `chatbot_leads`

**Request Body:**
```json
{
  "name": "Customer name",
  "phone": "Customer phone",
  "email": "Customer email",
  "business_type": "Type of business",
  "pain_points": "Customer challenges",
  "source_channel": "whatsapp/instagram/messenger"
}
```

**When to Use:**
- After collecting name, phone, and business information
- When user expresses interest in services
- Before or after booking a call

### 2. check_calendar_availability

Checks available 30-minute slots for discovery calls.

**Endpoint:** `POST https://n8n.srv1222580.hstgr.cloud/webhook/khanect-check-availability`

**Request Body:**
```json
{
  "date": "YYYY-MM-DD"
}
```

**Response:**
```json
{
  "date": "2026-02-06",
  "available_slots": ["09:00", "09:30", "10:00", "14:00", "14:30"],
  "timezone": "Asia/Kolkata"
}
```

**Business Hours:** 9:00 AM - 5:00 PM (30-minute slots)

### 3. book_discovery_call

Books a confirmed discovery call on Google Calendar.

**Endpoint:** `POST https://n8n.srv1222580.hstgr.cloud/webhook/khanect-book-call`

**Request Body:**
```json
{
  "date": "YYYY-MM-DD",
  "slot_start": "HH:MM",
  "name": "Customer name",
  "phone": "Customer phone",
  "email": "Customer email"
}
```

**Actions:**
1. Creates Google Calendar event
2. Logs booking to Supabase `calendar_bookings` table
3. Returns confirmation

### 4. escalate_to_human

Escalates conversation to human support when AI cannot help.

**Endpoint:** `POST https://n8n.srv1222580.hstgr.cloud/webhook/khanect-escalation`

**Request Body:**
```json
{
  "reason": "Why escalation needed",
  "summary": "Conversation summary",
  "contact_info": "Customer contact info",
  "channel": "whatsapp/instagram/messenger",
  "session_id": "Session ID"
}
```

**Actions:**
1. Sends email to mohsinkhanking1999@gmail.com
2. Logs escalation to Supabase `chatbot_escalations` table

**When to Use:**
- User explicitly requests human
- Complex technical questions outside knowledge base
- Complaints or sensitive issues
- Cannot provide satisfactory answer after 2 attempts

---

## Database Tables (Supabase)

### chatbot_leads

```sql
CREATE TABLE chatbot_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  email TEXT,
  business_type TEXT,
  pain_points TEXT,
  source_channel TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### calendar_bookings

```sql
CREATE TABLE calendar_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  phone TEXT,
  email TEXT,
  date DATE,
  slot_start TIME,
  slot_end TIME,
  google_event_id TEXT,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### chatbot_escalations

```sql
CREATE TABLE chatbot_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT,
  summary TEXT,
  contact_info TEXT,
  channel TEXT,
  session_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Credentials Required

### N8N Credentials

| Name | Type | Used By |
|------|------|---------|
| Google Drive account | OAuth2 | Knowledge base auto-update |
| OpenAi account | API Key | GPT-4o-mini, Embeddings |
| PineconeApi account | API Key | Vector store |
| Postgres account | Connection | Chat memory |
| Bearer Auth account | Bearer Token | WhatsApp API |
| facebook page auth | Bearer Token | Messenger/Instagram API |
| Google Calendar | OAuth2 | Calendar API workflow |
| Gmail | OAuth2 | Escalation emails |

### External Services

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| Meta Business Suite | WhatsApp, Instagram, Messenger | business.facebook.com |
| OpenAI | GPT-4o-mini, text-embedding-ada-002 | platform.openai.com |
| Pinecone | Vector database | app.pinecone.io |
| Supabase | PostgreSQL database | supabase.com |
| Google Cloud | Calendar, Gmail, Drive | console.cloud.google.com |

---

## Meta Webhook Configuration

### Facebook App Settings

**Webhook URL:** `https://n8n.srv1222580.hstgr.cloud/webhook/3262e459-1150-47ae-ba85-51fe0efd609e`

**Verify Token:** `Khanect`

### Subscribed Events

| Product | Events |
|---------|--------|
| WhatsApp | messages |
| Messenger | messages, messaging_postbacks |
| Instagram | messages |

### Required Permissions

- `whatsapp_business_messaging`
- `pages_messaging`
- `instagram_basic`
- `instagram_manage_messages`

---

## Knowledge Base

### Pinecone Index

| Property | Value |
|----------|-------|
| **Index Name** | khanect-docx-index |
| **Dimension** | 1536 (OpenAI embeddings) |
| **Metric** | Cosine |

### Source Document

| Property | Value |
|----------|-------|
| **File** | khanect-knowledge-base.docx |
| **Google Drive ID** | 1AsqeeeYbAzZA271_bKEvdaWWEBhwlb7c |
| **Folder** | Khanect Doc (1BlXQKvjzlAONh5g85_90VSsN8pEN5HPY) |

### Auto-Update Trigger

When the knowledge base document is updated in Google Drive, the workflow:
1. Downloads the updated file
2. Splits text into chunks (1000 chars, 200 overlap)
3. Generates OpenAI embeddings
4. Upserts to Pinecone vector store

**Note:** This feature requires valid Google Drive OAuth credentials.

---

## Reply Endpoints

### WhatsApp Reply

```
POST https://graph.facebook.com/v22.0/935682102965298/messages
Authorization: Bearer <WHATSAPP_TOKEN>
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "to": "<recipient_phone>",
  "type": "text",
  "text": { "body": "<response_text>" }
}
```

### Messenger Reply

```
POST https://graph.facebook.com/v17.0/me/messages
Authorization: Bearer <PAGE_ACCESS_TOKEN>
Content-Type: application/json

{
  "recipient": { "id": "<sender_id>" },
  "message": { "text": "<response_text>" }
}
```

### Instagram Reply

```
POST https://graph.facebook.com/v22.0/me/messages
Authorization: Bearer <PAGE_ACCESS_TOKEN>
Content-Type: application/json

{
  "recipient": { "id": "<sender_id>" },
  "message": { "text": "<response_text>" }
}
```

---

## Activation Checklist

### Before Activating

- [ ] Google Drive OAuth credential refreshed
- [ ] OpenAI API key valid and has credits
- [ ] Pinecone index exists and has embeddings
- [ ] Supabase tables created
- [ ] Meta webhook verified
- [ ] Calendar API workflow active
- [ ] Escalation Handler workflow active

### Activation Steps

1. Open N8N: https://n8n.srv1222580.hstgr.cloud
2. Go to Credentials → "Google Drive account"
3. Re-authenticate with Google
4. Open workflow `BgaY3sr0dqC90XuQ`
5. Toggle "Active" switch

---

## Testing Procedures

### 1. WhatsApp Test

1. Send message to WhatsApp Business number
2. Verify response received
3. Check N8N execution logs

### 2. Lead Capture Test

1. Say "I'm interested in automation for my e-commerce business"
2. Provide name, phone when asked
3. Check `chatbot_leads` table in Supabase

### 3. Calendar Booking Test

1. Say "I want to book a discovery call for tomorrow"
2. Confirm a time slot
3. Check Google Calendar for event
4. Check `calendar_bookings` table

### 4. Escalation Test

1. Say "I need to speak to a human"
2. Verify response mentions 24-hour follow-up
3. Check email delivery to mohsinkhanking1999@gmail.com
4. Check `chatbot_escalations` table

### 5. Knowledge Base Test

1. Ask "What services does Khanect offer?"
2. Verify response includes accurate service information
3. Ask "How much does the Growth package cost?"
4. Verify pricing matches knowledge base

---

## Troubleshooting

### Workflow Won't Activate

**Error:** OAuth token expired
**Solution:** Re-authenticate Google Drive credential in N8N

### No Response to Messages

1. Check webhook is receiving requests (N8N executions)
2. Verify Meta app webhook subscription
3. Check message normalizer output

### AI Gives Wrong Answers

1. Verify Pinecone index has embeddings
2. Check knowledge base document content
3. Re-index by updating the Google Drive document

### Calendar Slots Not Working

1. Check Calendar API workflow is active
2. Verify Google Calendar OAuth is valid
3. Check timezone settings

### Escalation Emails Not Sending

1. Check Escalation Handler workflow is active
2. Verify Gmail OAuth is valid
3. Check spam folder

---

## Monitoring

### N8N Execution Logs

- URL: https://n8n.srv1222580.hstgr.cloud/executions
- Filter by workflow to see chatbot activity

### Supabase Dashboard

- Leads: `SELECT * FROM chatbot_leads ORDER BY created_at DESC`
- Bookings: `SELECT * FROM calendar_bookings ORDER BY created_at DESC`
- Escalations: `SELECT * FROM chatbot_escalations ORDER BY created_at DESC`

### Key Metrics to Track

- Messages received per channel
- Response success rate
- Leads captured
- Calls booked
- Escalation rate

---

## Future Enhancements

### Phase 3: Website Integration

- Add website chat widget
- Connect to same N8N webhook
- Add `website` channel to normalizer

### Phase 4: Analytics Dashboard

- Build Supabase views for metrics
- Create portal dashboard component
- Track conversion rates

### Phase 5: Multi-language Support

- Add language detection
- Translate responses
- Store language preference

---

## Quick Reference

### Workflow IDs

```
Main Chatbot:     BgaY3sr0dqC90XuQ
Calendar API:     pMqmIcIkI5jxmgvi
Escalation:       naNC0gUEZJpZ24sq
```

### Webhook URLs

```
Chatbot:          /webhook/3262e459-1150-47ae-ba85-51fe0efd609e
Check Slots:      /webhook/khanect-check-availability
Book Call:        /webhook/khanect-book-call
Escalation:       /webhook/khanect-escalation
```

### N8N Instance

```
URL:              https://n8n.srv1222580.hstgr.cloud
API:              https://n8n.srv1222580.hstgr.cloud/api/v1
```

### Supabase

```
Project:          ddmbekdbwuolpsjdhgub
URL:              https://ddmbekdbwuolpsjdhgub.supabase.co
```

---

*Last Updated: 2026-02-05*
