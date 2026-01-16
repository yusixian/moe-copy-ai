/**
 * Mock for parser/htmlParser.ts
 * Used in Vitest tests to avoid importing the full unified ecosystem
 */

/**
 * Mock implementation of parseHtmlToMarkdown for testing
 * Simplified version that converts basic HTML to Markdown without unified
 */
export async function parseHtmlToMarkdown(
  html: string,
  baseUrl?: string
): Promise<string> {
  if (!html || !html.trim()) {
    return ""
  }

  // Create a temporary DOM element for parsing
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = html

  // Simple recursive conversion for testing purposes
  function convertNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return (node.textContent || "").replace(/\s+/g, " ")
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()

      // Skip unwanted elements
      if (
        ["script", "style", "meta", "link", "noscript", "svg"].includes(tagName)
      ) {
        return ""
      }

      // Skip Plasmo elements
      if (
        element.id?.toLowerCase().includes("plasmo") ||
        element.className?.toLowerCase().includes("plasmo") ||
        element.getAttribute("data-plasmo-id") ||
        tagName.includes("plasmo")
      ) {
        return ""
      }

      const childContent = Array.from(element.childNodes)
        .map(convertNode)
        .join("")

      switch (tagName) {
        case "h1":
          return `\n\n# ${childContent.trim()}\n\n`
        case "h2":
          return `\n\n## ${childContent.trim()}\n\n`
        case "h3":
          return `\n\n### ${childContent.trim()}\n\n`
        case "h4":
          return `\n\n#### ${childContent.trim()}\n\n`
        case "h5":
          return `\n\n##### ${childContent.trim()}\n\n`
        case "h6":
          return `\n\n###### ${childContent.trim()}\n\n`
        case "p":
          return childContent.trim() ? `\n\n${childContent.trim()}\n` : ""
        case "br":
          return "\n"
        case "strong":
        case "b":
          return `**${childContent.trim()}**`
        case "em":
        case "i":
          return `*${childContent.trim()}*`
        case "code":
          return `\`${childContent.trim()}\``
        case "pre":
          return `\n\n\`\`\`\n${childContent.trim()}\n\`\`\`\n\n`
        case "blockquote":
          return `\n\n> ${childContent.trim()}\n\n`
        case "a": {
          const href = element.getAttribute("href")
          const linkText = childContent.trim()
          // Skip invalid links
          if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("javascript:") ||
            !linkText
          ) {
            return linkText
          }
          // Resolve relative URLs if baseUrl is provided
          const finalHref =
            baseUrl && !href.startsWith("http")
              ? new URL(href, baseUrl).href
              : href
          return `[${linkText}](${finalHref})`
        }
        case "ul":
          return `\n${childContent}\n`
        case "ol":
          return `\n${childContent}\n`
        case "li": {
          const content = childContent.trim()
          const parentOl = element.closest("ol")
          if (parentOl) {
            const siblings = Array.from(parentOl.children)
            const index = siblings.indexOf(element) + 1
            return content ? `\n${index}. ${content}` : ""
          }
          return content ? `\n- ${content}` : ""
        }
        case "img": {
          const src = element.getAttribute("src")
          const alt = element.getAttribute("alt") || ""
          if (src) {
            // Resolve relative URLs if baseUrl is provided
            const finalSrc =
              baseUrl && !src.startsWith("http")
                ? new URL(src, baseUrl).href
                : src
            return `![${alt}](${finalSrc})`
          }
          return ""
        }
        case "hr":
          return "\n\n---\n\n"
        default:
          return childContent
      }
    }

    return ""
  }

  const markdown = convertNode(tempDiv)

  // Clean up extra whitespace
  return markdown.replace(/\n{3,}/g, "\n\n").trim()
}
