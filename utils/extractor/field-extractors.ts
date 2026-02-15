import type { SelectorResultItem } from "../../constants/types"
import { debugLog } from "../logger"
import { getSelectors, type SelectorType } from "./selector-storage"

type ExtractResult<K extends string> = {
  [P in K]: string
} & {
  results: SelectorResultItem[]
}

type ElementContentExtractor = (el: Element) => string

const extractors: Record<
  Exclude<SelectorType, "content">,
  ElementContentExtractor
> = {
  title: (el) =>
    el.tagName.toLowerCase() === "meta"
      ? el.getAttribute("content")?.trim() || ""
      : el.textContent?.trim() || "",

  author: (el) =>
    el.tagName.toLowerCase() === "meta"
      ? el.getAttribute("content") || ""
      : el.textContent?.trim() || "",

  date: (el) => {
    const tag = el.tagName.toLowerCase()
    if (tag === "meta") return el.getAttribute("content") || ""
    if (tag === "time")
      return el.getAttribute("datetime") || el.textContent?.trim() || ""
    return el.textContent?.trim() || ""
  }
}

async function extractField<K extends string>(
  type: Exclude<SelectorType, "content">,
  fieldKey: K,
  customSelector?: string
): Promise<ExtractResult<K>> {
  const { selectors } = await getSelectors(type, customSelector)
  const results: SelectorResultItem[] = []
  const extractor = extractors[type]

  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector)
      if (!elements.length) continue

      let firstContent = ""
      const allContent: string[] = []

      for (const element of elements) {
        const content = extractor(element)
        if (content) {
          allContent.push(content)
          if (!firstContent) firstContent = content
        }
      }

      if (firstContent) {
        results.push({ selector, content: firstContent, allContent })
        debugLog(`Extracted ${type} from ${selector}:`, firstContent)
      }
    } catch (error) {
      debugLog(`Error extracting ${type} with selector ${selector}:`, error)
    }
  }

  return {
    [fieldKey]: results[0]?.content || "",
    results
  } as ExtractResult<K>
}

export async function extractTitle(
  customSelector?: string
): Promise<ExtractResult<"title">> {
  return extractField("title", "title", customSelector)
}

export async function extractAuthor(
  customSelector?: string
): Promise<ExtractResult<"author">> {
  return extractField("author", "author", customSelector)
}

export async function extractPublishDate(
  customSelector?: string
): Promise<ExtractResult<"publishDate">> {
  return extractField("date", "publishDate", customSelector)
}
