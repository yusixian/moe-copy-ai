import {
  autoUpdate,
  FloatingFocusManager,
  FloatingPortal,
  flip,
  offset,
  shift,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole
} from "@floating-ui/react"
import { useEffect, useRef, useState } from "react"

// ============================================================================
// FloatingDropdown - 基础浮动下拉容器
// ============================================================================

interface FloatingDropdownProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  content: React.ReactNode
  matchWidth?: boolean
  className?: string
  enablePortal?: boolean
}

export function FloatingDropdown({
  open,
  onOpenChange,
  children,
  content,
  matchWidth = true,
  className = "",
  enablePortal = true
}: FloatingDropdownProps) {
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange,
    // Portal mounts to body → "absolute" works relative to offsetParent.
    // Without portal (popup/sidepanel), "fixed" escapes overflow:hidden containers.
    strategy: enablePortal ? "absolute" : "fixed",
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      matchWidth &&
        size({
          apply({ rects, elements }) {
            Object.assign(elements.floating.style, {
              width: `${rects.reference.width}px`
            })
          }
        })
    ].filter(Boolean),
    whileElementsMounted: autoUpdate
  })

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "listbox" })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    dismiss,
    role
  ])

  const floatingEl = (
    <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
      <div
        ref={refs.setFloating}
        style={floatingStyles}
        className={className}
        {...getFloatingProps()}>
        {content}
      </div>
    </FloatingFocusManager>
  )

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {open &&
        (enablePortal ? (
          <FloatingPortal>{floatingEl}</FloatingPortal>
        ) : (
          floatingEl
        ))}
    </>
  )
}

// ============================================================================
// useCombobox - Combobox Hook，支持键盘导航和值匹配
// ============================================================================

interface UseComboboxOptions<T> {
  items: T[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  /** 获取选项的唯一标识，用于匹配当前值 */
  getItemId?: (item: T) => string
  /** 当前选中的值 */
  selectedValue?: string | null
}

export function useCombobox<T>({
  items,
  isOpen,
  onOpenChange,
  getItemId = (item) => String(item),
  selectedValue
}: UseComboboxOptions<T>) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const listRef = useRef<(HTMLElement | null)[]>([])

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`
          })
        }
      })
    ],
    whileElementsMounted: autoUpdate
  })

  const dismiss = useDismiss(context)
  const role = useRole(context, { role: "listbox" })
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true
  })

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [dismiss, role, listNav]
  )

  // 记录上一次的 isOpen 状态
  const prevIsOpenRef = useRef(isOpen)

  // 只在打开时定位到当前选中的值（不在 items 变化时重置）
  useEffect(() => {
    const wasOpen = prevIsOpenRef.current
    prevIsOpenRef.current = isOpen

    // 只在从关闭变为打开时执行
    if (!wasOpen && isOpen) {
      if (selectedValue) {
        const index = items.findIndex(
          (item) => getItemId(item) === selectedValue
        )
        setActiveIndex(index >= 0 ? index : null)

        // 滚动到选中项
        if (index >= 0) {
          requestAnimationFrame(() => {
            listRef.current[index]?.scrollIntoView({ block: "nearest" })
          })
        }
      } else {
        setActiveIndex(null)
      }
    }
  }, [isOpen, items, selectedValue, getItemId])

  return {
    // Floating UI
    refs,
    floatingStyles,
    context,
    // 列表导航
    activeIndex,
    setActiveIndex,
    listRef,
    // Props getters
    getReferenceProps,
    getFloatingProps,
    getItemProps
  }
}
