export const FLOATING_BUTTON_SIZE = 40
export const FLOATING_BUTTON_EDGE_OFFSET = 12
export const FLOATING_BUTTON_BOTTOM_OFFSET = 40

export type FloatingButtonSide = "left" | "right"

export interface FloatingButtonViewport {
  width: number
  height: number
}

export interface FloatingButtonPosition {
  left: number
  top: number
  side: FloatingButtonSide
}

function clamp(value: number, min: number, max: number) {
  const upperBound = Math.max(min, max)
  return Math.min(Math.max(value, min), upperBound)
}

export function getFloatingButtonLeftForSide(
  side: FloatingButtonSide,
  viewportWidth: number
) {
  if (side === "left") {
    return FLOATING_BUTTON_EDGE_OFFSET
  }

  return Math.max(
    FLOATING_BUTTON_EDGE_OFFSET,
    viewportWidth - FLOATING_BUTTON_SIZE - FLOATING_BUTTON_EDGE_OFFSET
  )
}

export function clampFloatingButtonLeft(left: number, viewportWidth: number) {
  return clamp(
    left,
    FLOATING_BUTTON_EDGE_OFFSET,
    getFloatingButtonLeftForSide("right", viewportWidth)
  )
}

export function clampFloatingButtonTop(top: number, viewportHeight: number) {
  return clamp(
    top,
    FLOATING_BUTTON_EDGE_OFFSET,
    viewportHeight - FLOATING_BUTTON_SIZE - FLOATING_BUTTON_EDGE_OFFSET
  )
}

export function getFloatingButtonViewport(): FloatingButtonViewport {
  if (typeof window === "undefined") {
    return { width: 1280, height: 720 }
  }

  return { width: window.innerWidth, height: window.innerHeight }
}

export function getInitialFloatingButtonPosition(
  viewport: FloatingButtonViewport
): FloatingButtonPosition {
  return {
    left: getFloatingButtonLeftForSide("right", viewport.width),
    top: clampFloatingButtonTop(
      viewport.height - FLOATING_BUTTON_SIZE - FLOATING_BUTTON_BOTTOM_OFFSET,
      viewport.height
    ),
    side: "right"
  }
}

export function getFloatingButtonSnapPosition(
  position: Pick<FloatingButtonPosition, "left" | "top">,
  viewport: FloatingButtonViewport
): FloatingButtonPosition {
  const nextLeft = clampFloatingButtonLeft(position.left, viewport.width)
  const side: FloatingButtonSide =
    nextLeft + FLOATING_BUTTON_SIZE / 2 <= viewport.width / 2 ? "left" : "right"

  return {
    left: getFloatingButtonLeftForSide(side, viewport.width),
    top: clampFloatingButtonTop(position.top, viewport.height),
    side
  }
}
