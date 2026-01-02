import { all } from "rehype-remark"
import type { HastElement, HFunction } from "../types"

const headingHandler = (depth: number) => (h: HFunction, node: HastElement) =>
  h(
    node,
    "heading",
    { depth },
    all(h as Parameters<typeof all>[0], node as Parameters<typeof all>[1])
  )

export function createHeadingHandlers() {
  return {
    h1: headingHandler(1),
    h2: headingHandler(2),
    h3: headingHandler(3),
    h4: headingHandler(4),
    h5: headingHandler(5),
    h6: headingHandler(6)
  }
}
