---
description: Generate component tests with React Testing Library
allowed-tools: Read, Write, Edit, Glob, Bash(npm:*)
argument-hint: [component-path]
---

# Khanect AI - Component Testing

## Test Template

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<ComponentName onClick={onClick} />);
    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('displays correct text', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## With Theme Provider

```tsx
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider defaultTheme="light">
      {ui}
    </ThemeProvider>
  );
};
```

## With Router

```tsx
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};
```

## Common Queries
- `screen.getByRole('button', { name: /submit/i })`
- `screen.getByText(/loading/i)`
- `screen.getByTestId('custom-id')`
- `screen.queryByText('optional')` - returns null if not found

## Existing Component Tests
- `src/components/__tests__/App.test.tsx`
- `src/components/__tests__/FAQItem.test.tsx`
- `src/components/__tests__/TabSwitch.test.tsx`

## Task: Generate tests for $ARGUMENTS
