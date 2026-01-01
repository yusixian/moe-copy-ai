import { Icon } from "@iconify/react"
import type { Transition } from "motion/react"
import { AnimatePresence, motion, useAnimation } from "motion/react"
import { forwardRef, useEffect, useState } from "react"

import { cn } from "~/utils"

export interface CollapsibleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  defaultExpanded?: boolean
  icon?: React.ReactNode
  iconExpanded?: React.ReactNode
  iconCollapsed?: React.ReactNode
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
      children,
      defaultExpanded = false,
      icon,
      iconExpanded = "✨",
      iconCollapsed = "📁",
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
          "overflow-hidden rounded-xl border border-sky-200 bg-blue-50 transition-all duration-300",
          className
        )}
        {...props}>
        {/* 可折叠面板标题栏 */}
        <div
          className="group relative flex cursor-pointer items-center justify-between border-sky-200 border-b bg-gradient-to-r from-sky-100 to-indigo-100 p-2 transition-all duration-300"
          onClick={toggleExpand}>
          {/* 背景装饰元素 */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden opacity-10">
            <div className="absolute top-1 left-1/4 h-2 w-2 rounded-full bg-pink-400"></div>
            <div className="absolute right-1/4 bottom-1 h-2 w-2 rounded-full bg-sky-400"></div>
            <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-12 w-12 transform rounded-full bg-gradient-to-r from-yellow-200 to-pink-200 opacity-20 blur-xl filter"></div>
          </div>

          <div className="relative flex items-center gap-2">
            <span className="inline-block text-base text-sky-600 group-hover:animate-wiggle">
              {icon || (expanded ? iconExpanded : iconCollapsed)}
            </span>

            {/* 装饰元素 */}
            <div className="flex items-center space-x-1">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-pink-300"></span>
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-purple-300 delay-200"></span>
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-sky-300 delay-300"></span>
            </div>

            {/* 标题 */}
            <div className="ml-1 text-sky-500 text-xs">{title}</div>
          </div>

          <div className="relative flex items-center">
            {/* 展开/收起按钮 */}
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border bg-white transition-all duration-300 group-hover:shadow-md ${
                expanded
                  ? "border-sky-200 bg-opacity-50 group-hover:bg-opacity-80"
                  : "border-pink-200 bg-opacity-70 group-hover:bg-opacity-100"
              }`}>
              <motion.div
                animate={expanded ? "expanded" : "collapsed"}
                variants={{
                  expanded: { rotate: 0 },
                  collapsed: { rotate: 180 }
                }}
                transition={defaultTransition}>
                <Icon
                  icon="line-md:chevron-up"
                  className="h-4 w-4 text-sky-500 group-hover:scale-110"
                />
              </motion.div>

              {/* 小气泡装饰 */}
              <span
                className={`-top-1 -right-1 absolute h-2 w-2 rounded-full ${expanded ? "bg-sky-300" : "bg-pink-300"} opacity-70`}></span>
            </div>
          </div>
        </div>

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
