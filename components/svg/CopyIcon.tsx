"use client"

import type { Transition } from "motion/react"
import { motion, useAnimation } from "motion/react"
import type { HTMLAttributes } from "react"
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react"

import { cn } from "~/utils"
import { useI18n } from "~/utils/i18n"

export interface CopyIconHandle {
  startAnimation: () => void
  stopAnimation: () => void
}

interface CopyIconProps extends HTMLAttributes<HTMLSpanElement> {
  size?: number
}

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 160,
  damping: 17,
  mass: 1
}

const CopyIcon = forwardRef<CopyIconHandle, CopyIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
    const { t } = useI18n()
    const controls = useAnimation()
    const isControlledRef = useRef(false)

    useImperativeHandle(ref, () => {
      isControlledRef.current = true

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal")
      }
    })

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (!isControlledRef.current) {
          controls.start("animate")
        } else {
          onMouseEnter?.(e)
        }
      },
      [controls, onMouseEnter]
    )

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (!isControlledRef.current) {
          controls.start("normal")
        } else {
          onMouseLeave?.(e)
        }
      },
      [controls, onMouseLeave]
    )
    return (
      <span
        role="img"
        aria-label={t("aria.copy")}
        className={cn(
          `flex cursor-pointer select-none items-center justify-center rounded-md transition-colors duration-200`,
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true">
          <motion.rect
            width="14"
            height="14"
            x="8"
            y="8"
            rx="2"
            ry="2"
            variants={{
              normal: { translateY: 0, translateX: 0 },
              animate: { translateY: -3, translateX: -3 }
            }}
            animate={controls}
            transition={defaultTransition}
          />
          <motion.path
            d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
            variants={{
              normal: { x: 0, y: 0 },
              animate: { x: 3, y: 3 }
            }}
            transition={defaultTransition}
            animate={controls}
          />
        </svg>
      </span>
    )
  }
)

CopyIcon.displayName = "CopyIcon"

export { CopyIcon }
