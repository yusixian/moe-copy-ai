import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

import { cn } from "~/utils"

const animatedContainerVariants = cva("", {
  variants: {
    animation: {
      none: "",
      fadeIn: "animate-fadeIn",
      float: "animate-float",
      wiggle: "animate-wiggle",
      bounce: "animate-bounce",
      pulse: "animate-pulse",
      spinSlow: "animate-spin-slow",
      ping: "animate-ping"
    },
    delay: {
      none: "",
      100: "delay-100",
      200: "delay-200",
      300: "delay-300",
      500: "delay-500"
    },
    hover: {
      none: "",
      scale: "hover:scale-105 transition-transform duration-300",
      wiggle: "hover:animate-wiggle",
      pulse: "hover:animate-pulse",
      bounce: "hover:animate-bounce"
    }
  },
  defaultVariants: {
    animation: "none",
    delay: "none",
    hover: "none"
  }
})

export interface AnimatedContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof animatedContainerVariants> {}

const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ className, animation, delay, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          animatedContainerVariants({ animation, delay, hover, className })
        )}
        {...props}
      />
    )
  }
)

AnimatedContainer.displayName = "AnimatedContainer"

export { AnimatedContainer, animatedContainerVariants }
