import DOMPurify from "dompurify"

import { debugLog } from "../logger"
import { DOMPURIFY_CONFIG } from "./config"

export type SanitizeResult = {
  html: string
  stats: {
    originalLength: number
    cleanedLength: number
  }
}

export function sanitizeHtml(sourceDoc: Document): SanitizeResult {
  const originalHTML = sourceDoc.body?.outerHTML || ""

  try {
    const cleanedHTML = DOMPurify.sanitize(
      originalHTML,
      DOMPURIFY_CONFIG
    ) as string

    debugLog("DOMPurify sanitize completed:", {
      originalLength: originalHTML.length,
      cleanedLength: cleanedHTML.length,
      removedBytes: originalHTML.length - cleanedHTML.length
    })

    return {
      html: cleanedHTML,
      stats: {
        originalLength: originalHTML.length,
        cleanedLength: cleanedHTML.length
      }
    }
  } catch (error) {
    debugLog("DOMPurify sanitize failed, using original:", error)
    return {
      html: originalHTML,
      stats: {
        originalLength: originalHTML.length,
        cleanedLength: originalHTML.length
      }
    }
  }
}

export function createReadabilityDocument(
  sourceDoc: Document,
  cleanBodyHTML: string
): Document {
  const fullHTML = `<!DOCTYPE html>
<html lang="${sourceDoc.documentElement.lang || "en"}">
<head>
  <title>${sourceDoc.title || ""}</title>
  <meta charset="utf-8">
  ${sourceDoc.head?.innerHTML || ""}
</head>
${cleanBodyHTML}
</html>`

  const parser = new DOMParser()
  const doc = parser.parseFromString(fullHTML, "text/html")

  if (!doc.body || !doc.head) {
    throw new Error("Document parsing incomplete")
  }

  debugLog("Created Readability document:", {
    bodyLength: doc.body.innerHTML.length,
    headLength: doc.head.innerHTML.length
  })

  return doc
}
