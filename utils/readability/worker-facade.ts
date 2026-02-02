import { getScrapeWorker } from "../workers/scrape-worker-client"
import type { ImageInfo, ScrapedContent } from "../../constants/types"
import type { ExtractionResult } from "./extractor"
import type { QualityEvaluation } from "./quality-core"

export type ReadabilityWorkerApi = {
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
}

// 单一职责：仅负责 worker 调用细节，避免在此处理来源解析或业务策略。
export function createReadabilityWorkerFacade(): ReadabilityWorkerApi {
  return {
    convertHtmlToMarkdown: (html, baseUrl) =>
      getScrapeWorker().convertHtmlToMarkdown(html, baseUrl),
    extractWithReadabilityFromHtml: (html, baseUrl) =>
      getScrapeWorker().extractWithReadabilityFromHtml(html, baseUrl),
    evaluateContentQuality: (selectorContent, readabilityContent) =>
      getScrapeWorker().evaluateContentQuality(
        selectorContent,
        readabilityContent
      ),
    extractImagesFromMarkdown: (markdownContent) =>
      getScrapeWorker().extractImagesFromMarkdown(markdownContent),
    finalizeScrapedContent: (scrapedContent) =>
      getScrapeWorker().finalizeScrapedContent(scrapedContent)
  }
}
