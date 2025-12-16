import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEnv } from './env';

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
