import type {
  ImageInfo,
  ReadabilityResult,
  ScrapedContent
} from "../constants/types"
import type { ExtractionResult, QualityEvaluation } from "./readability"
import { getScrapeWorker } from "./workers/scrape-worker-client"

function getDefaultDocumentHtml(): string {
  if (typeof document !== "undefined") {
    return document.documentElement?.outerHTML || ""
  }
  return ""
}

function getDefaultBaseUrl(): string | undefined {
  if (typeof document !== "undefined") {
    return document.baseURI
  }
  if (typeof window !== "undefined") {
    return window.location.href
  }
  return undefined
}

export async function convertHtmlToMarkdown(
  html: string,
  baseUrl?: string
): Promise<string> {
  return await getScrapeWorker().convertHtmlToMarkdown(html, baseUrl)
}

export type { ExtractionResult, QualityEvaluation }

export async function extractWithReadability(
  source?: Document | string,
  baseUrl?: string
): Promise<ExtractionResult> {
  let html = ""
  let resolvedBaseUrl = baseUrl

  if (typeof source === "string") {
    html = source
  } else if (source) {
    html = source.documentElement?.outerHTML || ""
    resolvedBaseUrl = resolvedBaseUrl || source.baseURI
  } else {
    html = getDefaultDocumentHtml()
    resolvedBaseUrl = resolvedBaseUrl || getDefaultBaseUrl()
  }

  return await getScrapeWorker().extractWithReadabilityFromHtml(
    html,
    resolvedBaseUrl
  )
}

export async function evaluateContentQuality(
  selectorContent: string,
  readabilityContent: string
): Promise<QualityEvaluation> {
  return await getScrapeWorker().evaluateContentQuality(
    selectorContent,
    readabilityContent
  )
}

export async function extractImagesFromMarkdown(
  markdownContent: string
): Promise<ImageInfo[]> {
  return await getScrapeWorker().extractImagesFromMarkdown(markdownContent)
}

export async function finalizeScrapedContent(
  scrapedContent: ScrapedContent
): Promise<ScrapedContent> {
  return await getScrapeWorker().finalizeScrapedContent(scrapedContent)
}

export function createEmptyReadabilityResult(): ExtractionResult {
  const emptyMeta: ReadabilityResult = {
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

  return {
    content: "",
    metadata: emptyMeta,
    success: false
  }
}
