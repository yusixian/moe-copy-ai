import type {
  ReadabilityResult,
  ScrapedContent,
  SelectorType
} from "../../constants/types"
import { debugLog } from "../logger"
import {
  convertHtmlToMarkdown,
  evaluateContentQuality,
  extractWithReadability
} from "../readability-extractor"
import type { PipelineAspect } from "./aspects"
import { withAspects } from "./aspects"
import {
  cloneScrapedContent,
  finalizeScrapedContent,
  getErrorMessage
} from "./content-factory"
import type { ScrapePipelineActions, ScrapePipelineContext } from "./machine"

export type SelectorScraper = (
  customSelectors?: Partial<Record<SelectorType, string>>,
  baseContent?: ScrapedContent
) => Promise<ScrapedContent>

type BuildActionsParams = {
  customSelectors?: Partial<Record<SelectorType, string>>
  aspects: Array<PipelineAspect<[ScrapePipelineContext], ScrapedContent>>
  getBaseUrl: () => string | undefined
  selectorScraper: SelectorScraper
}

function buildReadabilityMetadata(
  metadata: ReadabilityResult
): Record<string, string> {
  return {
    "readability:siteName": metadata.siteName || "",
    "readability:excerpt": metadata.excerpt || "",
    "readability:lang": metadata.lang || "",
    "readability:length": metadata.length.toString()
  }
}

function createAction(
  name: string,
  fn: (ctx: ScrapePipelineContext) => Promise<ScrapedContent>,
  aspects: Array<PipelineAspect<[ScrapePipelineContext], ScrapedContent>>,
  metadataFactory: (ctx: ScrapePipelineContext) => Record<string, unknown>
) {
  return withAspects(name, fn, aspects, metadataFactory)
}

export function buildScrapeActions({
  customSelectors,
  aspects,
  getBaseUrl,
  selectorScraper
}: BuildActionsParams): ScrapePipelineActions {
  const getMetadata = (ctx: ScrapePipelineContext) => ({
    mode: ctx.options.mode
  })

  const selector = createAction(
    "selector",
    async (context) => {
      debugLog("Using selector mode")
      return await selectorScraper(
        customSelectors,
        cloneScrapedContent(context.base)
      )
    },
    aspects,
    getMetadata
  )

  const readability = createAction(
    "readability",
    async (context) => {
      debugLog("Using readability mode")
      const readabilityResult = await extractWithReadability()
      if (!readabilityResult.success) {
        throw new Error("Readability parsing failed")
      }

      const scrapedContent = cloneScrapedContent(context.base)
      scrapedContent.articleContent = await convertHtmlToMarkdown(
        readabilityResult.content,
        getBaseUrl()
      )
      scrapedContent.title = readabilityResult.metadata.title || ""
      scrapedContent.author = readabilityResult.metadata.byline || ""
      scrapedContent.publishDate =
        readabilityResult.metadata.publishedTime || ""
      scrapedContent.metadata = {
        ...scrapedContent.metadata,
        "extraction:mode": "readability",
        ...buildReadabilityMetadata(readabilityResult.metadata)
      }

      return scrapedContent
    },
    aspects,
    getMetadata
  )

  const hybrid = createAction(
    "hybrid",
    async (context) => {
      debugLog("Using hybrid mode")
      const selectorResult = await selectorScraper(
        customSelectors,
        cloneScrapedContent(context.base)
      )

      const readabilityResult = await extractWithReadability()
      if (!readabilityResult.success) {
        throw new Error("Readability parsing failed")
      }

      const readabilityContent = await convertHtmlToMarkdown(
        readabilityResult.content,
        getBaseUrl()
      )
      const evaluation = evaluateContentQuality(
        selectorResult.articleContent,
        readabilityContent
      )

      debugLog("Hybrid mode content evaluation:", evaluation.reason)

      const scrapedContent = cloneScrapedContent(context.base)
      scrapedContent.articleContent = evaluation.betterContent

      const useReadabilityMeta =
        evaluation.betterContent === readabilityContent || !selectorResult.title
      if (useReadabilityMeta) {
        scrapedContent.title =
          readabilityResult.metadata.title || selectorResult.title
        scrapedContent.author =
          readabilityResult.metadata.byline || selectorResult.author
        scrapedContent.publishDate =
          readabilityResult.metadata.publishedTime || selectorResult.publishDate
      } else {
        scrapedContent.title = selectorResult.title
        scrapedContent.author = selectorResult.author
        scrapedContent.publishDate = selectorResult.publishDate
      }

      scrapedContent.selectorResults = selectorResult.selectorResults
      scrapedContent.images = selectorResult.images
      scrapedContent.metadata = {
        ...selectorResult.metadata,
        "extraction:mode": "hybrid",
        ...buildReadabilityMetadata(readabilityResult.metadata),
        "evaluation:reason": evaluation.reason,
        "evaluation:selectorScore": evaluation.scores.selector.toString(),
        "evaluation:readabilityScore": evaluation.scores.readability.toString()
      }

      return scrapedContent
    },
    aspects,
    getMetadata
  )

  const selectorFallback = createAction(
    "selector-fallback",
    async (context) => {
      const originalMode = context.options.mode
      const fallbackResult = await selectorScraper(
        customSelectors,
        cloneScrapedContent(context.base)
      )
      const errorMessage = getErrorMessage(context.error)
      const isReadabilityError = errorMessage === "Readability parsing failed"

      const modeLabel = originalMode === "hybrid" ? "in hybrid mode " : ""
      fallbackResult.metadata = {
        ...fallbackResult.metadata,
        "original:mode": originalMode,
        "fallback:reason": isReadabilityError
          ? `${modeLabel}Readability parsing failed, auto-switched to selector mode`
          : `${modeLabel}Execution error (${errorMessage}), auto-switched to selector mode`
      }
      return fallbackResult
    },
    aspects,
    (ctx) => ({ mode: ctx.options.mode, fallbackFrom: ctx.options.mode })
  )

  const finalize = createAction(
    "finalize",
    async (context) => {
      const result = context.result ?? context.base
      return finalizeScrapedContent(cloneScrapedContent(result))
    },
    aspects,
    getMetadata
  )

  return { selector, readability, hybrid, selectorFallback, finalize }
}
