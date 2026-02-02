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
} from "./context"
import type {
  ScrapePipelineActions,
  ScrapePipelineContext
} from "./scrape-machine"

export type SelectorScraper = (
  customSelectors?: Partial<Record<SelectorType, string>>,
  baseContent?: ScrapedContent
) => Promise<ScrapedContent>

type BuildActionsParams = {
  customSelectors?: Partial<Record<SelectorType, string>>
  aspects: Array<
    PipelineAspect<[ScrapePipelineContext<ScrapedContent>], ScrapedContent>
  >
  getBaseUrl: () => string | undefined
  selectorScraper: SelectorScraper
}

type PipelineContext = ScrapePipelineContext<ScrapedContent>

// Extract common readability metadata to reduce duplication
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

// Helper to create aspect-wrapped actions with common pattern
function createAction<TArgs extends unknown[]>(
  name: string,
  fn: (...args: TArgs) => Promise<ScrapedContent>,
  aspects: Array<PipelineAspect<TArgs, ScrapedContent>>,
  metadataFactory: (...args: TArgs) => Record<string, unknown>
) {
  return withAspects(name, fn, aspects, metadataFactory)
}

export function buildScrapeActions({
  customSelectors,
  aspects,
  getBaseUrl,
  selectorScraper
}: BuildActionsParams): ScrapePipelineActions<ScrapedContent> {
  const getMetadata = (ctx: PipelineContext) => ({ mode: ctx.options.mode })

  const selector = createAction(
    "selector",
    async (context: PipelineContext) => {
      debugLog("使用选择器模式")
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
    async (context: PipelineContext) => {
      debugLog("使用 Readability 模式")
      const readabilityResult = await extractWithReadability()
      if (!readabilityResult.success) {
        throw new Error("Readability解析失败")
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
    async (context: PipelineContext) => {
      debugLog("使用混合模式")
      const selectorResult = await selectorScraper(
        customSelectors,
        cloneScrapedContent(context.base)
      )

      const readabilityResult = await extractWithReadability()
      if (!readabilityResult.success) {
        throw new Error("Readability解析失败")
      }

      const readabilityContent = await convertHtmlToMarkdown(
        readabilityResult.content,
        getBaseUrl()
      )
      const evaluation = evaluateContentQuality(
        selectorResult.articleContent,
        readabilityContent
      )

      debugLog("混合模式内容评估:", evaluation.reason)

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

  // Unified fallback action - replaces separate readability/hybrid fallback
  const selectorFallback = createAction(
    "selector-fallback",
    async (context: PipelineContext) => {
      const originalMode = context.options.mode
      const fallbackResult = await selectorScraper(
        customSelectors,
        cloneScrapedContent(context.base)
      )
      const errorMessage = getErrorMessage(context.error)
      const isReadabilityError = errorMessage === "Readability解析失败"

      const modeLabel = originalMode === "hybrid" ? "混合模式中" : ""
      fallbackResult.metadata = {
        ...fallbackResult.metadata,
        "original:mode": originalMode,
        "fallback:reason": isReadabilityError
          ? `${modeLabel}Readability解析失败，自动切换到选择器模式`
          : `${modeLabel}执行异常(${errorMessage})，自动切换到选择器模式`
      }
      return fallbackResult
    },
    aspects,
    (ctx) => ({ mode: ctx.options.mode, fallbackFrom: ctx.options.mode })
  )

  const finalize = createAction(
    "finalize",
    async (context: PipelineContext) => {
      const result = context.result ?? context.base
      return finalizeScrapedContent(cloneScrapedContent(result))
    },
    aspects,
    getMetadata
  )

  return { selector, readability, hybrid, selectorFallback, finalize }
}
