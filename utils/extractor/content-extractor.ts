import type { ImageInfo, SelectorResultItem } from "../../constants/types"
import { debugLog } from "../logger"
import {
  convertHtmlToMarkdown,
  extractImagesFromMarkdown
} from "../readability-extractor"
import { getSelectors } from "./selector-storage"

type ContentResult = {
  content: string
  results: SelectorResultItem[]
}

function getBaseUrl(): string | undefined {
  if (typeof document !== "undefined" && document.baseURI) {
    return document.baseURI
  }
  if (typeof window !== "undefined") {
    return window.location.href
  }
  return undefined
}

function mergeExtractedImages(
  target: ImageInfo[],
  extracted: ImageInfo[]
): void {
  const indexOffset = target.length
  for (const image of extracted) {
    target.push({ ...image, index: indexOffset + image.index })
  }
}

async function convertElementToMarkdown(
  element: Element,
  imagesArray: ImageInfo[]
): Promise<string> {
  const html = element.outerHTML || element.innerHTML || ""
  const markdown = await convertHtmlToMarkdown(html, getBaseUrl())
  mergeExtractedImages(imagesArray, extractImagesFromMarkdown(markdown))
  return markdown
}

type ContentStrategy = (
  imagesArray: ImageInfo[],
  customSelector?: string
) => Promise<ContentResult | null>

const articleStrategy: ContentStrategy = async (imagesArray) => {
  const articleElements = document.querySelectorAll("article")
  if (!articleElements.length) return null

  debugLog(`Found ${articleElements.length} article tags`)

  let longestArticle = articleElements[0]
  let maxLength = articleElements[0].textContent?.length || 0

  articleElements.forEach((article, index) => {
    const currentLength = article.textContent?.length || 0
    debugLog(`article [${index}] content length: ${currentLength}`)
    if (currentLength > maxLength) {
      longestArticle = article
      maxLength = currentLength
    }
  })

  debugLog("Using longest article element, length:", maxLength)
  const content = await convertElementToMarkdown(longestArticle, imagesArray)

  return {
    content,
    results: [{ selector: "article (longest)", content }]
  }
}

const selectorStrategy: ContentStrategy = async (
  imagesArray,
  customSelector
) => {
  const { selectors } = await getSelectors("content", customSelector)
  const results: SelectorResultItem[] = []

  for (const selector of selectors) {
    try {
      const contentEl = document.querySelector(selector)
      if (!contentEl) continue

      debugLog(`Found content container: ${selector}`)
      const content = await convertElementToMarkdown(contentEl, imagesArray)
      results.push({ selector, content })

      if (customSelector || results.length === 1) {
        return { content, results }
      }
    } catch (error) {
      debugLog(`Error extracting content with selector ${selector}:`, error)
    }
  }

  return results.length ? { content: results[0].content, results } : null
}

const paragraphStrategy: ContentStrategy = async (imagesArray) => {
  const paragraphs = document.querySelectorAll("p")
  if (paragraphs.length <= 3) return null

  debugLog(`Using paragraph collection: ${paragraphs.length} paragraphs`)
  const contentElements = Array.from(paragraphs).filter(
    (p) => (p.textContent?.trim().length || 0) > 30
  )

  if (!contentElements.length) return null

  const html = contentElements.map((p) => p.outerHTML).join("\n")
  const content = await convertHtmlToMarkdown(html, getBaseUrl())
  mergeExtractedImages(imagesArray, extractImagesFromMarkdown(content))

  return {
    content,
    results: [{ selector: "p (paragraphs collection)", content }]
  }
}

const bodyFallbackStrategy: ContentStrategy = async (imagesArray) => {
  debugLog("No clear content area found, extracting body content")
  const content = await convertElementToMarkdown(document.body, imagesArray)

  return {
    content,
    results: [{ selector: "body", content }]
  }
}

export async function extractArticleContent(
  imagesArray: ImageInfo[] = [],
  customSelector?: string
): Promise<ContentResult> {
  const strategies: ContentStrategy[] = customSelector
    ? [selectorStrategy]
    : [
        articleStrategy,
        selectorStrategy,
        paragraphStrategy,
        bodyFallbackStrategy
      ]

  for (const strategy of strategies) {
    const result = await strategy(imagesArray, customSelector)
    if (result) return result
  }

  return { content: "", results: [] }
}

export { getBaseUrl }
