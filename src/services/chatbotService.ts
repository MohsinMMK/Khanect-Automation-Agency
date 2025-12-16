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
      throw new Error(`Webhook error: ${response.status}`);
    }

    const data = await response.json();

    // Handle different response formats from n8n
    const responseText = data.response || data.text || data.message || data.output ||
      (typeof data === 'string' ? data : "I apologize, but I couldn't generate a response at this time.");

    return {
      text: responseText,
    };
  } catch (error) {
    console.error("Chatbot API Error:", error);
    throw new Error("Failed to connect to the AI consultant.");
  }
};
