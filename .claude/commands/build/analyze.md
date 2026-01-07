---
description: Analyze build output and bundle size
allowed-tools: Read, Bash(npm:*), Glob
argument-hint: [focus-area]
---

# Khanect AI - Build Analysis

## Build Command
```bash
npm run build
```

## Vite Config Chunks (vite.config.ts)

```javascript
rollupOptions: {
  output: {
    manualChunks: {
      vendor: ['react', 'react-dom'],
      charts: ['recharts'],
      supabase: ['@supabase/supabase-js'],
      ui: ['lenis', 'gsap'],
    },
  },
},
```

## Output Location
`dist/` directory

## Analysis Steps

1. **Build the project**
```bash
npm run build
```

2. **Check bundle sizes**
```bash
ls -la dist/assets/
```

3. **Analyze with source-map-explorer** (if installed)
```bash
npx source-map-explorer dist/assets/*.js
```

## Performance Optimizations Applied
- Console/debugger statements dropped in production
- Code splitting by chunk
- Tree shaking enabled
- CSS minification

## Key Files
- `vite.config.ts` - Build configuration
- `package.json` - Dependencies

## Task: $ARGUMENTS
