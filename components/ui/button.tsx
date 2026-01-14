import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { cn } from "~/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 border disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700",
        secondary:
          "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
        outline:
          "bg-transparent border-blue-300 text-blue-600 hover:bg-blue-50",
        ghost:
          "bg-transparent border-transparent text-blue-600 hover:bg-blue-50",
        success:
          "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700",
        danger: "bg-red-600 text-white border-red-600 hover:bg-red-700"
      },
      size: {
        xs: "px-2 py-1 text-xs",
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
        icon: "p-2"
      },
      fullWidth: {
        true: "w-full"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, icon, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        {...props}>
        {icon && <span className="mr-1.5">{icon}</span>}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
