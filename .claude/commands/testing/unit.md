---
description: Generate unit tests for utilities and hooks
allowed-tools: Read, Write, Edit, Glob, Bash(npm:*)
argument-hint: [file-path]
---

# Khanect AI - Unit Testing

## Framework
- Vitest + React Testing Library
- jsdom environment

## Test File Location
Co-locate with source: `src/[path]/__tests__/[name].test.ts`

## Test Template

```tsx
import { describe, it, expect, vi } from 'vitest';
import { functionName } from '../filename';

describe('functionName', () => {
  it('should handle normal case', () => {
    expect(functionName('input')).toBe('expected');
  });

  it('should handle edge case', () => {
    expect(functionName('')).toBe('');
  });

  it('should handle error case', () => {
    expect(() => functionName(null)).toThrow();
  });
});
```

## Mocking

```tsx
// Mock module
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockResolvedValue({ data: [], error: null }),
  },
}));

// Mock function
const mockFn = vi.fn().mockResolvedValue({ success: true });
```

## Run Commands
```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage
```

## Existing Tests
- `src/utils/__tests__/validation.test.ts`
- `src/lib/__tests__/supabase.test.ts`

## Task: Generate tests for $ARGUMENTS
