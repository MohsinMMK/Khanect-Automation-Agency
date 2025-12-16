import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { getApiKey } from "../utils/env";

// Initialize the client with the API key safely
const ai = new GoogleGenAI({ apiKey: getApiKey() });

/**
 * Sends a message to the Gemini model and returns the text response.
 * Uses 'gemini-2.5-flash' for low-latency chat interactions.
 * Configured with Google Search and Google Maps tools for up-to-date grounding.
 */
export const sendChatMessage = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<{ text: string; groundingMetadata?: any }> => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are Khanect Ai's lead automation consultant. 
        Your goal is to briefly analyze a user's business needs and suggest automation strategies.
        You are fluent in English, Hindi, and Urdu. Always respond in the same language that the user is speaking or writing in.
        Keep responses professional, concise, and focused on ROI (Return on Investment).
        If the user asks about pricing, direct them to book a consultation.
        Do not answer general knowledge questions unrelated to business automation, AI, or Khanect services.
        Use Google Search or Maps if the user asks for current information, location-based queries, or competitor analysis.`,
        temperature: 0.7,
        tools: [
          { googleSearch: {} },
          { googleMaps: {} }
        ]
      },
      history: history,
    });

    const response: GenerateContentResponse = await chat.sendMessage({
      message: message,
    });

    return {
      text: response.text || "I apologize, but I couldn't generate a response at this time.",
      groundingMetadata: response.candidates?.[0]?.groundingMetadata
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to connect to the AI consultant.");
  }
};