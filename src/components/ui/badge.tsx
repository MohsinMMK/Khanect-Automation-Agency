import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

const Badge = React.forwardRef<HTMLElement, BadgeProps>(
  ({ className, variant, onClick, onKeyDown, ...props }, ref) => {
    const isInteractive = !!onClick

    const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (isInteractive && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault()
        onClick?.(e as unknown as React.MouseEvent<HTMLElement>)
      }
      onKeyDown?.(e)
    }

    if (isInteractive) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={cn(badgeVariants({ variant }), className)}
          onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
          onKeyDown={handleKeyDown as React.KeyboardEventHandler<HTMLButtonElement>}
          {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        />
      )
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(badgeVariants({ variant }), className)}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
