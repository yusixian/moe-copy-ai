import rehypeParse from "rehype-parse"
import rehypeRemark, { all } from "rehype-remark"
import remarkGfm from "remark-gfm"
import remarkStringify from "remark-stringify"
import { unified } from "unified"

/**
 * 预处理 HTML：清理不需要的元素
 */
function preprocessHtml(html: string): string {
  // 在浏览器环境中使用 DOMParser 清理
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    // 移除 script, style, noscript, svg 等元素
    const unwantedTags = ["script", "style", "noscript", "svg", "meta", "link"]
    for (const tag of unwantedTags) {
      const elements = doc.querySelectorAll(tag)
      for (const el of Array.from(elements)) {
        el.remove()
      }
    }

    // 移除 plasmo 相关元素
    const allElements = doc.querySelectorAll("*")
    for (const el of Array.from(allElements)) {
      if (
        el.id?.toLowerCase().includes("plasmo") ||
        el.className?.toLowerCase().includes("plasmo") ||
        el.getAttribute("data-plasmo-id") ||
        el.tagName.toLowerCase().includes("plasmo")
      ) {
        el.remove()
      }
    }

    return doc.body ? doc.body.innerHTML : html
  }

  // Node.js 环境中的简单清理（用于测试）
  return html
    .replace(/<(script|style|noscript|svg|meta|link)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|noscript|svg|meta|link)[^>]*\/>/gi, "")
    .replace(
      /<[^>]*(?:id|class|data-plasmo-id)="[^"]*plasmo[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
      ""
    )
    .replace(/<plasmo-[^>]*>[\s\S]*?<\/plasmo-[^>]+>/gi, "")
}

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

/**
 * Convert HTML to Markdown using unified ecosystem
 * @param html - HTML string to convert
 * @returns Promise<string> - Markdown string
 */
export async function parseHtmlToMarkdown(html: string): Promise<string> {
  if (!html || !html.trim()) {
    return ""
  }

  const cleanedHtml = preprocessHtml(html)

  const headingHandler = (depth: number) => (h: HFunction, node: HastElement) =>
    h(
      node,
      "heading",
      { depth },
      all(h as Parameters<typeof all>[0], node as Parameters<typeof all>[1])
    )

  const handlers: Record<string, (h: HFunction, node: HastElement) => unknown> =
    {
      h1: headingHandler(1),
      h2: headingHandler(2),
      h3: headingHandler(3),
      h4: headingHandler(4),
      h5: headingHandler(5),
      h6: headingHandler(6)
    }

  const result = await unified()
    .use(rehypeParse, { fragment: true })
    .use(() => (tree: HastNode) => {
      unwrapInvalidLinks(tree)
    })
    .use(
      rehypeRemark as unknown as (options?: Record<string, unknown>) => void,
      { handlers }
    )
    .use(remarkGfm)
    .use(
      remarkStringify as unknown as (options?: Record<string, unknown>) => void,
      {
        bullet: "-",
        emphasis: "*",
        strong: "*",
        fence: "`",
        fences: true,
        listItemIndent: "one"
      }
    )
    .process(cleanedHtml)

  return String(result).trim()
}
