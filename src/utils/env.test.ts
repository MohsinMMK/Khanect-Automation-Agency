import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEnv, getApiKey } from './env';

describe('getEnv', () => {
  const originalProcess = global.process;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    global.process = originalProcess;
  });

  it('should return undefined for non-existent env variable', () => {
    const result = getEnv('NON_EXISTENT_KEY_12345');
    expect(result).toBeUndefined();
  });

  it('should return process.env value when available', () => {
    const testKey = 'TEST_ENV_VAR';
    const testValue = 'test_value';

    // Set process.env
    process.env[testKey] = testValue;

    const result = getEnv(testKey);
    expect(result).toBe(testValue);

    // Cleanup
    delete process.env[testKey];
  });
});

describe('getApiKey', () => {
  const originalConsole = console.warn;

  beforeEach(() => {
    vi.resetModules();
    console.warn = vi.fn();
  });

  afterEach(() => {
    console.warn = originalConsole;
    delete process.env.API_KEY;
    delete process.env.VITE_API_KEY;
  });

  it('should return empty string and warn when no API key is set', () => {
    delete process.env.API_KEY;
    delete process.env.VITE_API_KEY;

    const result = getApiKey();

    expect(result).toBe('');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should return API_KEY when set', () => {
    process.env.API_KEY = 'test-api-key';

    const result = getApiKey();

    expect(result).toBe('test-api-key');
  });

  it('should return VITE_API_KEY when API_KEY is not set', () => {
    delete process.env.API_KEY;
    process.env.VITE_API_KEY = 'vite-api-key';

    const result = getApiKey();

    expect(result).toBe('vite-api-key');
  });

  it('should prefer API_KEY over VITE_API_KEY', () => {
    process.env.API_KEY = 'api-key';
    process.env.VITE_API_KEY = 'vite-api-key';

    const result = getApiKey();

    expect(result).toBe('api-key');
  });
});
