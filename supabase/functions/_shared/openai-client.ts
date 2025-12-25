/**
 * OpenAI Client Wrapper for Supabase Edge Functions
 * Provides a consistent interface for GPT-4 API calls
 */

// Types for OpenAI API
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  tools?: Tool[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface Tool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string | null;
      tool_calls?: {
        id: string;
        type: 'function';
        function: {
          name: string;
          arguments: string;
        };
      }[];
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Model constants
export const MODELS = {
  GPT4O: 'gpt-4o',
  GPT4O_MINI: 'gpt-4o-mini',
} as const;

// Cost per 1M tokens (as of Dec 2024)
export const MODEL_COSTS = {
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
} as const;

/**
 * Calculate the cost of an API call in USD
 */
export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model as keyof typeof MODEL_COSTS] || MODEL_COSTS['gpt-4o-mini'];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return inputCost + outputCost;
}

/**
 * Select the appropriate model based on query complexity
 * Currently using GPT-4o-mini for all queries to optimize costs
 */
export function selectModel(_message: string, _conversationLength: number): string {
  // Always use GPT-4o-mini for cost optimization (~$8/month vs $35/month)
  return MODELS.GPT4O_MINI;
}

/**
 * OpenAI API Client
 */
export class OpenAIClient {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || Deno.env.get('OPENAI_API_KEY') || '';
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
  }

  /**
   * Create a chat completion
   */
  async createChatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        max_tokens: request.max_tokens || 1024,
        temperature: request.temperature || 0.7,
        tools: request.tools,
        tool_choice: request.tool_choice,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const latency = Date.now() - startTime;

    // Log for debugging
    console.log(`OpenAI API call: ${request.model}, latency: ${latency}ms, tokens: ${data.usage?.total_tokens || 'N/A'}`);

    return data as ChatCompletionResponse;
  }

  /**
   * Simple chat completion without tools
   */
  async chat(
    systemPrompt: string,
    userMessage: string,
    history: ChatMessage[] = [],
    model?: string
  ): Promise<{ text: string; model: string; usage: { input: number; output: number } }> {
    const selectedModel = model || selectModel(userMessage, history.length);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    const response = await this.createChatCompletion({
      model: selectedModel,
      messages,
      max_tokens: 1024,
    });

    const assistantMessage = response.choices[0]?.message?.content || '';

    return {
      text: assistantMessage,
      model: selectedModel,
      usage: {
        input: response.usage?.prompt_tokens || 0,
        output: response.usage?.completion_tokens || 0,
      },
    };
  }
}

// Export singleton for convenience
let _client: OpenAIClient | null = null;

export function getOpenAIClient(): OpenAIClient {
  if (!_client) {
    _client = new OpenAIClient();
  }
  return _client;
}
