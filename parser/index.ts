/**
 * HTML to Markdown Parser - Deep Module
 *
 * Design philosophy (A Philosophy of Software Design):
 * - Simple interface, complex implementation hidden
 * - Single entry point for all HTML→Markdown conversion
 * - Internal details (unified, plugins, preprocessing) are encapsulated
 */

import rehypeParse from "rehype-parse"
import rehypeRemark, { all } from "rehype-remark"
import remarkGfm from "remark-gfm"
import remarkStringify from "remark-stringify"
import type { Processor } from "unified"
import { unified } from "unified"

// ============================================================================
// Types (internal)
// ============================================================================

type HastNode = {
  type?: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

type HastElement = HastNode & {
  type: "element"
  tagName: string
  children?: HastNode[]
}

type HFunction = (
  node: HastNode,
  type: string,
  propsOrChildren?: Record<string, unknown> | unknown[] | string,
  children?: unknown[] | string
) => unknown

// ============================================================================
// Parser Configuration (internal)
// ============================================================================

const STRINGIFY_OPTIONS = {
  bullet: "-",
  emphasis: "*",
  strong: "*",
  fence: "`",
  fences: true,
  listItemIndent: "one"
} as const

const UNWANTED_TAGS = ["script", "style", "noscript", "svg", "meta", "link"]

// ============================================================================
// Heading Handlers (internal)
// ============================================================================

function createHeadingHandler(depth: number) {
  return (h: HFunction, node: HastElement) =>
    h(
      node,
      "heading",
      { depth },
      all(h as Parameters<typeof all>[0], node as Parameters<typeof all>[1])
    )
}

const HEADING_HANDLERS = {
  h1: createHeadingHandler(1),
  h2: createHeadingHandler(2),
  h3: createHeadingHandler(3),
  h4: createHeadingHandler(4),
  h5: createHeadingHandler(5),
  h6: createHeadingHandler(6)
}

// ============================================================================
// Link Unwrapping Plugin (internal)
// ============================================================================

function isElement(
  node: HastNode | undefined,
  tagName?: string
): node is HastElement {
  if (!node || node.type !== "element") return false
  return !tagName || node.tagName === tagName
}

function shouldUnwrapLink(href: unknown): boolean {
  if (typeof href !== "string") return true
  const normalized = href.trim().toLowerCase()
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
      if (isElement(child, "a") && shouldUnwrapLink(child.properties?.href)) {
        const replacement = child.children || []
        node.children.splice(i, 1, ...replacement)
        i += Math.max(0, replacement.length - 1)
        for (const replacementNode of replacement) {
          stack.push(replacementNode)
        }
        continue
      }
      stack.push(child)
    }
  }
}

function rehypeUnwrapInvalidLinks() {
  return (tree: HastNode) => unwrapInvalidLinks(tree)
}

// ============================================================================
// HTML Preprocessing (internal)
// ============================================================================

function resolveUrl(value: string, baseUrl?: string): string {
  if (!baseUrl) return value
  try {
    return new URL(value, baseUrl).href
  } catch {
    return value
  }
}

function preprocessInBrowser(html: string, baseUrl?: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")

  if (baseUrl) {
    doc.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src")
      if (src) img.setAttribute("src", resolveUrl(src, baseUrl))
    })
  }

  for (const tag of UNWANTED_TAGS) {
    for (const el of doc.querySelectorAll(tag)) {
      el.remove()
    }
  }

  doc.querySelectorAll("*").forEach((el) => {
    const id = el.id?.toLowerCase() || ""
    const className = el.className?.toLowerCase() || ""
    const tagName = el.tagName.toLowerCase()
    if (
      id.includes("plasmo") ||
      className.includes("plasmo") ||
      el.getAttribute("data-plasmo-id") ||
      tagName.includes("plasmo")
    ) {
      el.remove()
    }
  })

  return doc.body?.innerHTML || html
}

function preprocessInNode(html: string, baseUrl?: string): string {
  let result = html

  if (baseUrl) {
    result = result.replace(
      /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi,
      (match, _quote, src) => {
        if (!src) return match
        const resolved = resolveUrl(src, baseUrl)
        return resolved === src ? match : match.replace(src, resolved)
      }
    )
  }

  return result
    .replace(/<(script|style|noscript|svg|meta|link)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|noscript|svg|meta|link)[^>]*\/>/gi, "")
    .replace(
      /<[^>]*(?:id|class|data-plasmo-id)="[^"]*plasmo[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
      ""
    )
    .replace(/<plasmo-[^>]*>[\s\S]*?<\/plasmo-[^>]+>/gi, "")
}

function preprocessHtml(html: string, baseUrl?: string): string {
  return typeof DOMParser !== "undefined"
    ? preprocessInBrowser(html, baseUrl)
    : preprocessInNode(html, baseUrl)
}

// ============================================================================
// Parser Instance (singleton, internal)
// ============================================================================

let parserInstance: Processor | null = null

function getParser(): Processor {
  if (!parserInstance) {
    parserInstance = unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeUnwrapInvalidLinks)
      .use(
        rehypeRemark as unknown as (options?: Record<string, unknown>) => void,
        { handlers: HEADING_HANDLERS }
      )
      .use(remarkGfm)
      .use(
        remarkStringify as unknown as (
          options?: Record<string, unknown>
        ) => void,
        STRINGIFY_OPTIONS
      )
  }
  return parserInstance
}

// ============================================================================
// Public API
// ============================================================================

export type ParseOptions = {
  baseUrl?: string
}

/**
 * Convert HTML to Markdown
 *
 * @param html - HTML string to convert
 * @param options - Optional configuration
 * @returns Markdown string
 *
 * @example
 * const markdown = await parseHtmlToMarkdown('<h1>Hello</h1><p>World</p>')
 * // Returns: "# Hello\n\nWorld"
 */
export async function parseHtmlToMarkdown(
  html: string,
  options: ParseOptions = {}
): Promise<string> {
  if (!html?.trim()) return ""

  const cleanedHtml = preprocessHtml(html, options.baseUrl)
  const result = await getParser().process(cleanedHtml)

  return String(result).trim()
}

/**
 * Convenience overload: baseUrl as second parameter
 */
export async function parse(html: string, baseUrl?: string): Promise<string> {
  return parseHtmlToMarkdown(html, { baseUrl })
}
