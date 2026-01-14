import type { HastElement, HastNode } from "../types"

function isElement(
  node: HastNode | undefined,
  tagName?: string
): node is HastElement {
  if (!node || node.type !== "element") return false
  if (!tagName) return true
  return node.tagName === tagName
}

function shouldUnwrapLink(hrefValue: unknown): boolean {
  if (typeof hrefValue !== "string") {
    return true
  }

  const normalized = hrefValue.trim().toLowerCase()
  if (!normalized) return true
  if (normalized.startsWith("javascript:")) return true
  if (normalized.startsWith("#")) return true

  return false
}

function unwrapInvalidLinks(tree: HastNode): void {
  const stack: HastNode[] = [tree]

  while (stack.length > 0) {
    const node = stack.pop()
    if (!node?.children) continue

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i]
      if (isElement(child, "a")) {
        const hrefValue = child.properties?.href
        if (shouldUnwrapLink(hrefValue)) {
          const replacement = child.children || []
          node.children.splice(i, 1, ...replacement)
          i += Math.max(0, replacement.length - 1)
          for (const replacementNode of replacement) {
            stack.push(replacementNode)
          }
          continue
        }
      }
      stack.push(child)
    }
  }
}

export function rehypeUnwrapInvalidLinks() {
  return (tree: HastNode) => {
    unwrapInvalidLinks(tree)
  }
}
