import type { HastNode } from "../types"

/** Tags to remove from the HAST tree after math extraction. */
const UNWANTED_TAGS = new Set([
  "script",
  "style",
  "noscript",
  "meta",
  "link",
  "svg"
])

function walk(node: HastNode): void {
  if (!node.children) return

  for (let i = node.children.length - 1; i >= 0; i--) {
    const child = node.children[i]
    if (
      child.type === "element" &&
      child.tagName &&
      UNWANTED_TAGS.has(child.tagName)
    ) {
      node.children.splice(i, 1)
    } else {
      walk(child)
    }
  }
}

/**
 * rehype plugin: remove unwanted HTML elements from the HAST tree.
 *
 * Must run AFTER rehypeExtractMath so that math-related elements
 * (e.g. <script type="math/tex">) are already converted to markers.
 */
export function rehypeCleanup() {
  return (tree: HastNode) => {
    walk(tree)
  }
}
