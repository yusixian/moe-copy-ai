import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { cn } from "~/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full text-[10px] px-1.5 py-0.5 font-medium border",
  {
    variants: {
      variant: {
        default: "bg-sky-100 text-sky-600 border-sky-200",
        success: "bg-green-100 text-green-600 border-green-200",
        warning: "bg-yellow-100 text-yellow-600 border-yellow-200",
        danger: "bg-red-100 text-red-600 border-red-200",
        info: "bg-blue-100 text-blue-600 border-blue-200",
        pink: "bg-pink-100 text-pink-600 border-pink-200",
        purple: "bg-purple-100 text-purple-600 border-purple-200"
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
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}>
        {icon && <span className="mr-0.5">{icon}</span>}
        {children}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
