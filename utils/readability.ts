/**
 * Readability Content Extractor - Deep Module
 *
 * Design philosophy (A Philosophy of Software Design):
 * - Single module for web content extraction
 * - Hides DOMPurify, Readability.js, and conversion complexity
 * - Simple interface: extract() returns structured content
 */

import { Readability } from "@mozilla/readability"
import DOMPurify from "dompurify"

import type { ImageInfo, ReadabilityResult } from "../constants/types"
import { parse as parseHtml } from "../parser"
import { debugLog } from "./logger"

// ============================================================================
// Types
// ============================================================================

export type ExtractionResult = {
  content: string
  metadata: ReadabilityResult
  success: boolean
}

export type QualityEvaluation = {
  betterContent: string
  reason: string
  scores: { selector: number; readability: number }
}

// ============================================================================
// Configuration (internal)
// ============================================================================

const DOMPURIFY_CONFIG: DOMPurify.Config = {
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  ADD_TAGS: [
    "article",
    "section",
    "aside",
    "nav",
    "header",
    "footer",
    "main",
    "time"
  ],
  ADD_ATTR: ["datetime", "pubdate", "itemscope", "itemtype", "itemprop"],
  ALLOW_DATA_ATTR: true,
  KEEP_CONTENT: true,
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
  FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover", "style"],
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: (tagName) => !tagName.toLowerCase().includes("plasmo"),
    attributeNameCheck: (attr) => !attr.toLowerCase().includes("plasmo")
  }
}

const READABILITY_OPTIONS = {
  charThreshold: 0,
  maxElemsToParse: 0,
  nbTopCandidates: 50,
  keepClasses: true,
  classesToPreserve: [
    "newsletter",
    "newsletter-section",
    "newsletter-article",
    "newsletter-header",
    "article-title",
    "section-title",
    "content",
    "article",
    "main",
    "box"
  ]
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

// ============================================================================
// Internal Helpers
// ============================================================================

function createFailureResult(): ExtractionResult {
  return { content: "", metadata: EMPTY_METADATA, success: false }
}

function sanitizeHtml(sourceDoc: Document): string {
  const originalHTML = sourceDoc.body?.outerHTML || ""

  try {
    const cleanedHTML = DOMPurify.sanitize(
      originalHTML,
      DOMPURIFY_CONFIG
    ) as string
    debugLog("DOMPurify completed:", {
      original: originalHTML.length,
      cleaned: cleanedHTML.length
    })
    return cleanedHTML
  } catch (error) {
    debugLog("DOMPurify failed:", error)
    return originalHTML
  }
}

function createDocumentForReadability(
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

  return doc
}

interface ParsedArticle {
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

function toMetadata(article: ParsedArticle): ReadabilityResult {
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

// ============================================================================
// Quality Scoring (internal)
// ============================================================================

const SCORE_THRESHOLD = 10

function calculateScore(content: string): number {
  if (!content) return 0

  const length = content.length
  const paragraphs = content
    .split("\n\n")
    .filter((p) => p.trim().length > 20).length
  const headings = (content.match(/^#+\s/gm) || []).length
  const htmlTagCount = (content.match(/<[^>]+>/g) || []).length
  const htmlTagRatio = length > 0 ? htmlTagCount / (length / 100) : 0

  let score = 0

  // Length (0-40)
  if (length > 1000) score += 40
  else if (length > 500) score += 30
  else if (length > 200) score += 20
  else score += 10

  // Paragraphs (0-20)
  if (paragraphs > 5) score += 20
  else if (paragraphs > 2) score += 15
  else score += 5

  // Headings (0-20)
  if (headings > 2) score += 20
  else if (headings > 0) score += 10

  // HTML density - lower is better (0-20)
  if (htmlTagRatio < 1) score += 20
  else if (htmlTagRatio < 3) score += 10

  return Math.min(score, 100)
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Extract content from a web page using Readability.js
 *
 * @param extractionDocument - Optional document to extract from (defaults to current page)
 * @returns Extraction result with content, metadata, and success flag
 */
export async function extractWithReadability(
  extractionDocument?: Document
): Promise<ExtractionResult> {
  try {
    debugLog("Starting Readability extraction")

    const sourceDoc = extractionDocument || document

    if (!extractionDocument) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    const cleanBodyHTML = sanitizeHtml(sourceDoc)

    let docForReadability: Document
    try {
      docForReadability = createDocumentForReadability(sourceDoc, cleanBodyHTML)
    } catch {
      docForReadability = sourceDoc
    }

    let article: ParsedArticle | null
    try {
      const reader = new Readability(docForReadability, READABILITY_OPTIONS)
      article = reader.parse() as ParsedArticle | null
    } catch (error) {
      debugLog("Readability parse failed:", error)
      return createFailureResult()
    }

    if (!article?.content) {
      debugLog("Readability returned no content")
      return createFailureResult()
    }

    debugLog("Readability extraction succeeded:", {
      title: article.title?.substring(0, 50),
      contentLength: article.content.length
    })

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

/**
 * Convert HTML to Markdown
 *
 * @param htmlContent - HTML string to convert
 * @param baseUrl - Optional base URL for resolving relative links
 * @returns Markdown string
 */
export async function convertHtmlToMarkdown(
  htmlContent: string,
  baseUrl?: string
): Promise<string> {
  if (!htmlContent) return ""

  try {
    const markdown = await parseHtml(htmlContent, baseUrl)
    return markdown.replace(/\n{3,}/g, "\n\n").trim()
  } catch (error) {
    debugLog("Markdown conversion failed:", error)
    return htmlContent
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }
}

/**
 * Evaluate and compare content quality between two extraction methods
 *
 * @param selectorContent - Content from selector-based extraction
 * @param readabilityContent - Content from Readability extraction
 * @returns Evaluation result with better content and reasoning
 */
export function evaluateContentQuality(
  selectorContent: string,
  readabilityContent: string
): QualityEvaluation {
  const selectorScore = calculateScore(selectorContent)
  const readabilityScore = calculateScore(readabilityContent)
  const scores = { selector: selectorScore, readability: readabilityScore }

  debugLog("Quality scores:", scores)

  if (readabilityScore > selectorScore + SCORE_THRESHOLD) {
    return {
      betterContent: readabilityContent,
      reason: `Readability higher (${readabilityScore} vs ${selectorScore})`,
      scores
    }
  }

  if (selectorScore > readabilityScore + SCORE_THRESHOLD) {
    return {
      betterContent: selectorContent,
      reason: `Selector higher (${selectorScore} vs ${readabilityScore})`,
      scores
    }
  }

  return {
    betterContent:
      readabilityContent.length > selectorContent.length
        ? readabilityContent
        : selectorContent,
    reason: "Scores similar, choosing longer content",
    scores
  }
}

/**
 * Extract image information from Markdown content
 *
 * @param markdownContent - Markdown string to parse
 * @returns Array of image info objects
 */
export function extractImagesFromMarkdown(
  markdownContent: string
): ImageInfo[] {
  const images: ImageInfo[] = []
  const regex = /!\[([^\]]*)\]\(([^)]+)\)/g

  let index = 0

  while (true) {
    const match = regex.exec(markdownContent)
    if (!match) break
    images.push({
      src: match[2],
      alt: match[1] || `Image#${index}`,
      title: "",
      index
    })
    index++
  }

  return images
}
