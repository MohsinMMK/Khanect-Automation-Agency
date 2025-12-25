/**
 * Chat Agent Edge Function
 * Handles chatbot conversations using OpenAI GPT-4
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';
import { corsHeaders, handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import {
  OpenAIClient,
  ChatMessage,
  selectModel,
  calculateCost,
  MODELS,
} from '../_shared/openai-client.ts';

// Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// System prompt with Khanect knowledge
const SYSTEM_PROMPT = `You are Khanect AI Assistant, a friendly and knowledgeable consultant for Khanect Automation Agency. Your role is to help potential clients understand how AI and automation can transform their business.

## About Khanect Automation Agency:
We specialize in AI-powered automation solutions that help businesses save time, reduce costs, and scale efficiently. Our core focus areas include workflow automation, AI chatbots, CRM integrations, and lead generation systems.

## Core Services:

### 1. N8N Workflow Automation
Powerful workflow automation connecting hundreds of applications with complex, multi-step processes that run 24/7.
- Data synchronization between multiple platforms
- Automated email sequences and follow-up campaigns
- Custom API integrations for any web service
- Real-time reporting and automated analytics

### 2. AI-Powered Chatbots
Intelligent AI chatbots that handle customer inquiries, qualify leads, book appointments, and provide 24/7 support.
- Natural language understanding for conversations
- Lead qualification and appointment booking
- FAQ answering from custom knowledge base
- CRM integration with automatic contact creation

### 3. CRM Integrations
Seamlessly connect and automate your CRM systems to ensure no lead falls through the cracks.
- HubSpot, Salesforce, GoHighLevel, and more
- Automatic lead capture and scoring
- Automated follow-up sequences
- Customer lifecycle automation

### 4. Lead Generation Automation
Automated systems that continuously generate, capture, nurture, and qualify leads for your business.
- Landing pages with automated form processing
- Email marketing and drip campaigns
- Social media lead capture automation
- Analytics dashboards to track performance

## Industries We Serve:

### Healthcare
HIPAA-compliant automation including patient appointment scheduling, automated intake forms, insurance verification, and compliant chatbots.

### Automobile
Dealership solutions including lead capture from listings, test drive scheduling, service appointment booking, and maintenance reminders.

### E-Commerce
Online store automation including order processing, inventory sync, abandoned cart recovery, and customer support chatbots.

### Real Estate
Agent and brokerage solutions including lead capture from Zillow/Realtor.com, automated lead response, showing scheduling, and drip campaigns.

### Coaching & Consulting
Practice automation including discovery call scheduling, client onboarding, session booking, and invoice generation.

### Agency
Agency operations including client onboarding, project automation, branded reporting, and billing automation.

## Pricing Packages:

### Starter - $500/month
- Up to 3 workflow automations
- Basic CRM integration
- Email automation setup
- 30 days of support
- Documentation and training
Best for: Small businesses just getting started

### Growth - $1,000/month (Most Popular)
- Up to 7 workflow automations
- Advanced CRM integration
- AI chatbot implementation
- Lead generation automation
- 60 days of support
- Monthly optimization calls
Best for: Growing businesses ready to scale

### Scale - $2,000/month
- Up to 15 workflow automations
- Full CRM ecosystem integration
- Custom AI chatbot with knowledge base
- Complete lead generation system
- Customer portal development
- 90 days of priority support
- Bi-weekly strategy calls
Best for: Established businesses needing comprehensive automation

### Enterprise - Custom Pricing
- Unlimited workflow automations
- Custom software development
- Multi-department integration
- Dedicated automation engineer
- 24/7 priority support
- Quarterly business reviews
- SLA guarantees
Best for: Large businesses requiring custom enterprise solutions

## Our Process:
1. Discovery & Audit (Week 1) - Assess current systems and identify opportunities
2. Solution Design (Week 2-3) - Create custom automation blueprint
3. Build & Integration (Week 3-6) - Develop and test automations
4. Launch & Optimize (Week 6+) - Deploy and continuously improve

## Common Questions:

Q: How long does implementation take?
A: Simple automations: 1-2 weeks. Complex systems: 4-8 weeks. Enterprise: 2-3 months.

Q: Do I need technical knowledge?
A: No technical knowledge required. We build and maintain everything for you.

Q: Can you integrate with my existing tools?
A: Yes, we integrate with virtually any tool that has an API or webhook capability.

Q: How does the AI chatbot learn about my business?
A: We create a custom knowledge base from your website, FAQs, and documentation.

Q: What is included in ongoing support?
A: Monitoring, issue fixing, updates, check-in calls, and priority response for urgent issues.

## Guidelines for Responses:
- Be helpful, professional, and conversational
- Focus on understanding the visitor's business needs
- Highlight how automation can save time and reduce costs
- When appropriate, encourage booking a demo or filling out the contact form
- Keep responses concise but informative (2-4 paragraphs max)
- Use bullet points for lists
- If asked about specific pricing, mention packages but encourage a consultation for custom quotes
- Sound human and helpful, not salesy

## Important:
- If the user wants to book a demo or get started, direct them to scroll down to the contact form on the website
- Always be honest about capabilities and limitations
- For very specific technical questions, suggest a consultation for detailed answers`;

// Request interface
interface ChatRequest {
  message: string;
  sessionId: string;
  history?: { role: string; content: string }[];
}

// Get conversation history from database
async function getConversationHistory(sessionId: string, limit = 10): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('conversation_history')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  return (data || []).map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));
}

// Store conversation in database
async function storeConversation(
  sessionId: string,
  userMessage: string,
  assistantMessage: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const messages = [
    { session_id: sessionId, role: 'user', content: userMessage },
    {
      session_id: sessionId,
      role: 'assistant',
      content: assistantMessage,
      model_used: model,
      tokens_used: inputTokens + outputTokens,
    },
  ];

  const { error } = await supabase.from('conversation_history').insert(messages);

  if (error) {
    console.error('Error storing conversation:', error);
  }

  // Track interaction for cost monitoring
  const cost = calculateCost(model, inputTokens, outputTokens);
  await supabase.from('agent_interactions').insert({
    interaction_type: 'chat',
    session_id: sessionId,
    model_used: model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_cost_usd: cost,
    success: true,
  });
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { message, sessionId, history }: ChatRequest = await req.json();

    if (!message || !sessionId) {
      return errorResponse('Missing required fields: message and sessionId', 400);
    }

    // Get OpenAI client
    const openai = new OpenAIClient();

    // Get conversation history from database (if not provided)
    let conversationHistory: ChatMessage[] = [];
    if (history && history.length > 0) {
      conversationHistory = history.map((h) => ({
        role: (h.role === 'model' ? 'assistant' : h.role) as 'user' | 'assistant',
        content: h.content,
      }));
    } else {
      conversationHistory = await getConversationHistory(sessionId);
    }

    // Select model based on complexity
    const model = selectModel(message, conversationHistory.length);

    // Build messages array
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Call OpenAI API
    const response = await openai.createChatCompletion({
      model,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    const inputTokens = response.usage?.prompt_tokens || 0;
    const outputTokens = response.usage?.completion_tokens || 0;

    // Store conversation in database
    await storeConversation(sessionId, message, assistantMessage, model, inputTokens, outputTokens);

    return jsonResponse({
      response: assistantMessage,
      model,
      tokens: {
        input: inputTokens,
        output: outputTokens,
      },
    });
  } catch (error) {
    console.error('Chat agent error:', error);

    // Track failed interaction
    try {
      await supabase.from('agent_interactions').insert({
        interaction_type: 'chat',
        model_used: 'unknown',
        success: false,
        error_message: error.message,
      });
    } catch {
      // Ignore tracking errors
    }

    return errorResponse(error.message || 'An unexpected error occurred', 500);
  }
});
