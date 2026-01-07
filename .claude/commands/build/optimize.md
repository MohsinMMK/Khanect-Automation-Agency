---
description: Performance optimization suggestions
allowed-tools: Read, Glob, Grep
argument-hint: [area]
---

# Khanect AI - Performance Optimization

## Current Optimizations

### Code Splitting
- Vendor chunk (React)
- Charts chunk (Recharts)
- Supabase chunk
- UI chunk (Lenis, GSAP)

### Image Optimization
- SVGs in public folder
- No large raster images

### Animation Performance
- `will-change` hints on animated elements
- Mobile-reduced particle counts in DottedSurface
- `prefers-reduced-motion` support

### Loading Performance
- Smooth scroll with Lenis
- Lazy route loading potential

## Optimization Checklist

### Components
- [ ] Use `React.memo()` for expensive renders
- [ ] Use `useMemo()` for expensive calculations
- [ ] Use `useCallback()` for event handlers
- [ ] Avoid inline object/array creation in props

### Images
- [ ] Use WebP format
- [ ] Implement lazy loading
- [ ] Add width/height attributes

### Animations
- [ ] Use `transform` instead of `top/left`
- [ ] Use `opacity` for fades
- [ ] Avoid animating `width/height`

### Bundle
- [ ] Check for duplicate dependencies
- [ ] Remove unused imports
- [ ] Dynamic imports for heavy components

## Key Files to Check
- `src/components/ui/dotted-surface.tsx` - 3D performance
- `src/components/LandingPage.tsx` - Main page performance
- `vite.config.ts` - Build optimizations

## Task: $ARGUMENTS
