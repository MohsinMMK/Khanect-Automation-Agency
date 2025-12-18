# Khanect Automation Agency - Setup Guide

This guide will help you configure all the necessary services for the Khanect Automation Agency website.

## Table of Contents

1. [Setting up Supabase](#1-setting-up-supabase)
2. [Setting up n8n Webhooks](#2-setting-up-n8n-webhooks)
3. [Configuring Environment Variables](#3-configuring-environment-variables)
4. [Deployment](#4-deployment)

## 1. Setting up Supabase

Supabase is used for backend services like authentication and database.

### Steps:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings** > **API**
3. Copy the following values:
   - **Project URL** → Use for `VITE_SUPABASE_URL`
   - **anon/public key** → Use for `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → Use for `SUPABASE_SERVICE_ROLE_KEY` (Keep this secret!)

## 2. Setting up n8n Webhooks

n8n is used to power the AI chatbot functionality.

### Prerequisites:

- An n8n instance (self-hosted or n8n Cloud)
- Access to create workflows

### Setting up the Chatbot Webhook:

1. **Create a new workflow in n8n**

2. **Add a Webhook node:**
   - Click the "+" button and search for "Webhook"
   - Configure the webhook:
     - **HTTP Method:** POST
     - **Path:** Choose a unique path (e.g., `/chatbot`)
     - **Authentication:** None (or configure as needed)
     - **Response Mode:** "When Last Node Finishes"

3. **Add your AI processing logic:**
   - Connect your preferred AI service (OpenAI, Anthropic, Google AI, etc.)
   - Example flow:
     ```
     Webhook → Extract message and history → AI Node (GPT-4, Claude, etc.) → Return response
     ```

4. **Configure the AI node:**
   - Use the incoming data:
     - `{{ $json.message }}` - The user's current message
     - `{{ $json.history }}` - Array of previous messages with `role` and `text`
   - Build your prompt to include conversation history

5. **Add a Response node:**
   - Set the response format:
     ```json
     {
       "response": "{{ $json.output }}"
     }
     ```
   - Make sure to return the AI response in one of these fields: `response`, `text`, `message`, or `output`

6. **Activate the workflow** and copy the webhook URL

7. **Test the webhook:**
   ```bash
   curl -X POST YOUR_WEBHOOK_URL \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Hello",
       "history": []
     }'
   ```

### Expected Request Format:

The chatbot sends requests in this format:

```json
{
  "message": "User's current message",
  "history": [
    {
      "role": "user",
      "text": "Previous user message"
    },
    {
      "role": "model",
      "text": "Previous AI response"
    }
  ]
}
```

### Expected Response Format:

Your n8n workflow should return JSON in one of these formats:

```json
{
  "response": "AI response text"
}
```

Or:

```json
{
  "text": "AI response text"
}
```

Or any JSON object with `message` or `output` fields.

### Setting up the Form Webhook (Optional):

If you want to handle form submissions via n8n:

1. Create another workflow in n8n
2. Add a Webhook node similar to above
3. Add nodes to process form data (send emails, save to database, etc.)
4. Copy the webhook URL for `VITE_N8N_WEBHOOK_URL`

## 3. Configuring Environment Variables

### Local Development:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace all placeholder values:

   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here

   # Supabase Admin (for invite script only - DO NOT commit to git!)
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # n8n Webhook Configuration
   VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/form
   VITE_N8N_CHATBOT_WEBHOOK_URL=https://your-n8n-instance.com/webhook/chatbot
   ```

3. **Never commit the `.env` file!** It's already in `.gitignore`.

## 4. Deployment

### Deploying to Vercel:

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and import your repository

3. In the deployment settings, add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_N8N_WEBHOOK_URL`
   - `VITE_N8N_CHATBOT_WEBHOOK_URL`

4. Deploy!

### Deploying to Netlify:

1. Push your code to GitHub

2. Go to [netlify.com](https://netlify.com) and import your repository

3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

4. In Site settings > Environment variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_N8N_WEBHOOK_URL`
   - `VITE_N8N_CHATBOT_WEBHOOK_URL`

5. Deploy!

### Deploying to Other Platforms:

For any hosting platform that supports Node.js and static sites:

1. Set the environment variables in your platform's dashboard
2. Build command: `npm run build`
3. Output directory: `dist`

## Troubleshooting

### Chatbot not responding:

1. **Check the browser console** for errors
2. **Verify webhook URL** is correct and accessible
3. **Test the n8n webhook directly** using curl or Postman
4. **Check n8n workflow logs** for errors
5. **Verify CORS settings** - your n8n instance must allow requests from your domain

### CORS Issues:

If you see CORS errors in the browser console:

1. In n8n, edit your Webhook node
2. Add CORS headers in the Response section:
   ```
   Access-Control-Allow-Origin: *
   ```
   Or for production, specify your domain:
   ```
   Access-Control-Allow-Origin: https://yourdomain.com
   ```

### Environment variables not loading:

1. **Restart the dev server** after changing `.env`
2. **Check variable names** - they must start with `VITE_` to be accessible in the browser
3. **Rebuild the app** for production deployments

## Security Notes

- **Never commit** `.env` to version control
- **Keep your `SUPABASE_SERVICE_ROLE_KEY` secret** - it has admin access
- **Use HTTPS** for all webhook URLs in production
- **Configure proper CORS** on your n8n webhooks
- **Consider adding authentication** to your n8n webhooks for production use

## Need Help?

- Check the [n8n documentation](https://docs.n8n.io/)
- Check the [Supabase documentation](https://supabase.com/docs)
- Review the main [README.md](./README.md)
