function resolveUrl(value: string, baseUrl?: string): string {
  if (!baseUrl) return value
  try {
    return new URL(value, baseUrl).href
  } catch {
    return value
  }
}

export function preprocessHtml(html: string, baseUrl?: string): string {
  // Browser environment: use DOMParser for robust HTML handling.
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    if (baseUrl) {
      for (const image of Array.from(doc.querySelectorAll("img[src]"))) {
        const src = image.getAttribute("src")
        if (src) {
          image.setAttribute("src", resolveUrl(src, baseUrl))
        }
      }
    }

    // DOMParser may move <script> to <head>. Downstream HAST plugins
    // (rehypeExtractMath, rehypeCleanup) need them in the tree, so
    // move all head scripts back to <body> before serializing.
    if (doc.head && doc.body) {
      const firstChild = doc.body.firstChild
      for (const script of Array.from(doc.head.querySelectorAll("script"))) {
        doc.body.insertBefore(script, firstChild)
      }
    }

    // Remove Plasmo extension elements
    for (const el of Array.from(doc.querySelectorAll("*"))) {
      // el.className can be an SVGAnimatedString; use getAttribute
      const classAttr = el.getAttribute("class") ?? ""
      if (
        el.id?.toLowerCase().includes("plasmo") ||
        classAttr.toLowerCase().includes("plasmo") ||
        el.getAttribute("data-plasmo-id") ||
        el.tagName.toLowerCase().includes("plasmo")
      ) {
        el.remove()
      }
    }

    return doc.body ? doc.body.innerHTML : html
  }

  // Node.js fallback: regex-based cleanup
  let cleanedHtml = html
  if (baseUrl) {
    cleanedHtml = cleanedHtml.replace(
      /<img\b[^>]*\bsrc=(["'])(.*?)\1/gi,
      (match, _quote, src) => {
        if (!src) return match
        const resolved = resolveUrl(src, baseUrl)
        if (resolved === src) return match
        return match.replace(src, resolved)
      }
    )
  }

  return cleanedHtml
    .replace(
      /<[^>]*(?:id|class|data-plasmo-id)="[^"]*plasmo[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
      ""
    )
    .replace(/<plasmo-[^>]*>[\s\S]*?<\/plasmo-[^>]+>/gi, "")
}
