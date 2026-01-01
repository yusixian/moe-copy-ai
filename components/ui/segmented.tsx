import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import React, { useCallback, useEffect, useState } from "react"

import { cn } from "~utils"

export type SegmentedOption<T extends string | number = string | number> = {
  label?: string
  value: T
  icon?: React.ReactNode
} | null

type SegmentedProps<T extends string | number = string | number> = {
  options: SegmentedOption<T>[]
  defaultValue?: T
  onChange?: (value: T) => void
  className?: string
  indicateClass?: string
  itemClass?: string
  id?: string
  value?: T
}

export const Segmented = <T extends string | number = string | number>({
  options,
  defaultValue,
  onChange,
  className,
  id,
  indicateClass,
  itemClass,
  value
}: SegmentedProps<T>) => {
  const [_value, setValue] = useState<T | null>(
    () => value ?? defaultValue ?? null
  )
  const shouldReduceMotion = useReducedMotion()

  const select = useCallback(
    (value: T) => {
      setValue(value)
      onChange?.(value)
    },
    [onChange]
  )
  const isSelected = useCallback(
    (selectedValue: T) => _value !== null && _value === selectedValue,
    [_value]
  )

  useEffect(() => {
    setValue(value ?? null)
  }, [value])

  return (
    <div
      className={cn(
        "flex w-fit cursor-pointer select-none rounded-lg bg-gray-100 p-1 font-medium text-xs",
        className
      )}>
      {options.map((option) => {
        if (!option) return null
        const { label, value, icon } = option
        const selected = isSelected(value)
        return (
          <motion.div
            className={cn(
              "relative z-0 flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-1.5",
              selected ? "text-sky-600" : "text-gray-600 hover:text-gray-900",
              itemClass
            )}
            onClick={() => select(value)}
            key={value}
            layout={!shouldReduceMotion}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 400, damping: 30 }
            }>
            {/* 图标 */}
            {icon && (
              <span className="flex shrink-0 items-center justify-center">
                {icon}
              </span>
            )}

            {/* 文字标签 */}
            <AnimatePresence initial={false} mode="wait">
              {label && (
                <motion.span
                  initial={shouldReduceMotion ? undefined : { opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.15, ease: "easeInOut" }
                  }
                  className="whitespace-nowrap">
                  {label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* 选中背景 */}
            {selected && (
              <motion.div
                layoutId={`segmented_selected_bg_${id ?? "default"}`}
                className={cn(
                  "-z-10 absolute inset-0 rounded-md bg-white shadow-sm",
                  indicateClass
                )}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 30 }
                }
                style={{
                  willChange: shouldReduceMotion ? "auto" : "transform"
                }}
              />
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default React.memo(Segmented) as typeof Segmented
