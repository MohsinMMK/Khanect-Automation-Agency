/**
 * Chatbot service using Supabase Edge Functions with OpenAI GPT-4
 * Replaces the previous n8n webhook implementation with AI-powered agentic workflow
 */

import { supabase } from '../lib/supabase';

// Session expiry duration (24 hours)
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;
const SESSION_STORAGE_KEY = 'khanect_chat_session';
const SESSION_EXPIRY_KEY = 'khanect_chat_session_expiry';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_ERRORS = [
  'timeout',
  'network',
  'fetch',
  'econnreset',
  'etimedout',
  'enotfound',
  '429',
  '502',
  '503',
  '504',
];

/**
 * Generate or retrieve a session ID for chat memory persistence.
 * Sessions expire after 24 hours for security.
 */
const getSessionId = (): string => {
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  const now = Date.now();
  const isExpired = !expiry || now > parseInt(expiry, 10);

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!sessionId || isExpired) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    localStorage.setItem(SESSION_EXPIRY_KEY, (now + SESSION_EXPIRY_MS).toString());
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

    // Retry logic with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      const isRetryable = RETRY_ERRORS.some(e => errorMessage.includes(e));

      if (isRetryable) {
        // Exponential backoff: 1s, 2s, 4s (max 8s)
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        console.log(`Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES}) in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
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
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
};

/**
 * Get the current session ID (for debugging/analytics)
 */
export const getCurrentSessionId = (): string | null => {
  return localStorage.getItem(SESSION_STORAGE_KEY);
};
