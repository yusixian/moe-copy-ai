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

    // Convert <script type="math/tex"> to marker elements BEFORE removing scripts.
    // DOMParser may place <script> in <head>, so we search the entire document.
    for (const el of Array.from(doc.querySelectorAll("script"))) {
      const type = el.getAttribute("type") ?? ""
      if (type.startsWith("math/tex")) {
        const isDisplay = type.includes("mode=display")
        const latex = el.textContent ?? ""
        const marker = doc.createElement(isDisplay ? "div" : "span")
        marker.setAttribute("data-math-type", isDisplay ? "block" : "inline")
        marker.textContent = latex
        // DOMParser may place top-level <script> in <head>.
        // If so, move the marker to <body> instead of leaving it in <head>.
        if (el.parentElement === doc.head && doc.body) {
          el.remove()
          doc.body.prepend(marker)
        } else {
          el.replaceWith(marker)
        }
      }
    }

    // Remove MathJax v2 rendered output spans (they duplicate the script source).
    // Only remove <span class="MathJax">, NOT <mjx-container class="MathJax"> (v3).
    for (const el of Array.from(
      doc.querySelectorAll("span.MathJax, span.MathJax_Display")
    )) {
      el.remove()
    }

    // Now remove all remaining scripts
    for (const el of Array.from(doc.querySelectorAll("script"))) {
      el.remove()
    }

    const unwantedTags = ["style", "noscript", "meta", "link"]
    for (const tag of unwantedTags) {
      const elements = doc.querySelectorAll(tag)
      for (const el of Array.from(elements)) {
        el.remove()
      }
    }

    // Remove SVGs, but preserve those inside math containers (MathJax SVG output)
    for (const el of Array.from(doc.querySelectorAll("svg"))) {
      const parent = el.closest(
        "mjx-container, .MathJax, .katex, .katex-display"
      )
      if (!parent) {
        el.remove()
      }
    }

    const allElements = doc.querySelectorAll("*")
    for (const el of Array.from(allElements)) {
      // el.className can be an SVGAnimatedString on SVG elements; use getAttribute
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

  // Convert <script type="math/tex"> to marker elements before removing scripts
  cleanedHtml = cleanedHtml.replace(
    /<script\s+type\s*=\s*["'](math\/tex(?:;\s*mode=display)?)["'][^>]*>([\s\S]*?)<\/script>/gi,
    (_match, type: string, content: string) => {
      const isDisplay = type.includes("mode=display")
      const tag = isDisplay ? "div" : "span"
      const mode = isDisplay ? "block" : "inline"
      return `<${tag} data-math-type="${mode}">${content}</${tag}>`
    }
  )

  // Remove remaining unwanted tags
  return cleanedHtml
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<(style|noscript|meta|link)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(style|noscript|meta|link)[^>]*\/>/gi, "")
    .replace(
      /<svg(?![^>]*(?:class|id)\s*=\s*["'][^"']*(MathJax|katex))[^>]*>[\s\S]*?<\/svg>/gi,
      ""
    )
    .replace(
      /<[^>]*(?:id|class|data-plasmo-id)="[^"]*plasmo[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
      ""
    )
    .replace(/<plasmo-[^>]*>[\s\S]*?<\/plasmo-[^>]+>/gi, "")
}
