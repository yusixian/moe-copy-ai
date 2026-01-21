import { Icon } from "@iconify/react"
import type { Transition } from "motion/react"
import { AnimatePresence, motion, useAnimation } from "motion/react"
import { forwardRef, useEffect, useState } from "react"

import { Button } from "~/components/ui/button"
import { cn } from "~/utils"

export interface CollapsibleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  defaultExpanded?: boolean
  icon?: React.ReactNode
  iconClassName?: string
  titleClassName?: string
  onToggle?: (expanded: boolean) => void
}

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8
}

const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  (
    {
      className,
      title,
      titleClassName,
      children,
      defaultExpanded = false,
      icon,
      iconClassName,
      onToggle,
      ...props
    },
    ref
  ) => {
    const [expanded, setExpanded] = useState(defaultExpanded)
    const controls = useAnimation()

    useEffect(() => {
      controls.start(expanded ? "expanded" : "collapsed")
    }, [expanded, controls])

    const toggleExpand = () => {
      setExpanded(!expanded)
      if (onToggle) onToggle(!expanded)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "card overflow-hidden transition-all duration-300",
          className
        )}
        {...props}>
        {/* 可折叠面板标题栏 */}
        <Button
          variant="ghost"
          fullWidth
          className="group card justify-between rounded-[inherit] p-3 hover:bg-content-hover"
          onClick={toggleExpand}>
          <div className="flex items-center gap-2">
            {icon && (
              <span className={cn("text-accent-blue text-base", iconClassName)}>
                {icon}
              </span>
            )}
            <span className={cn("text-sm text-text-1", titleClassName)}>
              {title}
            </span>
          </div>

          <motion.div
            animate={expanded ? "expanded" : "collapsed"}
            variants={{
              expanded: { rotate: 0 },
              collapsed: { rotate: 180 }
            }}
            transition={defaultTransition}>
            <Icon
              icon="line-md:chevron-up"
              className="h-4 w-4 text-text-secondary"
            />
          </motion.div>
        </Button>

        {/* 内容区域 - 使用motion实现展开收起动画 */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={{
                expanded: { height: "auto", opacity: 1 },
                collapsed: { height: 0, opacity: 0 }
              }}
              transition={defaultTransition}>
              <div className="p-3">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

Collapsible.displayName = "Collapsible"

export { Collapsible }
