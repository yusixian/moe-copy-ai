function resolveUrl(value: string, baseUrl?: string): string {
  if (!baseUrl) return value
  try {
    return new URL(value, baseUrl).href
  } catch {
    return value
  }
}

export function preprocessHtml(html: string, baseUrl?: string): string {
  // Browser environment: use DOMParser to clean.
  if (typeof DOMParser !== "undefined") {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")

    if (baseUrl) {
      const images = doc.querySelectorAll("img[src]")
      for (const image of Array.from(images)) {
        const src = image.getAttribute("src")
        if (src) {
          image.setAttribute("src", resolveUrl(src, baseUrl))
        }
      }
    }

    const unwantedTags = ["script", "style", "noscript", "svg", "meta", "link"]
    for (const tag of unwantedTags) {
      const elements = doc.querySelectorAll(tag)
      for (const el of Array.from(elements)) {
        el.remove()
      }
    }

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

  // Node.js environment: lightweight cleanup for tests.
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
    .replace(/<(script|style|noscript|svg|meta|link)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|noscript|svg|meta|link)[^>]*\/>/gi, "")
    .replace(
      /<[^>]*(?:id|class|data-plasmo-id)="[^"]*plasmo[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
      ""
    )
    .replace(/<plasmo-[^>]*>[\s\S]*?<\/plasmo-[^>]+>/gi, "")
}
