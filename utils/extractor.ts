import { Storage } from "@plasmohq/storage"

import {
  AUTHOR_SELECTORS,
  CONTENT_SELECTORS,
  DATE_SELECTORS,
  TITLE_SELECTORS
} from "../constants/config"
import type {
  ExtractorOptions,
  ImageInfo,
  ScrapedContent,
  SelectorResultItem,
  SelectorType
} from "../constants/types"
import { debugLog } from "./logger"
import { buildScrapeActions, type SelectorScraper } from "./pipeline/actions"
import { createDebugLogAspect } from "./pipeline/aspects"
import {
  cloneScrapedContent,
  createBaseScrapedContent,
  finalizeScrapedContent,
  getErrorMessage
} from "./pipeline/context"
import type { ScrapePipelineContext } from "./pipeline/scrape-machine"
import { runScrapePipeline } from "./pipeline/scrape-machine"
import {
  convertHtmlToMarkdown,
  extractImagesFromMarkdown
} from "./readability-extractor"

// 存储键
const STORAGE_KEYS = {
  CONTENT: "custom_content_selectors",
  AUTHOR: "custom_author_selectors",
  DATE: "custom_date_selectors",
  TITLE: "custom_title_selectors"
}

// 存储实例
const storage = new Storage({ area: "sync" })

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
    target.push({
      ...image,
      index: indexOffset + image.index
    })
  }
}

async function convertElementToMarkdown(
  element: Element,
  imagesArray: ImageInfo[]
): Promise<string> {
  const html = element.outerHTML || element.innerHTML || ""
  const markdown = await convertHtmlToMarkdown(html, getBaseUrl())
  if (imagesArray.length >= 0) {
    mergeExtractedImages(imagesArray, extractImagesFromMarkdown(markdown))
  }
  return markdown
}

// 获取选择器列表，优先使用自定义选择器，如果不存在则使用默认选择器
async function getSelectors(
  type: keyof typeof STORAGE_KEYS,
  customSelector?: string
): Promise<{ selectors: string[]; selectedSelector?: string }> {
  // 如果提供了自定义选择器，直接使用
  if (customSelector) {
    debugLog(`使用指定的${type}选择器: ${customSelector}`)
    return { selectors: [customSelector], selectedSelector: customSelector }
  }

  try {
    const customSelectors = await storage.get<string[]>(STORAGE_KEYS[type])

    if (customSelectors && customSelectors.length > 0) {
      debugLog(`使用自定义${type}选择器:`, customSelectors)
      return { selectors: customSelectors }
    }
  } catch (error) {
    debugLog(`获取自定义${type}选择器时出错:`, error)
  }

  // 返回默认选择器
  const defaultSelectors = {
    CONTENT: CONTENT_SELECTORS,
    AUTHOR: AUTHOR_SELECTORS,
    DATE: DATE_SELECTORS,
    TITLE: TITLE_SELECTORS
  }

  debugLog(`使用默认${type}选择器`)
  return { selectors: defaultSelectors[type] }
}

// 使用选择器列表抓取内容，并收集所有选择器的结果
async function getContentWithResults(
  selectors: string[],
  getContentFn: (el: Element) => string
): Promise<{ content: string; results: SelectorResultItem[] }> {
  const results: SelectorResultItem[] = []
  let firstContent = ""
  // 首先尝试所有选择器，收集结果
  for (const selector of selectors) {
    const allContent: string[] = []
    try {
      const elements = document.querySelectorAll(selector)
      if (elements?.length) {
        elements.forEach((element) => {
          const content = getContentFn(element)
          // 如果有内容，添加到结果列表
          if (content) {
            allContent.push(content)

            if (!firstContent) firstContent = content
          }
        })
      }
      if (firstContent) {
        results.push({
          selector,
          content: firstContent,
          allContent
        })
      }
      debugLog("firstContent:", firstContent)
    } catch (error) {
      debugLog(`使用选择器 ${selector} 抓取内容时出错:`, error)
    }
  }
  return { content: firstContent, results }
}

// 从选择器列表中获取第一个匹配的内容（为了兼容性保留）
export function getFirstMatchContent(
  selectors: string[],
  getContentFn: (el: Element) => string
): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) {
      const content = getContentFn(element)
      if (content) {
        debugLog(`从${selector}获取内容:`, content)
        return content
      }
    }
  }
  return ""
}

// 增强抓取文章内容的函数
export async function extractArticleContent(
  imagesArray: ImageInfo[] = [],
  customSelector?: string
): Promise<{ content: string; results: SelectorResultItem[] }> {
  const results: SelectorResultItem[] = []

  // 首先检查是否有article标签
  const articleElements = document.querySelectorAll("article")
  if (articleElements.length > 0 && !customSelector) {
    debugLog(`找到了 ${articleElements.length} 个article标签`)

    // 如果有多个article元素，选择最长的那个
    let longestArticle = articleElements[0]
    let maxLength = articleElements[0].textContent?.length || 0

    articleElements.forEach((article, index) => {
      const currentLength = article.textContent?.length || 0
      debugLog(`article [${index}] 内容长度: ${currentLength}`)
      if (currentLength > maxLength) {
        longestArticle = article
        maxLength = currentLength
      }
    })

    debugLog("使用最长的article元素, 长度:", maxLength)
    const content = await convertElementToMarkdown(longestArticle, imagesArray)

    results.push({
      selector: "article (longest)",
      content
    })

    return { content, results }
  }

  // 如果没有article标签或者有自定义选择器，尝试使用选择器
  const { selectors } = await getSelectors("CONTENT", customSelector)

  const contentResults: SelectorResultItem[] = []

  // 尝试所有选择器，收集结果
  for (const selector of selectors) {
    try {
      const contentEl = document.querySelector(selector)
      if (contentEl) {
        debugLog(`找到内容容器: ${selector}`)
        const content = await convertElementToMarkdown(contentEl, imagesArray)

        contentResults.push({
          selector,
          content
        })

        // 如果是指定的选择器或者第一个匹配的选择器，立即返回
        if (customSelector || contentResults.length === 1) {
          return { content, results: contentResults }
        }
      }
    } catch (error) {
      debugLog(`使用选择器 ${selector} 抓取内容时出错:`, error)
    }
  }

  // 如果已经找到内容，返回第一个匹配的结果
  if (contentResults.length > 0) {
    return {
      content: contentResults[0].content,
      results: contentResults
    }
  }

  // 如果仍然没有找到内容，尝试查找带有大量文本的段落集合
  const paragraphs = document.querySelectorAll("p")
  if (paragraphs.length > 3) {
    // 如果有至少3个段落，可能是文章的主体
    debugLog(`使用段落集合: ${paragraphs.length} 个段落`)
    const contentElements = Array.from(paragraphs)
      .filter((p) => (p.textContent?.trim().length || 0) > 30) // 筛选出较长的段落
      .map((p) => p)

    if (contentElements.length > 0) {
      const html = contentElements.map((p) => p.outerHTML).join("\n")
      const content = await convertHtmlToMarkdown(html, getBaseUrl())
      mergeExtractedImages(imagesArray, extractImagesFromMarkdown(content))

      results.push({
        selector: "p (paragraphs collection)",
        content
      })

      return { content, results }
    }
  }

  // 最后的fallback：尝试获取body中的主要文本内容
  debugLog("未找到明确的内容区域，尝试提取body内容")
  const content = await convertElementToMarkdown(document.body, imagesArray)

  results.push({
    selector: "body",
    content
  })

  return { content, results }
}

// 提取页面标题
export async function extractTitle(
  customSelector?: string
): Promise<{ title: string; results: SelectorResultItem[] }> {
  const results: SelectorResultItem[] = []

  // 获取选择器列表
  const { selectors } = await getSelectors("TITLE", customSelector)

  // 尝试所有选择器，收集结果
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector)
      let firstContent = ""
      const allContent: string[] = []
      if (elements.length > 0) {
        for (const element of elements) {
          let content = ""
          // 根据元素类型获取内容
          if (element.tagName.toLowerCase() === "meta") {
            content = element.getAttribute("content")?.trim() || ""
          } else {
            content = element.textContent?.trim() || ""
          }

          if (!firstContent) firstContent = content
          if (content) {
            allContent.push(content)
            // 找到第一个匹配的选择器就返回
          }
        }
      }
      if (firstContent) {
        results.push({
          selector,
          content: firstContent,
          allContent
        })
        debugLog(`从 ${selector} 获取到标题:`, firstContent)
      }
    } catch (error) {
      debugLog(`使用选择器 ${selector} 抓取标题时出错:`, error)
    }
  }

  debugLog(`extractTitle results:`, results)
  return { title: results[0]?.content || "", results }
}

// 提取作者信息
export async function extractAuthor(
  customSelector?: string
): Promise<{ author: string; results: SelectorResultItem[] }> {
  // 获取选择器列表
  const { selectors } = await getSelectors("AUTHOR", customSelector)

  // 抓取并收集结果
  const getAuthorContent = (element: Element) => {
    if (element.tagName.toLowerCase() === "meta") {
      return element.getAttribute("content") || ""
    } else {
      return element.textContent?.trim() || ""
    }
  }

  const { content, results } = await getContentWithResults(
    selectors,
    getAuthorContent
  )
  return { author: content, results }
}

// 提取发布日期
export async function extractPublishDate(
  customSelector?: string
): Promise<{ publishDate: string; results: SelectorResultItem[] }> {
  // 获取选择器列表
  const { selectors } = await getSelectors("DATE", customSelector)

  // 抓取并收集结果
  const getDateContent = (element: Element) => {
    if (element.tagName.toLowerCase() === "meta") {
      return element.getAttribute("content") || ""
    } else if (element.tagName.toLowerCase() === "time") {
      return (
        element.getAttribute("datetime") || element.textContent?.trim() || ""
      )
    } else {
      return element.textContent?.trim() || ""
    }
  }

  const { content, results } = await getContentWithResults(
    selectors,
    getDateContent
  )
  return { publishDate: content, results }
}

// 提取页面元数据
export function extractMetadata(): Record<string, string> {
  const metadata: Record<string, string> = {}
  const metaTags = document.querySelectorAll("meta")

  metaTags.forEach((meta) => {
    const name = meta.getAttribute("name") || meta.getAttribute("property")
    const content = meta.getAttribute("content")
    if (name && content) {
      metadata[name] = content
    }
  })

  debugLog(`抓取了 ${Object.keys(metadata).length} 个元数据标签`)
  // debugLog("元数据:" + JSON.stringify(metadata))
  return metadata
}

// 保留原有的选择器抓取函数作为辅助函数
async function scrapeWithSelectors(
  customSelectors?: Partial<Record<SelectorType, string>>,
  baseContent?: ScrapedContent
): Promise<ScrapedContent> {
  debugLog("使用选择器模式抓取内容")
  if (customSelectors) {
    debugLog("使用自定义选择器:", customSelectors)
  }

  // 创建一个对象存储抓取的内容
  const scrapedContent = baseContent
    ? cloneScrapedContent(baseContent)
    : createBaseScrapedContent()

  // 确保 selectorResults 已初始化
  if (!scrapedContent.selectorResults) {
    scrapedContent.selectorResults = {
      content: [],
      author: [],
      date: [],
      title: []
    }
  }

  // 提取标题
  const { title, results: titleResults } = await extractTitle(
    customSelectors?.title
  )
  scrapedContent.title = title
  scrapedContent.selectorResults.title = titleResults

  // 提取作者信息
  const { author, results: authorResults } = await extractAuthor(
    customSelectors?.author
  )
  scrapedContent.author = author
  scrapedContent.selectorResults.author = authorResults

  // 提取发布日期
  const { publishDate, results: dateResults } = await extractPublishDate(
    customSelectors?.date
  )
  scrapedContent.publishDate = publishDate
  scrapedContent.selectorResults.date = dateResults

  // 提取文章内容
  debugLog("开始抓取文章内容")
  const { content, results: contentResults } = await extractArticleContent(
    scrapedContent.images,
    customSelectors?.content
  )
  scrapedContent.articleContent = content
  scrapedContent.selectorResults.content = contentResults

  // 提取元数据
  scrapedContent.metadata = {
    ...extractMetadata(),
    "extraction:mode": "selector"
  }

  return scrapedContent
}

// 抓取网页内容的主函数 - 支持多种抓取模式
export async function scrapeWebpageContent(
  options?: ExtractorOptions
): Promise<ScrapedContent> {
  const mode = options?.mode ?? "selector"
  const customSelectors = options?.customSelectors
  const readabilityConfig = options?.readabilityConfig

  debugLog("开始抓取网页内容，模式:", mode)
  type PipelineContext = ScrapePipelineContext<ScrapedContent>
  const pipelineAspects = [
    createDebugLogAspect<[PipelineContext], ScrapedContent>(debugLog)
  ]

  const actions = buildScrapeActions({
    customSelectors,
    aspects: pipelineAspects,
    getBaseUrl,
    selectorScraper: scrapeWithSelectors as SelectorScraper
  })

  const pipelineResult = await runScrapePipeline(
    {
      options: {
        mode,
        customSelectors,
        readabilityConfig
      },
      base: createBaseScrapedContent()
    },
    actions
  )

  if (pipelineResult.status === "success" && pipelineResult.result) {
    debugLog("抓取完成，结果概览:", {
      mode,
      title: pipelineResult.result.title,
      url: pipelineResult.result.url,
      author: pipelineResult.result.author,
      publishDate: pipelineResult.result.publishDate,
      contentLength: pipelineResult.result.articleContent.length,
      cleanedContentLength: pipelineResult.result.cleanedContent.length,
      metadataCount: Object.keys(pipelineResult.result.metadata).length,
      imageCount: pipelineResult.result.images.length
    })
    return pipelineResult.result
  }

  debugLog("抓取流程失败，返回空结果:", pipelineResult.error)
  const fallback = finalizeScrapedContent(createBaseScrapedContent())
  fallback.metadata = {
    ...fallback.metadata,
    "extraction:mode": mode,
    "pipeline:error": getErrorMessage(pipelineResult.error)
  }
  return fallback
}

// 为了向后兼容，保留原有函数签名的包装函数
export async function scrapeWebpageContentLegacy(
  customSelectors?: Partial<Record<SelectorType, string>>
): Promise<ScrapedContent> {
  return await scrapeWebpageContent({
    mode: "selector",
    customSelectors
  })
}
