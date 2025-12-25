/**
 * Chatbot service using Supabase Edge Functions with OpenAI GPT-4
 * Replaces the previous n8n webhook implementation with AI-powered agentic workflow
 */

import { supabase } from '../lib/supabase';

/**
 * Generate or retrieve a session ID for chat memory persistence.
 * Uses localStorage so the session persists across browser sessions.
 */
const getSessionId = (): string => {
  const storageKey = 'khanect_chat_session';
  let sessionId = localStorage.getItem(storageKey);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }
  return sessionId;
};

export interface ChatHistory {
  role: string;
  parts: { text: string }[];
}

export interface ChatResponse {
  text: string;
  model?: string;
}

/**
 * Sends a message to the chat-agent edge function and returns the response.
 * Uses OpenAI GPT-4 for intelligent, context-aware conversations.
 */
export const sendChatMessage = async (
  message: string,
  history: ChatHistory[],
  retryCount = 0
): Promise<ChatResponse> => {
  if (!supabase) {
    throw new Error("Supabase client is not configured. Please check your environment variables.");
  }

  const MAX_RETRIES = 2;

  try {
    const sessionId = getSessionId();

    // Convert history to the format expected by the edge function
    const formattedHistory = history.map(h => ({
      role: h.role === 'model' ? 'assistant' : h.role,
      content: h.parts[0]?.text || ''
    }));

    // Call the chat-agent edge function
    const { data, error } = await supabase.functions.invoke('chat-agent', {
      body: {
        message,
        sessionId,
        history: formattedHistory
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to get response from AI');
    }

    // Extract response from edge function data
    const responseText = data?.response || data?.text || data?.message;

    if (!responseText) {
      console.error('Could not extract response from edge function data:', data);
      return {
        text: "I apologize, but I couldn't generate a response at this time. Please try again.",
      };
    }

    return {
      text: responseText,
      model: data?.model,
    };
  } catch (error) {
    console.error("Chatbot API Error:", error);

    // Retry logic for transient errors
    if (retryCount < MAX_RETRIES) {
      const isRetryable =
        error instanceof Error && (
          error.message.includes('timeout') ||
          error.message.includes('network') ||
          error.message.includes('fetch') ||
          error.message.includes('ECONNRESET')
        );

      if (isRetryable) {
        console.log(`Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        return sendChatMessage(message, history, retryCount + 1);
      }
    }

    // User-friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('took too long')) {
        throw new Error("The request took too long. Please check your connection and try again.");
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error("Network connection failed. Please check your internet and try again.");
      }
      if (error.message.includes('not configured')) {
        throw new Error("The AI service is not properly configured. Please contact support.");
      }
    }

    // Generic error
    throw new Error("Failed to connect to the AI consultant. Please try again.");
  }
};

/**
 * Clear the chat session and start fresh
 */
export const clearChatSession = (): void => {
  const storageKey = 'khanect_chat_session';
  localStorage.removeItem(storageKey);
};

/**
 * Get the current session ID (for debugging/analytics)
 */
export const getCurrentSessionId = (): string | null => {
  const storageKey = 'khanect_chat_session';
  return localStorage.getItem(storageKey);
};
