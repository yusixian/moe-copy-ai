import type { ScrapedContent } from "../../constants/types"
import { finalizeScrapedContent as finalizeInWorker } from "../readability-extractor"

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

export async function finalizeScrapedContent(
  scrapedContent: ScrapedContent
): Promise<ScrapedContent> {
  return await finalizeInWorker(scrapedContent)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string") return message
  }
  return "Unknown error"
}
