import { debugLog } from "../logger"

export function extractMetadata(): Record<string, string> {
  const metadata: Record<string, string> = {}
  const metaTags = document.querySelectorAll("meta")

  metaTags.forEach((meta) => {
    const name = meta.getAttribute("name") || meta.getAttribute("property")
    const content = meta.getAttribute("content")
    if (name && content) {
      metadata[name] = content
    }
  })

  debugLog(`Extracted ${Object.keys(metadata).length} metadata tags`)
  return metadata
}
