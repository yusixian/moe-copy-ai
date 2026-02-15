import type {
  ImageInfo,
  ReadabilityResult,
  ScrapedContent
} from "../constants/types"
import type { ExtractionResult } from "./readability/extractor"
import type { QualityEvaluation } from "./readability/quality-core"
import {
  type ReadabilitySource,
  resolveReadabilitySource
} from "./readability/source-resolver"
import { createReadabilityWorkerFacade } from "./readability/worker-facade"

// 组合入口：负责“来源解析 + worker 调度”，不含评分/清理细节。
const workerFacade = createReadabilityWorkerFacade()

export async function convertHtmlToMarkdown(
  html: string,
  baseUrl?: string
): Promise<string> {
  return await workerFacade.convertHtmlToMarkdown(html, baseUrl)
}

export type { ExtractionResult, QualityEvaluation }

export async function extractWithReadability(
  source?: ReadabilitySource,
  baseUrl?: string
): Promise<ExtractionResult> {
  const resolved = resolveReadabilitySource(source, baseUrl)
  return await workerFacade.extractWithReadabilityFromHtml(
    resolved.html,
    resolved.baseUrl
  )
}

export async function evaluateContentQuality(
  selectorContent: string,
  readabilityContent: string
): Promise<QualityEvaluation> {
  return await workerFacade.evaluateContentQuality(
    selectorContent,
    readabilityContent
  )
}

export async function extractImagesFromMarkdown(
  markdownContent: string
): Promise<ImageInfo[]> {
  return await workerFacade.extractImagesFromMarkdown(markdownContent)
}

export async function finalizeScrapedContent(
  scrapedContent: ScrapedContent
): Promise<ScrapedContent> {
  return await workerFacade.finalizeScrapedContent(scrapedContent)
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
