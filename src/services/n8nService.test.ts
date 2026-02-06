import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { processLead, type LeadData } from './n8nService';

const mockLead: LeadData = {
  submissionId: 'submission-123',
  fullName: 'Test User',
  email: 'test@example.com',
  phone: '+1 555 000 0000',
  businessName: 'Acme Inc',
  website: 'https://example.com',
  message: 'Need automation help',
};

const testEnv = import.meta.env as Record<string, string | undefined>;
const originalWebhookUrl = testEnv.VITE_N8N_WEBHOOK_URL;

describe('processLead', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    testEnv.VITE_N8N_WEBHOOK_URL = originalWebhookUrl;
  });

  it('returns MISSING_CONFIG when webhook URL is absent', async () => {
    testEnv.VITE_N8N_WEBHOOK_URL = '';
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const result = await processLead(mockLead);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('MISSING_CONFIG');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns success for 2xx webhook responses', async () => {
    testEnv.VITE_N8N_WEBHOOK_URL = 'https://example.com/webhook';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const result = await processLead(mockLead);

    expect(result).toEqual({ success: true });
  });

  it('returns HTTP_ERROR and status for non-2xx responses', async () => {
    testEnv.VITE_N8N_WEBHOOK_URL = 'https://example.com/webhook';
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Webhook failed', { status: 500 }),
    );

    const result = await processLead(mockLead);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('HTTP_ERROR');
    expect(result.httpStatus).toBe(500);
    expect(result.errorMessage).toBe('Webhook failed');
  });

  it('returns TIMEOUT when fetch aborts', async () => {
    testEnv.VITE_N8N_WEBHOOK_URL = 'https://example.com/webhook';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new DOMException('Aborted', 'AbortError'),
    );

    const result = await processLead(mockLead);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('TIMEOUT');
    expect(result.errorMessage).toContain('timed out');
  });

  it('returns NETWORK_ERROR for non-timeout exceptions', async () => {
    testEnv.VITE_N8N_WEBHOOK_URL = 'https://example.com/webhook';
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network down'));

    const result = await processLead(mockLead);

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('NETWORK_ERROR');
    expect(result.errorMessage).toBe('Network down');
  });
});
