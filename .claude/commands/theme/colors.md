---
description: Modify theme colors and design tokens
allowed-tools: Read, Write, Edit
argument-hint: [action]
---

# Khanect AI - Theme System

## Configuration File
`tailwind.config.js`

## Color Palette

```javascript
theme: {
  extend: {
    colors: {
      brand: {
        dark: '#050505',        // Main background
        card: '#0A0A0B',        // Card backgrounds
        lime: '#14B8A6',        // Primary accent (teal)
        limeHover: '#0D9488',   // Hover state
        limeMuted: 'rgba(20,184,166,0.08)', // Subtle bg
      },
      gray: {
        750: '#2e2e33',
        850: '#1f1f23',
        950: '#09090b',
      },
    },
  },
},
```

## CSS Variables (src/index.css)

```css
:root {
  --brand-lime: 166 84% 40%;
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  /* ... more variables */
}

.dark {
  --background: 0 0% 2%;
  --foreground: 0 0% 98%;
  /* ... dark mode overrides */
}
```

## Theme Context
`src/contexts/ThemeContext.tsx`

```tsx
type Theme = 'light' | 'dark' | 'system';

const { theme, setTheme } = useTheme();
```

## Adding New Color

1. Add to `tailwind.config.js`:
```javascript
colors: {
  brand: {
    newColor: '#HEX_VALUE',
  },
}
```

2. Use in components:
```tsx
className="bg-brand-newColor text-brand-newColor"
```

## Key Files
- `tailwind.config.js` - Theme configuration
- `src/index.css` - CSS variables
- `src/contexts/ThemeContext.tsx` - Theme state

## Task: $ARGUMENTS
