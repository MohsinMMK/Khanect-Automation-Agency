---
description: Create or modify React components with project patterns
allowed-tools: Read, Write, Edit, Glob, Grep
argument-hint: [action] [component-name]
---

# Khanect AI - Component Management

## Project Context
- Framework: React 19 + TypeScript
- Styling: Tailwind CSS v4 with custom theme
- Path alias: `@/` maps to `src/`
- Components location: `src/components/`
- UI primitives: `src/components/ui/`

## Component Patterns

### Standard Component Template
```tsx
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({ className, children }: ComponentNameProps) {
  return (
    <div className={cn('base-classes', className)}>
      {children}
    </div>
  );
}
```

### With Variants (CVA Pattern)
```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      default: 'default-classes',
      outline: 'outline-classes',
    },
    size: {
      sm: 'text-sm px-2 py-1',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

interface Props extends VariantProps<typeof componentVariants> {
  className?: string;
}

export function ComponentName({ variant, size, className }: Props) {
  return <div className={cn(componentVariants({ variant, size }), className)} />;
}
```

## Key Files Reference
- UI primitives: `src/components/ui/button.tsx`, `card.tsx`, `badge.tsx`
- Complex components: `src/components/LandingPage.tsx`, `Navbar.tsx`
- Animation components: `src/components/ui/meteors.tsx`, `dotted-surface.tsx`

## Task: $ARGUMENTS

Follow project patterns. Use TypeScript interfaces. Apply Tailwind classes.
