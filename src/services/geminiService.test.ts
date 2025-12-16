import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions
const mockSendMessage = vi.fn();
const mockCreate = vi.fn();

// Mock the GoogleGenAI module before any imports
vi.mock('@google/genai', () => ({
  GoogleGenAI: class MockGoogleGenAI {
    constructor() {
      // Constructor
    }
    chats = {
      create: mockCreate.mockReturnValue({
        sendMessage: mockSendMessage,
      }),
    };
  },
}));

// Mock getApiKey
vi.mock('../utils/env', () => ({
  getApiKey: () => 'mock-api-key',
}));

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMessage.mockResolvedValue({
      text: 'Mock AI response',
      candidates: [
        {
          groundingMetadata: { searchEntryPoint: {} },
        },
      ],
    });
  });

  it('should export sendChatMessage function', async () => {
    const { sendChatMessage } = await import('./geminiService');
    expect(typeof sendChatMessage).toBe('function');
  });

  it('should send a chat message and receive a response', async () => {
    const { sendChatMessage } = await import('./geminiService');

    const result = await sendChatMessage('Hello', []);

    expect(result).toHaveProperty('text');
    expect(result.text).toBe('Mock AI response');
  });

  it('should handle chat history', async () => {
    const { sendChatMessage } = await import('./geminiService');

    const history = [
      { role: 'user', parts: [{ text: 'Previous message' }] },
      { role: 'model', parts: [{ text: 'Previous response' }] },
    ];

    const result = await sendChatMessage('Follow up', history);

    expect(result).toHaveProperty('text');
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        history: history,
      })
    );
  });

  it('should include grounding metadata when available', async () => {
    const { sendChatMessage } = await import('./geminiService');

    const result = await sendChatMessage('Search query', []);

    expect(result).toHaveProperty('groundingMetadata');
  });

  it('should handle API errors gracefully', async () => {
    mockSendMessage.mockRejectedValueOnce(new Error('API Error'));

    const { sendChatMessage } = await import('./geminiService');

    await expect(sendChatMessage('Test', [])).rejects.toThrow(
      'Failed to connect to the AI consultant.'
    );
  });

  it('should return fallback text when response is empty', async () => {
    mockSendMessage.mockResolvedValueOnce({
      text: '',
      candidates: [],
    });

    const { sendChatMessage } = await import('./geminiService');

    const result = await sendChatMessage('Test', []);

    expect(result.text).toBe("I apologize, but I couldn't generate a response at this time.");
  });
});
