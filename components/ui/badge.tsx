import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { cn } from "~/utils"
import { useTheme } from "~/utils/theme"

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-[10px] px-1.5 py-0.5 font-medium border",
  {
    variants: {
      variant: {
        default: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
        success: "bg-green-500/10 text-green-600 border-green-500/20",
        warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        danger: "bg-red-500/10 text-red-600 border-red-500/20",
        info: "bg-accent-blue/10 text-accent-blue border-accent-blue/20",
        pink: "bg-pink-500/10 text-pink-600 border-pink-500/20",
        purple: "bg-purple-500/10 text-purple-600 border-purple-500/20"
      },
      size: {
        sm: "text-[8px] px-1 py-0.5",
        md: "text-[10px] px-1.5 py-0.5",
        lg: "text-xs px-2 py-1"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size, icon, children, ...props }, ref) => {
    const { resolvedTheme } = useTheme()

    // Light mode: restore original sky blue colors for default variant
    const lightModeDefault =
      variant === "default" && resolvedTheme === "light"
        ? "bg-sky-100 text-sky-600 border-sky-200"
        : ""

    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants({ variant, size }),
          lightModeDefault,
          className
        )}
        {...props}>
        {icon && <span className="mr-0.5">{icon}</span>}
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
