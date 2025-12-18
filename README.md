<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Khanect Automation Agency Website

Modern, AI-powered website for Khanect Automation Agency featuring an intelligent chatbot consultant powered by n8n workflows.

View your app in AI Studio: https://ai.studio/apps/drive/1f61yDFGgncdvt2izRkPe6dkU-7QwBfVe

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- n8n instance with configured webhooks (for chatbot functionality)
- Supabase project (for backend services)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory by copying from the example:

```bash
cp .env.example .env
```

Then edit `.env` and add your actual configuration values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Supabase Admin (for invite script only - DO NOT commit to git!)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# n8n Webhook Configuration
VITE_N8N_WEBHOOK_URL=your_n8n_form_webhook_url
VITE_N8N_CHATBOT_WEBHOOK_URL=your_n8n_chatbot_webhook_url
```

**Important:**
- Replace all placeholder values with your actual URLs and keys
- `VITE_N8N_CHATBOT_WEBHOOK_URL` is required for the AI chatbot to work
- Never commit your `.env` file to version control (it's already in `.gitignore`)

### 3. Run Locally

```bash
npm run dev
```

The application will start at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Testing

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

## Deployment

When deploying to production (Vercel, Netlify, etc.), make sure to set the environment variables in your hosting platform's dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_N8N_WEBHOOK_URL`
- `VITE_N8N_CHATBOT_WEBHOOK_URL`

## Troubleshooting

### Chat Webhook Not Working

If the chatbot is not responding:

1. **Check environment variables:** Ensure `VITE_N8N_CHATBOT_WEBHOOK_URL` is set in your `.env` file
2. **Verify n8n webhook:** Test your n8n webhook URL directly to ensure it's accessible
3. **Check browser console:** Look for error messages in the browser's developer console
4. **Network issues:** Ensure there are no CORS issues or network restrictions blocking the webhook

### Common Issues

- **"Chatbot webhook URL is not configured"** - You need to set `VITE_N8N_CHATBOT_WEBHOOK_URL` in your `.env` file
- **CORS errors** - Configure your n8n webhook to allow requests from your domain
- **Environment variables not loading** - Restart the dev server after changing `.env` file
