import { all } from "rehype-remark"
import type { HastElement, HFunction } from "../types"

/**
 * rehype-remark handlers for math marker nodes.
 *
 * Converts:
 *   <span data-math-type="inline">LaTeX</span> → { type: "inlineMath", value }
 *   <div data-math-type="block">LaTeX</div>   → { type: "math", value }
 *
 * remark-math's stringify extension serializes these as $...$ and $$\n...\n$$.
 */

function getTextContent(node: HastElement): string {
  if (!node.children) return ""
  return node.children
    .map((child) => (child.type === "text" ? (child.value ?? "") : ""))
    .join("")
}

export function createMathHandlers() {
  return {
    span: (h: HFunction, node: HastElement) => {
      if (node.properties?.dataMathType === "inline") {
        return { type: "inlineMath", value: getTextContent(node) }
      }
      // Default span behaviour: process children inline
      return all(
        h as Parameters<typeof all>[0],
        node as Parameters<typeof all>[1]
      )
    },
    div: (h: HFunction, node: HastElement) => {
      if (node.properties?.dataMathType === "block") {
        return { type: "math", value: getTextContent(node) }
      }
      // Default div behaviour: process children
      return all(
        h as Parameters<typeof all>[0],
        node as Parameters<typeof all>[1]
      )
    }
  }
}
