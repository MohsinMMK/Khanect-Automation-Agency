---
description: Tailwind styling help with project theme
allowed-tools: Read, Glob
argument-hint: [element-description]
---

# Khanect AI - Styling Guide

## Brand Colors
```javascript
brand: {
  lime: '#14B8A6',      // Primary teal - buttons, accents
  limeHover: '#0D9488', // Hover state
  limeMuted: 'rgba(20,184,166,0.08)', // Subtle backgrounds
  dark: '#050505',      // Main dark background
  card: '#0A0A0B',      // Card backgrounds
}
```

## Font Classes
- `font-sans` - Plus Jakarta Sans (body text)
- `font-display` - Space Grotesk (headings)
- `font-logo` - Astro (logo only)

## Type Scale (1.4 ratio)
| Class | Size | Use Case |
|-------|------|----------|
| `text-xs` | 11px | Captions |
| `text-sm` | 14px | Small text |
| `text-base` | 16px | Body |
| `text-lg` | 22px | Lead text |
| `text-xl` | 31px | H4 |
| `text-2xl` | 44px | H3 |
| `text-3xl` | 61px | H2 |
| `text-4xl` | 85px | H1 Hero |

## Common Patterns

### Glass Effect
```tsx
className="backdrop-blur-xl bg-white/5 border border-white/10"
```

### Primary Button
```tsx
className="bg-brand-lime hover:bg-brand-limeHover text-white px-6 py-3 rounded-xl"
```

### Card
```tsx
className="bg-brand-card border border-white/5 rounded-2xl p-6"
```

### Gradient Text
```tsx
className="bg-gradient-to-r from-brand-lime to-emerald-400 bg-clip-text text-transparent"
```

### Shadow Glow
```tsx
className="shadow-glow-lime" // Teal glow effect
```

## Spacing Scale
- `space-18` = 4.5rem
- `space-22` = 5.5rem
- `space-26` = 6.5rem
- `space-30` = 7.5rem

## Dark Mode
Uses class strategy. Wrap dark variants:
```tsx
className="bg-white dark:bg-brand-dark text-gray-900 dark:text-white"
```

## Key Files
- `tailwind.config.js` - Full theme config
- `src/index.css` - Global styles, CSS variables

## Style request: $ARGUMENTS
