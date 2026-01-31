import type { ScrapedContent } from "../../constants/types"
import { cleanContent } from "../formatter"
import { extractImagesFromMarkdown } from "../readability-extractor"

export function createBaseScrapedContent(currentUrl?: string): ScrapedContent {
  return {
    title: "",
    url:
      currentUrl || (typeof window !== "undefined" ? window.location.href : ""),
    articleContent: "",
    cleanedContent: "",
    author: "",
    publishDate: "",
    metadata: {},
    images: [],
    selectorResults: {
      content: [],
      author: [],
      date: [],
      title: []
    }
  }
}

export function cloneScrapedContent(base: ScrapedContent): ScrapedContent {
  return {
    ...base,
    metadata: { ...base.metadata },
    images: [...base.images],
    selectorResults: base.selectorResults
      ? {
          content: [...base.selectorResults.content],
          author: [...base.selectorResults.author],
          date: [...base.selectorResults.date],
          title: [...base.selectorResults.title]
        }
      : {
          content: [],
          author: [],
          date: [],
          title: []
        }
  }
}

export function finalizeScrapedContent(
  scrapedContent: ScrapedContent
): ScrapedContent {
  const cleanedContent = cleanContent(scrapedContent.articleContent)
  const images =
    scrapedContent.images.length > 0
      ? scrapedContent.images
      : extractImagesFromMarkdown(scrapedContent.articleContent)

  return {
    ...scrapedContent,
    cleanedContent,
    images
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string") return message
  }
  return "未知错误"
}
