import { describe, expect, it } from "vitest"

import {
  clampFloatingButtonLeft,
  clampFloatingButtonTop,
  FLOATING_BUTTON_BOTTOM_OFFSET,
  FLOATING_BUTTON_EDGE_OFFSET,
  FLOATING_BUTTON_SIZE,
  getFloatingButtonLeftForSide,
  getFloatingButtonSnapPosition,
  getFloatingButtonViewport,
  getInitialFloatingButtonPosition
} from "../floating-button-position"

describe("floating button position", () => {
  const viewport = { width: 1280, height: 720 }

  it("starts near the original bottom-right position", () => {
    expect(getInitialFloatingButtonPosition(viewport)).toEqual({
      left: viewport.width - FLOATING_BUTTON_SIZE - FLOATING_BUTTON_EDGE_OFFSET,
      top:
        viewport.height - FLOATING_BUTTON_SIZE - FLOATING_BUTTON_BOTTOM_OFFSET,
      side: "right"
    })
  })

  it("clamps dragging inside the viewport", () => {
    expect(clampFloatingButtonLeft(-100, viewport.width)).toBe(
      FLOATING_BUTTON_EDGE_OFFSET
    )
    expect(clampFloatingButtonLeft(9999, viewport.width)).toBe(
      getFloatingButtonLeftForSide("right", viewport.width)
    )
    expect(clampFloatingButtonTop(-100, viewport.height)).toBe(
      FLOATING_BUTTON_EDGE_OFFSET
    )
    expect(clampFloatingButtonTop(9999, viewport.height)).toBe(
      viewport.height - FLOATING_BUTTON_SIZE - FLOATING_BUTTON_EDGE_OFFSET
    )
  })

  it("snaps to the left edge when released on the left half", () => {
    expect(
      getFloatingButtonSnapPosition(
        {
          left: 100,
          top: 180
        },
        viewport
      )
    ).toEqual({
      left: FLOATING_BUTTON_EDGE_OFFSET,
      top: 180,
      side: "left"
    })
  })

  it("snaps to the right edge when released on the right half", () => {
    expect(
      getFloatingButtonSnapPosition(
        {
          left: 900,
          top: 200
        },
        viewport
      )
    ).toEqual({
      left: getFloatingButtonLeftForSide("right", viewport.width),
      top: 200,
      side: "right"
    })
  })

  it("returns current window dimensions from getFloatingButtonViewport", () => {
    const result = getFloatingButtonViewport()
    expect(result).toEqual({
      width: window.innerWidth,
      height: window.innerHeight
    })
  })
})
