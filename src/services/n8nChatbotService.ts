/**
 * N8N Chatbot Service
 * Handles AI chat communication via n8n Chat Trigger webhook
 */

import { getEnv } from '../utils/env';

// Configuration
const N8N_CHAT_WEBHOOK_URL = getEnv('VITE_N8N_CHAT_WEBHOOK_URL');
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds for AI responses
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
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

// Types
export interface N8NChatResponse {
  text: string;
}

export interface N8NChatOptions {
  timeout?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Generate or retrieve a session ID for chat memory persistence.
 * Sessions expire after 24 hours for security.
 */
export const getN8NSessionId = (): string => {
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

/**
 * Clear the chat session and start fresh
 */
export const clearN8NSession = (): void => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
};

/**
 * Get the current session ID (for debugging/analytics)
 */
export const getCurrentN8NSessionId = (): string | null => {
  return localStorage.getItem(SESSION_STORAGE_KEY);
};

/**
 * Sends a message to the n8n Chat Trigger webhook and returns the response.
 * n8n handles conversation memory via session ID.
 */
export async function sendN8NChatMessage(
  message: string,
  options?: N8NChatOptions,
  retryCount = 0
): Promise<N8NChatResponse> {
  if (!N8N_CHAT_WEBHOOK_URL) {
    throw new Error('N8N chat webhook URL is not configured. Please check your environment variables.');
  }

  const controller = new AbortController();
  const timeoutMs = options?.timeout || REQUEST_TIMEOUT_MS;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const sessionId = getN8NSessionId();

    // Build URL with action parameter
    const url = new URL(N8N_CHAT_WEBHOOK_URL);
    url.searchParams.set('action', 'sendMessage');

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message,
        sessionId,
        ...(options?.metadata && { metadata: options.metadata }),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`N8N webhook error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // n8n can return response in different fields
    const responseText = data?.text || data?.output || data?.response;

    if (!responseText) {
      return {
        text: "I apologize, but I couldn't generate a response. Please try again.",
      };
    }

    return { text: responseText };
  } catch (error) {
    clearTimeout(timeoutId);

    // Retry logic with exponential backoff
    if (retryCount < MAX_RETRIES) {
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      const isRetryable =
        RETRY_ERRORS.some((e) => errorMessage.includes(e)) ||
        (error instanceof Error && error.name === 'AbortError');

      if (isRetryable) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
        console.log(`Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES}) in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return sendN8NChatMessage(message, options, retryCount + 1);
      }
    }

    // User-friendly error messages
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('The request took too long. Please try again.');
      }
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet.');
      }
      if (error.message.includes('not configured')) {
        throw new Error('The AI service is not properly configured.');
      }
    }

    throw new Error('Failed to connect to the AI consultant. Please try again.');
  }
}

/**
 * Load previous session messages (optional - if UI needs to restore)
 */
export async function loadPreviousSession(): Promise<N8NChatResponse | null> {
  if (!N8N_CHAT_WEBHOOK_URL) {
    return null;
  }

  const sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    return null;
  }

  try {
    const url = new URL(N8N_CHAT_WEBHOOK_URL);
    url.searchParams.set('action', 'loadPreviousSession');

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data?.text ? { text: data.text } : null;
  } catch {
    return null;
  }
}
