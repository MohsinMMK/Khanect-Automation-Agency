---
description: Add custom SVG icons to the project
allowed-tools: Read, Write, Edit, Glob
argument-hint: [icon-name]
---

# Khanect AI - Icon System

## Icon Sources
1. **Lucide React** - UI icons (`lucide-react`)
2. **Custom SVGs** - Domain icons in `src/components/icons/`

## Custom Icon Template

Location: `src/components/icons/[IconName]Icon.tsx`

```tsx
import { cn } from '@/lib/utils';

interface IconNameIconProps {
  className?: string;
  size?: number;
  fillClassName?: string;
}

export function IconNameIcon({
  className,
  size = 24,
  fillClassName = 'fill-brand-lime'
}: IconNameIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={cn(fillClassName, className)}
    >
      {/* SVG paths here */}
    </svg>
  );
}
```

## Existing Icons (15 total)
- KhanectBoltIcon - Brand lightning bolt
- CheckmarkIcon, CheckCircleIcon - Check marks
- ChevronIcon - Arrows
- CalendarIcon - Calendar
- AgencyIcon, AutomobileIcon, ChatbotIcon, CoachingIcon
- CRMIcon, EcommerceIcon, HealthcareIcon, LeadGenIcon
- RealEstateIcon, WorkflowIcon

## Brand Color: #14B8A6 (brand-lime)

## Task: Create icon for $ARGUMENTS
