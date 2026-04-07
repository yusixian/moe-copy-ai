import type { HastNode } from "../types"

/**
 * rehype plugin: extract math formulas from KaTeX, MathJax v2/v3, and native MathML.
 *
 * Replaces math DOM nodes with simple marker elements:
 *   <span data-math-type="inline">LaTeX</span>
 *   <div data-math-type="block">LaTeX</div>
 *
 * These markers are later converted to mdast math nodes by math-handlers.ts.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getClassName(node: HastNode): string {
  const cls = node.properties?.className
  if (Array.isArray(cls)) return cls.join(" ")
  if (typeof cls === "string") return cls
  return ""
}

function hasClass(node: HastNode, name: string): boolean {
  return getClassName(node).split(/\s+/).includes(name)
}

function isElement(node: HastNode, tagName?: string): boolean {
  if (node.type !== "element") return false
  if (tagName && node.tagName !== tagName) return false
  return true
}

/** Collect all text content from a subtree. */
function textContent(node: HastNode): string {
  if (node.type === "text") return node.value ?? ""
  if (!node.children) return ""
  return node.children.map(textContent).join("")
}

/**
 * Depth-first search for a descendant matching a predicate.
 * Returns the first match or undefined.
 */
function findDescendant(
  node: HastNode,
  predicate: (n: HastNode) => boolean
): HastNode | undefined {
  if (predicate(node)) return node
  if (!node.children) return undefined
  for (const child of node.children) {
    const found = findDescendant(child, predicate)
    if (found) return found
  }
  return undefined
}

/**
 * Find `<annotation encoding="application/x-tex">` inside a subtree.
 */
function findTexAnnotation(node: HastNode): string | undefined {
  const annotation = findDescendant(
    node,
    (n) =>
      isElement(n, "annotation") &&
      String(n.properties?.encoding ?? "").toLowerCase() === "application/x-tex"
  )
  if (!annotation) return undefined
  const text = textContent(annotation).trim()
  return text || undefined
}

/**
 * Serialize a <math> subtree back to an XML string suitable for mathml-to-latex.
 */
function serializeMathML(node: HastNode): string {
  if (node.type === "text") return node.value ?? ""

  if (node.type === "element" && node.tagName) {
    const attrs = node.properties
      ? Object.entries(node.properties)
          .filter(([k]) => k !== "className")
          .map(([k, v]) => ` ${k}="${String(v)}"`)
          .join("")
      : ""
    const children = (node.children ?? []).map(serializeMathML).join("")
    return `<${node.tagName}${attrs}>${children}</${node.tagName}>`
  }

  return (node.children ?? []).map(serializeMathML).join("")
}

/**
 * Try to convert a <math> node to LaTeX via mathml-to-latex.
 * Returns undefined on failure.
 */
async function mathmlNodeToLatex(
  mathNode: HastNode,
  MathMLToLaTeX: MathMLToLaTeXConverter | undefined
): Promise<string | undefined> {
  if (!MathMLToLaTeX) return undefined
  try {
    const xml = serializeMathML(mathNode)
    const latex = MathMLToLaTeX.convert(xml).trim()
    return latex || undefined
  } catch {
    return undefined
  }
}

/** Check for data-formula or data-tex attributes (custom site attrs). */
function getCustomDataLatex(node: HastNode): string | undefined {
  const props = node.properties
  if (!props) return undefined
  for (const key of ["dataFormula", "dataTex", "dataLatex"]) {
    const val = props[key]
    if (typeof val === "string" && val.trim()) return val.trim()
  }
  return undefined
}

// ---------------------------------------------------------------------------
// Marker node builders
// ---------------------------------------------------------------------------

function makeMathMarker(latex: string, displayMode: boolean): HastNode {
  return {
    type: "element",
    tagName: displayMode ? "div" : "span",
    properties: { dataMathType: displayMode ? "block" : "inline" },
    children: [{ type: "text", value: latex }]
  }
}

// ---------------------------------------------------------------------------
// Type for dynamic import
// ---------------------------------------------------------------------------

interface MathMLToLaTeXConverter {
  convert(mathml: string): string
}

// ---------------------------------------------------------------------------
// Core extraction logic (operates on HAST tree)
// ---------------------------------------------------------------------------

/** Check whether a node is a <script type="math/tex"> (MathJax v2 source). */
function isMathTexScript(node: HastNode): boolean {
  if (!isElement(node, "script")) return false
  const type = String(node.properties?.type ?? "")
  return type.startsWith("math/tex")
}

/**
 * Check if a <math> node is nested inside a KaTeX or MathJax container.
 * If so, we skip it — the parent handler already extracted it.
 */
function isMathInsideRenderer(ancestors: HastNode[]): boolean {
  for (const ancestor of ancestors) {
    if (hasClass(ancestor, "katex") || hasClass(ancestor, "katex-mathml")) {
      return true
    }
    if (
      hasClass(ancestor, "MathJax") ||
      isElement(ancestor, "mjx-container") ||
      isElement(ancestor, "mjx-assistive-mml")
    ) {
      return true
    }
  }
  return false
}

async function processNode(
  node: HastNode,
  parent: HastNode | undefined,
  index: number,
  ancestors: HastNode[],
  MathMLToLaTeX: MathMLToLaTeXConverter | undefined
): Promise<boolean> {
  // --- KaTeX: .katex-display (block) or .katex (inline) ---
  if (
    isElement(node) &&
    (hasClass(node, "katex-display") || hasClass(node, "katex"))
  ) {
    const isDisplay = hasClass(node, "katex-display")

    // For .katex-display, the actual .katex is a child
    const katexNode = isDisplay
      ? findDescendant(node, (n) => hasClass(n, "katex"))
      : node

    if (katexNode) {
      const latex =
        findTexAnnotation(katexNode) ?? getCustomDataLatex(katexNode)

      if (latex && parent?.children) {
        parent.children[index] = makeMathMarker(latex, isDisplay)
        return true // replaced
      }
    }
  }

  // --- MathJax v3: <mjx-container> ---
  if (isElement(node, "mjx-container")) {
    const displayAttr = node.properties?.display
    const isDisplay =
      displayAttr === "true" ||
      displayAttr === true ||
      hasClass(node, "MathJax_Display")

    let latex = findTexAnnotation(node) ?? getCustomDataLatex(node)

    if (!latex) {
      // fallback: find <math> inside mjx-assistive-mml
      const mathEl = findDescendant(node, (n) => isElement(n, "math"))
      if (mathEl) {
        latex = await mathmlNodeToLatex(mathEl, MathMLToLaTeX)
      }
    }

    if (latex && parent?.children) {
      parent.children[index] = makeMathMarker(latex, isDisplay)
      return true
    }
  }

  // --- MathJax v2: <script type="math/tex"> ---
  if (isMathTexScript(node)) {
    const type = String(node.properties?.type ?? "")
    const isDisplay = type.includes("mode=display")
    const latex = textContent(node).trim()
    if (latex && parent?.children) {
      parent.children[index] = makeMathMarker(latex, isDisplay)
      return true
    }
  }

  // --- MathJax v2 rendered span: .MathJax / .MathJax_Display ---
  if (
    isElement(node) &&
    (hasClass(node, "MathJax") || hasClass(node, "MathJax_Display"))
  ) {
    // Check if a sibling math/tex script or marker already covers this formula.
    // Due to reverse iteration, the script may not yet be converted to a marker,
    // so we check for both forms.
    if (parent?.children) {
      const hasSiblingMathSource = parent.children.some(
        (sibling) =>
          sibling !== node &&
          isElement(sibling) &&
          (sibling.properties?.dataMathType === "inline" ||
            sibling.properties?.dataMathType === "block" ||
            isMathTexScript(sibling))
      )
      if (hasSiblingMathSource) {
        // Remove the rendered span to avoid duplication
        parent.children.splice(index, 1)
        return true
      }
    }

    // No sibling script — try annotation fallback
    const isDisplay = hasClass(node, "MathJax_Display")
    const latex = findTexAnnotation(node) ?? getCustomDataLatex(node)

    if (latex && parent?.children) {
      parent.children[index] = makeMathMarker(latex, isDisplay)
      return true
    }
  }

  // --- Native MathML: <math> (not inside KaTeX/MathJax) ---
  if (isElement(node, "math") && !isMathInsideRenderer(ancestors)) {
    const displayAttr = node.properties?.display
    const isDisplay = displayAttr === "block"

    let latex = findTexAnnotation(node) ?? getCustomDataLatex(node)

    if (!latex) {
      latex = await mathmlNodeToLatex(node, MathMLToLaTeX)
    }

    if (latex && parent?.children) {
      parent.children[index] = makeMathMarker(latex, isDisplay)
      return true
    }
  }

  return false
}

/**
 * Walk the HAST tree and process all math nodes.
 * We walk iteratively to handle replacements correctly.
 */
async function walkTree(
  tree: HastNode,
  MathMLToLaTeX: MathMLToLaTeXConverter | undefined
): Promise<void> {
  // Use a queue of { node, parent, index, ancestors }
  type QueueItem = {
    node: HastNode
    parent: HastNode | undefined
    index: number
    ancestors: HastNode[]
  }

  const process = async (item: QueueItem): Promise<void> => {
    const { node, parent, index, ancestors } = item

    const replaced = await processNode(
      node,
      parent,
      index,
      ancestors,
      MathMLToLaTeX
    )
    if (replaced) return // node was replaced, don't recurse into it

    // Recurse into children (iterate backwards so splicing doesn't skip)
    if (node.children) {
      const newAncestors = [...ancestors, node]
      for (let i = node.children.length - 1; i >= 0; i--) {
        await process({
          node: node.children[i],
          parent: node,
          index: i,
          ancestors: newAncestors
        })
      }
    }
  }

  await process({ node: tree, parent: undefined, index: 0, ancestors: [] })
}

// ---------------------------------------------------------------------------
// rehype plugin
// ---------------------------------------------------------------------------

export function rehypeExtractMath() {
  return async (tree: HastNode) => {
    // Dynamically import mathml-to-latex (it's a fallback, not always needed)
    let MathMLToLaTeX: MathMLToLaTeXConverter | undefined
    try {
      const mod = await import("mathml-to-latex")
      MathMLToLaTeX = mod.MathMLToLaTeX
    } catch {
      // mathml-to-latex not available — will skip MathML fallback
    }

    await walkTree(tree, MathMLToLaTeX)
  }
}
