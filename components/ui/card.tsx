import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { cn } from "~/utils"

const cardVariants = cva("overflow-hidden transition-all duration-300", {
  variants: {
    variant: {
      default: "rounded-xl border border-sky-200 bg-blue-50",
      content: "rounded-xl border border-sky-200 bg-blue-50 shadow-sm",
      image:
        "rounded-lg border-2 border-sky-200 shadow-sm hover:scale-105 hover:shadow-md transform"
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
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "group relative flex cursor-pointer items-center justify-between border-b border-sky-200 bg-gradient-to-r from-sky-100 to-indigo-100 p-2 transition-all duration-300",
      className
    )}
    {...props}
  />
))
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
