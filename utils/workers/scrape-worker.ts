import { Readability } from "@mozilla/readability"
import { expose } from "comlink"
import DOMPurify from "dompurify"

import type {
  ImageInfo,
  ReadabilityResult,
  ScrapedContent
} from "../../constants/types"
import { parseHtmlToMarkdown } from "../../parser"

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

export type ScrapeWorkerApi = {
  convertHtmlToMarkdown: (html: string, baseUrl?: string) => Promise<string>
  extractWithReadabilityFromHtml: (
    html: string,
    baseUrl?: string
  ) => Promise<ExtractionResult>
  evaluateContentQuality: (
    selectorContent: string,
    readabilityContent: string
  ) => Promise<QualityEvaluation>
  extractImagesFromMarkdown: (markdownContent: string) => Promise<ImageInfo[]>
  finalizeScrapedContent: (
    scrapedContent: ScrapedContent
  ) => Promise<ScrapedContent>
  cleanContent: (content: string) => Promise<string>
}

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

const SCORE_THRESHOLD = 10

function createFailureResult(): ExtractionResult {
  return { content: "", metadata: EMPTY_METADATA, success: false }
}

function sanitizeHtml(sourceDoc: Document): string {
  const originalHTML = sourceDoc.body?.outerHTML || ""

  try {
    return DOMPurify.sanitize(originalHTML, DOMPURIFY_CONFIG) as string
  } catch {
    return originalHTML
  }
}

function createDocumentForReadability(
  sourceDoc: Document,
  cleanBodyHTML: string,
  baseUrl?: string
): Document {
  const baseTag = baseUrl ? `<base href="${baseUrl}">` : ""

  const fullHTML = `<!DOCTYPE html>
<html lang="${sourceDoc.documentElement.lang || "en"}">
<head>
  <title>${sourceDoc.title || ""}</title>
  <meta charset="utf-8">
  ${baseTag}
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

  if (length > 1000) score += 40
  else if (length > 500) score += 30
  else if (length > 200) score += 20
  else score += 10

  if (paragraphs > 5) score += 20
  else if (paragraphs > 2) score += 15
  else score += 5

  if (headings > 2) score += 20
  else if (headings > 0) score += 10

  if (htmlTagRatio < 1) score += 20
  else if (htmlTagRatio < 3) score += 10

  return Math.min(score, 100)
}

function cleanContentInternal(content: string): string {
  if (!content) return ""

  const codeBlocks: string[] = []
  let tempContent = content

  const codeBlockRegex = /```[\s\S]*?```/g
  let match: RegExpExecArray | null = codeBlockRegex.exec(content)
  let index = 0

  while (match !== null) {
    const placeholder = `__CODE_BLOCK_${index}__`
    tempContent = tempContent.replace(match[0], placeholder)
    codeBlocks.push(match[0])
    index++
    match = codeBlockRegex.exec(content)
  }

  tempContent = tempContent
    .replace(/\n+/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\s*-\s*/g, "-")
    .replace(/\(\s+|\s+\)/g, (m) => m.replace(/\s+/g, ""))
    .replace(/\s+"|"\s+/g, '"')
    .replace(/\s*\[\s*|\s*\]\s*/g, (m) => m.replace(/\s+/g, ""))
    .replace(/\s*\{\s*|\s*\}\s*/g, (m) => m.replace(/\s+/g, ""))
    .replace(/([.!?:;]) +/g, "$1 ")

  tempContent = tempContent.replace(/# +/g, "# ")
  tempContent = tempContent.replace(/## +/g, "## ")
  tempContent = tempContent.replace(/### +/g, "### ")
  tempContent = tempContent.replace(/#### +/g, "#### ")
  tempContent = tempContent.replace(/##### +/g, "##### ")
  tempContent = tempContent.replace(/###### +/g, "###### ")

  for (let i = 0; i < codeBlocks.length; i++) {
    tempContent = tempContent.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i])
  }

  return tempContent
}

const api: ScrapeWorkerApi = {
  async convertHtmlToMarkdown(html: string, baseUrl?: string): Promise<string> {
    if (!html) return ""

    try {
      const markdown = await parseHtmlToMarkdown(html, { baseUrl })
      return markdown.replace(/\n{3,}/g, "\n\n").trim()
    } catch {
      return html
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    }
  },

  async extractWithReadabilityFromHtml(
    html: string,
    baseUrl?: string
  ): Promise<ExtractionResult> {
    try {
      if (!html) return createFailureResult()

      const parser = new DOMParser()
      const sourceDoc = parser.parseFromString(html, "text/html")

      const cleanBodyHTML = sanitizeHtml(sourceDoc)

      let docForReadability: Document
      try {
        docForReadability = createDocumentForReadability(
          sourceDoc,
          cleanBodyHTML,
          baseUrl
        )
      } catch {
        docForReadability = sourceDoc
      }

      let article: ParsedArticle | null
      try {
        const reader = new Readability(docForReadability, READABILITY_OPTIONS)
        article = reader.parse() as ParsedArticle | null
      } catch {
        return createFailureResult()
      }

      if (!article?.content) {
        return createFailureResult()
      }

      return {
        content: article.content,
        metadata: toMetadata(article),
        success: true
      }
    } catch {
      return createFailureResult()
    }
  },

  async evaluateContentQuality(
    selectorContent: string,
    readabilityContent: string
  ): Promise<QualityEvaluation> {
    const selectorScore = calculateScore(selectorContent)
    const readabilityScore = calculateScore(readabilityContent)
    const scores = { selector: selectorScore, readability: readabilityScore }

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
  },

  async extractImagesFromMarkdown(
    markdownContent: string
  ): Promise<ImageInfo[]> {
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
  },

  async finalizeScrapedContent(
    scrapedContent: ScrapedContent
  ): Promise<ScrapedContent> {
    const cleanedContent = cleanContentInternal(scrapedContent.articleContent)
    const images =
      scrapedContent.images.length > 0
        ? scrapedContent.images
        : await api.extractImagesFromMarkdown(scrapedContent.articleContent)

    return {
      ...scrapedContent,
      cleanedContent,
      images
    }
  },

  async cleanContent(content: string): Promise<string> {
    return cleanContentInternal(content)
  }
}

expose(api)
