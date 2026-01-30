import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { cn } from "~/utils"
import { useTheme } from "~/utils/theme"

const cardVariants = cva("overflow-hidden transition-all duration-300", {
  variants: {
    variant: {
      default: "rounded-xl border border-line-1 bg-content-alt",
      content: "rounded-xl border border-line-1 bg-content-alt shadow-sm",
      image:
        "rounded-lg border border-line-1 shadow-sm hover:scale-105 hover:shadow-md transform"
    },
    padding: {
      none: "",
      sm: "p-2",
      md: "p-3",
      lg: "p-4"
    },
    hover: {
      true: "hover:shadow-md"
    }
  },
  defaultVariants: {
    variant: "default",
    padding: "md"
  }
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, hover, className }))}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

// 卡片标题
const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { resolvedTheme } = useTheme()

  const lightMode =
    "border-sky-200 border-b bg-gradient-to-r from-sky-100 to-indigo-100"
  const darkMode = "border-line-1 border-b bg-accent-blue-ghost"

  return (
    <div
      ref={ref}
      className={cn(
        "group relative flex cursor-pointer items-center justify-between p-2 transition-all duration-300",
        resolvedTheme === "light" ? lightMode : darkMode,
        className
      )}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

// 卡片内容
const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-3", className)} {...props} />
))
CardContent.displayName = "CardContent"

// 卡片脚注
const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mt-3 flex justify-center", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardContent, CardFooter, cardVariants }
