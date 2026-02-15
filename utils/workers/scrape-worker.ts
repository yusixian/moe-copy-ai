import { Readability } from "@mozilla/readability"
import { expose } from "comlink"
import DOMPurify from "dompurify"

import type {
  ImageInfo,
  ReadabilityResult,
  ScrapedContent
} from "../../constants/types"
import {
  convertHtmlToMarkdownCore,
  extractImagesFromMarkdownCore
} from "../readability/markdown-core"
import {
  evaluateContentQualityCore,
  type QualityEvaluation
} from "../readability/quality-core"
import { cleanContent as cleanContentCore } from "../text/clean-content"

export type ExtractionResult = {
  content: string
  metadata: ReadabilityResult
  success: boolean
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

function createFailureResult(): ExtractionResult {
  return { content: "", metadata: EMPTY_METADATA, success: false }
}

function sanitizeHtml(sourceDoc: Document): string {
  const originalHTML = sourceDoc.body?.outerHTML || ""

  try {
    // worker 内部只负责净化，不进行额外结构改写。
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
  // 通过 base 标签固定相对链接解析，降低跨页面差异。
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

const api: ScrapeWorkerApi = {
  async convertHtmlToMarkdown(html: string, baseUrl?: string): Promise<string> {
    // 统一调用 core 实现，避免 worker 与主线程行为分叉。
    return await convertHtmlToMarkdownCore(html, baseUrl)
  },

  async extractWithReadabilityFromHtml(
    html: string,
    baseUrl?: string
  ): Promise<ExtractionResult> {
    try {
      if (!html) return createFailureResult()

      // 在 worker 侧解析 DOM，避免主线程阻塞。
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
        // Readability 只运行一次，失败直接降级。
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
    return evaluateContentQualityCore(selectorContent, readabilityContent)
  },

  async extractImagesFromMarkdown(
    markdownContent: string
  ): Promise<ImageInfo[]> {
    return extractImagesFromMarkdownCore(markdownContent)
  },

  async finalizeScrapedContent(
    scrapedContent: ScrapedContent
  ): Promise<ScrapedContent> {
    const cleanedContent = cleanContentCore(scrapedContent.articleContent)
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
    return cleanContentCore(content)
  }
}

expose(api)
