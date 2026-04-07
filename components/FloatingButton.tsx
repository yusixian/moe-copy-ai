import iconUrl from "data-base64:~assets/icon.png"
import { Icon } from "@iconify/react"
import {
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react"

import { cn } from "~utils"
import {
  clampFloatingButtonLeft,
  clampFloatingButtonTop,
  type FloatingButtonPosition,
  getFloatingButtonLeftForSide,
  getFloatingButtonSnapPosition,
  getFloatingButtonViewport,
  getInitialFloatingButtonPosition
} from "~utils/floating-button-position"
import { useI18n } from "~utils/i18n"
import { useTheme } from "~utils/theme"

interface FloatingButtonProps {
  onClick: () => void
  isOpen: boolean
}

interface DragState {
  pointerId: number
  startX: number
  startY: number
  startPosition: Pick<FloatingButtonPosition, "left" | "top">
  didDrag: boolean
}

const DRAG_THRESHOLD = 6

const FloatingButton = ({ onClick, isOpen }: FloatingButtonProps) => {
  const { t } = useI18n()
  const { resolvedTheme } = useTheme()
  const [position, setPosition] = useState(() =>
    getInitialFloatingButtonPosition(getFloatingButtonViewport())
  )
  const [isDragging, setIsDragging] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const dragStateRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)

  // Light mode: original brand colors (sky blue + indigo)
  const lightModeClasses = isOpen
    ? "rotate-45 border-pink-200 bg-pink-50 text-pink-500"
    : "border-sky-100 bg-white text-sky-400 hover:border-indigo-200 hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 hover:text-sky-500"

  // Dark mode: design tokens
  const darkModeClasses = isOpen
    ? "rotate-45 border-pink-200 bg-pink-50 text-pink-500"
    : "border-line-1 bg-content-solid text-accent-blue hover:border-accent-blue/30 hover:bg-fill-1"

  useEffect(() => {
    const handleResize = () => {
      const viewport = getFloatingButtonViewport()

      setPosition((currentPosition) => ({
        left: getFloatingButtonLeftForSide(
          currentPosition.side,
          viewport.width
        ),
        top: clampFloatingButtonTop(currentPosition.top, viewport.height),
        side: currentPosition.side
      }))
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      const deltaX = event.clientX - dragState.startX
      const deltaY = event.clientY - dragState.startY
      const hasCrossedThreshold =
        Math.hypot(deltaX, deltaY) >= DRAG_THRESHOLD || dragState.didDrag

      if (!hasCrossedThreshold) {
        return
      }

      if (!dragState.didDrag) {
        dragState.didDrag = true
        suppressClickRef.current = true
        setIsDragging(true)
      }

      const viewport = getFloatingButtonViewport()

      setPosition((currentPosition) => ({
        ...currentPosition,
        left: clampFloatingButtonLeft(
          dragState.startPosition.left + deltaX,
          viewport.width
        ),
        top: clampFloatingButtonTop(
          dragState.startPosition.top + deltaY,
          viewport.height
        )
      }))
    }

    const handlePointerEnd = (event: PointerEvent) => {
      const dragState = dragStateRef.current

      if (!dragState || dragState.pointerId !== event.pointerId) {
        return
      }

      dragStateRef.current = null

      if (!dragState.didDrag) {
        return
      }

      const viewport = getFloatingButtonViewport()

      setIsDragging(false)
      setPosition((currentPosition) =>
        getFloatingButtonSnapPosition(currentPosition, viewport)
      )

      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 0)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerEnd)
    window.addEventListener("pointercancel", handlePointerEnd)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerEnd)
      window.removeEventListener("pointercancel", handlePointerEnd)
    }
  }, [])

  useEffect(() => {
    if (!isDragging) {
      return
    }

    const previousUserSelect = document.body.style.userSelect
    const previousCursor = document.body.style.cursor

    document.body.style.userSelect = "none"
    document.body.style.cursor = "grabbing"

    return () => {
      document.body.style.userSelect = previousUserSelect
      document.body.style.cursor = previousCursor
    }
  }, [isDragging])

  useLayoutEffect(() => {
    const buttonElement = buttonRef.current

    if (!buttonElement) {
      return
    }

    buttonElement.style.left = `${position.left}px`
    buttonElement.style.top = `${position.top}px`
  }, [position.left, position.top])

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return
    }

    event.stopPropagation()
    suppressClickRef.current = false
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPosition: {
        left: position.left,
        top: position.top
      },
      didDrag: false
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handleButtonClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    if (suppressClickRef.current || isDragging) {
      event.preventDefault()
      suppressClickRef.current = false
      return
    }

    onClick()
  }

  const handleNativeDragStart = (event: ReactDragEvent<HTMLElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      draggable={false}
      className={cn(
        "fixed z-[1000] flex h-10 w-10 touch-none items-center justify-center rounded-full border border-opacity-60 opacity-70 shadow-md hover:opacity-100",
        isDragging
          ? "cursor-grabbing transition-none"
          : "cursor-grab transition-all duration-300",
        resolvedTheme === "light" ? lightModeClasses : darkModeClasses
      )}
      onDragStart={handleNativeDragStart}
      onPointerDown={handlePointerDown}
      onClick={handleButtonClick}
      title={
        isOpen
          ? t("popup.floatButton.closeTooltip")
          : t("popup.floatButton.openTooltip")
      }>
      {isOpen ? (
        <Icon
          icon="line-md:close"
          width="20"
          height="20"
          className="pointer-events-none rotate-45 text-opacity-80"
        />
      ) : (
        <img
          src={iconUrl}
          alt="Moe Copy AI"
          draggable={false}
          onDragStart={handleNativeDragStart}
          className="pointer-events-none h-[36px] w-[36px]"
        />
      )}
    </button>
  )
}

export default FloatingButton
