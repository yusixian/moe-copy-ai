import type { ScrapedContent, SelectorType } from "../../constants/types"
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

export function buildScrapeActions({
  customSelectors,
  aspects,
  getBaseUrl,
  selectorScraper
}: BuildActionsParams): ScrapePipelineActions<ScrapedContent> {
  const selectorAction = withAspects<[PipelineContext], ScrapedContent>(
    "selector",
    async (context) => {
      debugLog("使用选择器模式")
      return await selectorScraper(
        customSelectors,
        cloneScrapedContent(context.base)
      )
    },
    aspects,
    (context) => ({ mode: context.options.mode })
  )

  const readabilityAction = withAspects<[PipelineContext], ScrapedContent>(
    "readability",
    async (context) => {
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
        "readability:siteName": readabilityResult.metadata.siteName || "",
        "readability:excerpt": readabilityResult.metadata.excerpt || "",
        "readability:lang": readabilityResult.metadata.lang || "",
        "readability:length": readabilityResult.metadata.length.toString()
      }

      return scrapedContent
    },
    aspects,
    (context) => ({ mode: context.options.mode })
  )

  const hybridAction = withAspects<[PipelineContext], ScrapedContent>(
    "hybrid",
    async (context) => {
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

      if (
        evaluation.betterContent === readabilityContent ||
        !selectorResult.title
      ) {
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
        "readability:siteName": readabilityResult.metadata.siteName || "",
        "readability:excerpt": readabilityResult.metadata.excerpt || "",
        "readability:lang": readabilityResult.metadata.lang || "",
        "readability:length": readabilityResult.metadata.length.toString(),
        "evaluation:reason": evaluation.reason,
        "evaluation:selectorScore": evaluation.scores.selector.toString(),
        "evaluation:readabilityScore": evaluation.scores.readability.toString()
      }

      return scrapedContent
    },
    aspects,
    (context) => ({ mode: context.options.mode })
  )

  const readabilityFallbackAction = withAspects<
    [PipelineContext],
    ScrapedContent
  >(
    "readability-fallback",
    async (context) => {
      const fallbackResult = await selectorScraper(
        customSelectors,
        cloneScrapedContent(context.base)
      )
      const errorMessage = getErrorMessage(context.error)
      fallbackResult.metadata = {
        ...fallbackResult.metadata,
        "original:mode": "readability",
        "fallback:reason":
          errorMessage === "Readability解析失败"
            ? "Readability解析失败，自动切换到选择器模式"
            : `Readability解析异常(${errorMessage})，自动切换到选择器模式`
      }
      return fallbackResult
    },
    aspects,
    (context) => ({ mode: context.options.mode, fallbackFrom: "readability" })
  )

  const hybridFallbackAction = withAspects<[PipelineContext], ScrapedContent>(
    "hybrid-fallback",
    async (context) => {
      const fallbackResult = await selectorScraper(
        customSelectors,
        cloneScrapedContent(context.base)
      )
      const errorMessage = getErrorMessage(context.error)
      fallbackResult.metadata = {
        ...fallbackResult.metadata,
        "original:mode": "hybrid",
        "fallback:reason":
          errorMessage === "Readability解析失败"
            ? "混合模式中Readability解析失败，自动使用选择器模式结果"
            : `混合模式执行异常(${errorMessage})，自动切换到选择器模式`
      }
      return fallbackResult
    },
    aspects,
    (context) => ({ mode: context.options.mode, fallbackFrom: "hybrid" })
  )

  const finalizeAction = withAspects<[PipelineContext], ScrapedContent>(
    "finalize",
    async (context) => {
      const result = context.result
        ? cloneScrapedContent(context.result)
        : cloneScrapedContent(context.base)
      return finalizeScrapedContent(result)
    },
    aspects,
    (context) => ({ mode: context.options.mode })
  )

  return {
    selector: selectorAction,
    readability: readabilityAction,
    hybrid: hybridAction,
    selectorFallbackFromReadability: readabilityFallbackAction,
    selectorFallbackFromHybrid: hybridFallbackAction,
    finalize: finalizeAction
  }
}
