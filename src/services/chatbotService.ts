/**
 * Chatbot service using n8n webhook
 * Sends messages to n8n workflow for AI processing
 */

const N8N_CHATBOT_WEBHOOK_URL = import.meta.env.VITE_N8N_CHATBOT_WEBHOOK_URL;

export interface ChatHistory {
  role: string;
  parts: { text: string }[];
}

export interface ChatResponse {
  text: string;
}

/**
 * Extracts text response from various n8n response formats.
 * n8n can return responses in many different structures depending on the workflow.
 */
const extractResponseText = (data: unknown): string | null => {
  // Handle null/undefined
  if (data == null) {
    return null;
  }

  // Handle direct string response
  if (typeof data === 'string') {
    return data.trim() || null;
  }

  // Handle array responses (n8n often returns arrays)
  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    // Try to extract from first item
    return extractResponseText(data[0]);
  }

  // Handle object responses
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    // Check common n8n response fields (in order of likelihood)
    const commonFields = [
      'output',      // n8n AI Agent output
      'response',    // Common response field
      'text',        // Text field
      'message',     // Message field
      'content',     // Content field
      'answer',      // Answer field
      'result',      // Result field
      'data',        // Nested data field
      'json',        // n8n json output wrapper
    ];

    for (const field of commonFields) {
      if (field in obj && obj[field] != null) {
        const extracted = extractResponseText(obj[field]);
        if (extracted) return extracted;
      }
    }

    // Check for nested output structures (e.g., { output: { text: "..." } })
    if (obj.output && typeof obj.output === 'object') {
      const outputObj = obj.output as Record<string, unknown>;
      for (const field of ['text', 'message', 'content', 'response']) {
        if (field in outputObj && typeof outputObj[field] === 'string') {
          return (outputObj[field] as string).trim() || null;
        }
      }
    }
  }

  return null;
};

/**
 * Sends a message to the n8n chatbot webhook and returns the response.
 */
export const sendChatMessage = async (
  message: string,
  history: ChatHistory[]
): Promise<ChatResponse> => {
  if (!N8N_CHATBOT_WEBHOOK_URL) {
    throw new Error("Chatbot webhook URL is not configured");
  }

  try {
    const response = await fetch(N8N_CHATBOT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history: history.map(h => ({
          role: h.role,
          text: h.parts[0]?.text || ''
        }))
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Webhook error ${response.status}:`, errorText);
      throw new Error(`Webhook error: ${response.status}`);
    }

    // Try to parse as JSON, fall back to text
    let data: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle plain text response
      const textResponse = await response.text();
      data = textResponse;
    }

    // Extract response text from various possible formats
    const responseText = extractResponseText(data);

    if (!responseText) {
      console.error('Could not extract response from webhook data:', data);
      return {
        text: "I apologize, but I couldn't generate a response at this time. Please try again.",
      };
    }

    return {
      text: responseText,
    };
  } catch (error) {
    console.error("Chatbot API Error:", error);
    throw new Error("Failed to connect to the AI consultant.");
  }
};
