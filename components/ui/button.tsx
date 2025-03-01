import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { cn } from "~/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-xs font-medium transition-all duration-200 shadow-md hover:shadow-lg border relative group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-indigo-400 to-sky-400 text-white border-indigo-200 hover:from-indigo-500 hover:to-sky-500",
        secondary:
          "bg-gradient-to-br from-blue-400 to-teal-400 text-white border-teal-200 hover:from-blue-500 hover:to-teal-500",
        outline: "bg-white border-sky-200 text-sky-600 hover:bg-sky-50",
        ghost:
          "bg-transparent border-transparent text-sky-600 hover:bg-sky-50 shadow-none hover:shadow-none",
        success:
          "bg-gradient-to-br from-green-400 to-emerald-400 text-white border-emerald-200",
        copy: "bg-gradient-to-br from-sky-300 to-blue-200 text-blue-800 hover:from-sky-400 hover:to-blue-300 border-sky-200"
      },
      size: {
        sm: "px-3 py-1.5",
        md: "px-4 py-2",
        lg: "px-5 py-2.5"
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
        {icon && (
          <span className="mr-1.5 transition-transform duration-200 group-hover:scale-110">
            {icon}
          </span>
        )}
        <span className="relative">
          {children}
          <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transform rounded-full bg-white/40 transition-transform duration-200 group-hover:scale-x-100"></span>
        </span>
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
