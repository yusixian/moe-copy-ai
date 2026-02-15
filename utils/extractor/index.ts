import type {
  ExtractorOptions,
  ScrapedContent,
  SelectorType
} from "../../constants/types"
import { debugLog } from "../logger"
import { createDebugLogAspect } from "../pipeline/aspects"
import {
  createBaseScrapedContent,
  finalizeScrapedContent,
  getErrorMessage
} from "../pipeline/content-factory"
import {
  runScrapePipeline,
  type ScrapePipelineContext
} from "../pipeline/machine"
import { buildScrapeActions } from "../pipeline/strategies"
import { extractArticleContent, getBaseUrl } from "./content-extractor"
import {
  extractAuthor,
  extractPublishDate,
  extractTitle
} from "./field-extractors"
import { extractMetadata } from "./metadata"

export { extractArticleContent } from "./content-extractor"
export {
  extractAuthor,
  extractPublishDate,
  extractTitle
} from "./field-extractors"
export { extractMetadata } from "./metadata"
export {
  getSelectors,
  type SelectorConfig,
  type SelectorType
} from "./selector-storage"

export function getFirstMatchContent(
  selectors: string[],
  getContentFn: (el: Element) => string
): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) {
      const content = getContentFn(element)
      if (content) {
        debugLog(`Got content from ${selector}:`, content)
        return content
      }
    }
  }
  return ""
}

async function scrapeWithSelectors(
  customSelectors?: Partial<Record<SelectorType, string>>,
  baseContent?: ScrapedContent
): Promise<ScrapedContent> {
  debugLog("Scraping with selector mode")
  if (customSelectors) {
    debugLog("Using custom selectors:", customSelectors)
  }

  const scrapedContent = baseContent
    ? {
        ...baseContent,
        metadata: { ...baseContent.metadata },
        images: [...baseContent.images]
      }
    : createBaseScrapedContent()

  if (!scrapedContent.selectorResults) {
    scrapedContent.selectorResults = {
      content: [],
      author: [],
      date: [],
      title: []
    }
  }

  const [titleResult, authorResult, dateResult, contentResult] =
    await Promise.all([
      extractTitle(customSelectors?.title),
      extractAuthor(customSelectors?.author),
      extractPublishDate(customSelectors?.date),
      extractArticleContent(scrapedContent.images, customSelectors?.content)
    ])

  scrapedContent.title = titleResult.title
  scrapedContent.selectorResults.title = titleResult.results
  scrapedContent.author = authorResult.author
  scrapedContent.selectorResults.author = authorResult.results
  scrapedContent.publishDate = dateResult.publishDate
  scrapedContent.selectorResults.date = dateResult.results
  scrapedContent.articleContent = contentResult.content
  scrapedContent.selectorResults.content = contentResult.results

  scrapedContent.metadata = {
    ...extractMetadata(),
    "extraction:mode": "selector"
  }

  return scrapedContent
}

export async function scrapeWebpageContent(
  options?: ExtractorOptions
): Promise<ScrapedContent> {
  const mode = options?.mode ?? "selector"
  const customSelectors = options?.customSelectors
  const readabilityConfig = options?.readabilityConfig

  debugLog("Starting webpage scrape, mode:", mode)

  type PipelineContext = ScrapePipelineContext<ScrapedContent>
  const pipelineAspects = [
    createDebugLogAspect<[PipelineContext], ScrapedContent>(debugLog)
  ]

  const actions = buildScrapeActions({
    customSelectors,
    aspects: pipelineAspects,
    getBaseUrl,
    selectorScraper: scrapeWithSelectors
  })

  const pipelineResult = await runScrapePipeline(
    {
      options: { mode, customSelectors, readabilityConfig },
      base: createBaseScrapedContent()
    },
    actions
  )

  if (pipelineResult.status === "success" && pipelineResult.result) {
    debugLog("Scrape completed:", {
      mode,
      title: pipelineResult.result.title,
      url: pipelineResult.result.url,
      contentLength: pipelineResult.result.articleContent.length
    })
    return pipelineResult.result
  }

  debugLog("Pipeline failed, returning fallback:", pipelineResult.error)
  const fallback = await finalizeScrapedContent(createBaseScrapedContent())
  fallback.metadata = {
    ...fallback.metadata,
    "extraction:mode": mode,
    "pipeline:error": getErrorMessage(pipelineResult.error)
  }
  return fallback
}

export async function scrapeWebpageContentLegacy(
  customSelectors?: Partial<Record<SelectorType, string>>
): Promise<ScrapedContent> {
  return await scrapeWebpageContent({
    mode: "selector",
    customSelectors
  })
}
