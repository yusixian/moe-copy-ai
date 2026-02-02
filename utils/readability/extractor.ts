import { Readability } from "@mozilla/readability"

import type { ReadabilityResult } from "../../constants/types"
import { debugLog } from "../logger"
import { READABILITY_OPTIONS } from "./config"
import { createReadabilityDocument, sanitizeHtml } from "./sanitizer"

interface ReadabilityParseResult {
  title: string
  content: string
  textContent: string
  length: number
  excerpt: string
  byline: string
  dir: string
  siteName: string
  lang: string
  publishedTime: string
}

export type ExtractionResult = {
  content: string
  metadata: ReadabilityResult
  success: boolean
}

const EMPTY_METADATA: ReadabilityResult = {
  title: "",
  content: "",
  textContent: "",
  length: 0,
  excerpt: "",
  byline: "",
  dir: "",
  siteName: "",
  lang: "",
  publishedTime: ""
}

function createFailureResult(): ExtractionResult {
  return { content: "", metadata: EMPTY_METADATA, success: false }
}

function toMetadata(article: ReadabilityParseResult): ReadabilityResult {
  return {
    title: article.title,
    content: article.content,
    textContent: article.textContent,
    length: article.length,
    excerpt: article.excerpt,
    byline: article.byline,
    dir: article.dir,
    siteName: article.siteName,
    lang: article.lang,
    publishedTime: article.publishedTime
  }
}

function logContentStructure(content: string): void {
  const tempDiv = document.createElement("div")
  tempDiv.innerHTML = content
  const sections = tempDiv.querySelectorAll("section, .newsletter-section")
  const articles = tempDiv.querySelectorAll("article, .newsletter-article")
  const headers = tempDiv.querySelectorAll("h1, h2, h3")
  const sectionTitles = tempDiv.querySelectorAll(".section-title, h2")

  debugLog("Extracted content structure:", {
    sectionsFound: sections.length,
    articlesFound: articles.length,
    headersFound: headers.length,
    sectionTitles: Array.from(sectionTitles)
      .map((s) => s.textContent?.trim())
      .slice(0, 10)
  })
}

export async function extractWithReadability(
  extractionDocument?: Document
): Promise<ExtractionResult> {
  try {
    debugLog("Starting DOMPurify + Readability extraction")

    const sourceDoc = extractionDocument || document

    if (!extractionDocument) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    debugLog("Source document info:", {
      title: sourceDoc.title,
      bodyLength: sourceDoc.body?.innerHTML?.length || 0,
      url: sourceDoc.URL
    })

    const { html: cleanBodyHTML } = sanitizeHtml(sourceDoc)

    let documentForReadability: Document
    try {
      documentForReadability = createReadabilityDocument(
        sourceDoc,
        cleanBodyHTML
      )
    } catch (error) {
      debugLog("Failed to create Readability document, using original:", error)
      documentForReadability = sourceDoc
    }

    debugLog("Readability options:", READABILITY_OPTIONS)

    let article: ReadabilityParseResult | null
    try {
      debugLog("Starting Readability parse")
      const reader = new Readability(
        documentForReadability,
        READABILITY_OPTIONS
      )
      article = reader.parse() as ReadabilityParseResult | null

      debugLog("Readability parse completed:", {
        success: !!article,
        contentLength: article?.content?.length || 0,
        title: article?.title || "N/A"
      })
    } catch (error) {
      debugLog("Readability parse failed:", error)
      return createFailureResult()
    }

    if (!article?.content) {
      debugLog("Readability could not extract content")
      return createFailureResult()
    }

    debugLog("DOMPurify + Readability extraction succeeded:", {
      title: `${article.title?.substring(0, 50)}...`,
      contentLength: article.content.length,
      textLength: article.textContent?.length || 0,
      excerpt: `${article.excerpt?.substring(0, 100)}...`
    })

    logContentStructure(article.content)

    return {
      content: article.content,
      metadata: toMetadata(article),
      success: true
    }
  } catch (error) {
    debugLog("Readability extraction error:", error)
    return createFailureResult()
  }
}
