---
description: Add or modify animations (GSAP, Framer Motion, CSS)
allowed-tools: Read, Write, Edit, Glob, Grep
argument-hint: [type] [target]
---

# Khanect AI - Animation System

## Animation Libraries
1. **GSAP** - Scroll-triggered, stagger animations
2. **Framer Motion** - Component animations, gestures
3. **Three.js** - 3D backgrounds (DottedSurface)
4. **CSS Keyframes** - Simple transitions

## GSAP Patterns

### Scroll-Triggered Stagger (useGSAPStagger hook)
```tsx
import { useGSAPStagger } from '@/hooks/useGSAPStagger';

function Component() {
  const containerRef = useGSAPStagger<HTMLDivElement>({
    stagger: 0.12,
    duration: 0.8,
    y: 20,
  });

  return (
    <div ref={containerRef}>
      <div>Item 1</div>
      <div>Item 2</div>
    </div>
  );
}
```

### Hook Location: `src/hooks/useGSAPStagger.ts`

## Framer Motion Patterns

### useAnimatedText Hook
```tsx
import { useAnimatedText } from '@/hooks/useAnimatedText';

function Component() {
  const animatedText = useAnimatedText('Hello World', {
    delimiter: 'character', // 'word' | 'chunk'
    duration: 0.05,
  });

  return <span>{animatedText}</span>;
}
```

## CSS Animations (tailwind.config.js)

Available animations:
- `animate-fade-in-up` - Fade in from below
- `animate-fade-in` - Simple fade
- `animate-scale-up` - Scale entrance
- `animate-float` - Floating motion
- `animate-meteor-effect` - Meteor particles
- `animate-pulse-slow` - Slow pulse

### Adding New CSS Animation
1. Add keyframes in `tailwind.config.js` under `theme.extend.keyframes`
2. Add animation in `theme.extend.animation`

## Key Files
- `src/hooks/useGSAPStagger.ts`
- `src/hooks/useAnimatedText.ts`
- `src/components/ui/meteors.tsx`
- `src/components/ui/dotted-surface.tsx`
- `tailwind.config.js`
- `src/index.css` (global animations)

## Task: $ARGUMENTS
