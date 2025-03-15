import { Storage } from "@plasmohq/storage"

import {
  AUTHOR_SELECTORS,
  CONTENT_SELECTORS,
  DATE_SELECTORS,
  TITLE_SELECTORS
} from "../constants/config"
import type {
  ImageInfo,
  ScrapedContent,
  SelectorResultItem,
  SelectorType
} from "../constants/types"
import { cleanContent, extractFormattedText } from "./formatter"
import { debugLog } from "./logger"

// 存储键
const STORAGE_KEYS = {
  CONTENT: "custom_content_selectors",
  AUTHOR: "custom_author_selectors",
  DATE: "custom_date_selectors",
  TITLE: "custom_title_selectors"
}

// 存储实例
const storage = new Storage({ area: "sync" })

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
  type: SelectorType,
  selectors: string[],
  getContentFn: (el: Element) => string
): Promise<{ content: string; results: SelectorResultItem[] }> {
  const results: SelectorResultItem[] = []
  let selectedContent = ""

  // 首先尝试所有选择器，收集结果
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector)
      if (elements.length > 0) {
        const element = elements[0]
        const content = getContentFn(element)

        // 如果有内容，添加到结果列表
        if (content) {
          results.push({
            selector,
            content
          })

          // 如果还没有选择内容，使用第一个匹配的内容
          if (!selectedContent) {
            selectedContent = content
            debugLog(`从${selector}获取${type}内容:`, content)
          }
        }
      }
    } catch (error) {
      debugLog(`使用选择器 ${selector} 抓取内容时出错:`, error)
    }
  }

  return { content: selectedContent, results }
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
    const content = extractFormattedText(longestArticle, imagesArray)

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
        const content = extractFormattedText(contentEl, imagesArray)

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
    const contentArray = Array.from(paragraphs)
      .filter((p) => (p.textContent?.trim().length || 0) > 30) // 筛选出较长的段落
      .map((p) => p.textContent?.trim() || "")

    if (contentArray.length > 0) {
      const content = contentArray.join("\n\n")

      results.push({
        selector: "p (paragraphs collection)",
        content
      })

      return { content, results }
    }
  }

  // 最后的fallback：尝试获取body中的主要文本内容
  debugLog("未找到明确的内容区域，尝试提取body内容")
  const content = extractFormattedText(document.body, imagesArray)

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
      let allContent: string[] = []
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
    "author",
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
    "date",
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

// 抓取网页内容的主函数
export async function scrapeWebpageContent(
  customSelectors?: Partial<Record<SelectorType, string>>
): Promise<ScrapedContent> {
  debugLog("开始抓取网页内容")
  if (customSelectors) {
    debugLog("使用自定义选择器:", customSelectors)
  }

  // 创建一个对象存储抓取的内容
  const scrapedContent: ScrapedContent = {
    title: "",
    url: window.location.href,
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

  // 生成清洁版内容
  scrapedContent.cleanedContent = cleanContent(scrapedContent.articleContent)

  // 记录抓取结果
  debugLog("文章内容抓取完成，长度:", scrapedContent.articleContent.length)
  debugLog("清洁版内容生成完成，长度:", scrapedContent.cleanedContent.length)
  debugLog("图片抓取完成，数量:", scrapedContent.images.length)

  // 提取元数据
  scrapedContent.metadata = extractMetadata()

  // 将结果输出到控制台
  debugLog("抓取完成，结果概览:", {
    title: scrapedContent.title,
    url: scrapedContent.url,
    author: scrapedContent.author,
    publishDate: scrapedContent.publishDate,
    contentLength: scrapedContent.articleContent.length,
    cleanedContentLength: scrapedContent.cleanedContent.length,
    metadataCount: Object.keys(scrapedContent.metadata).length,
    imageCount: scrapedContent.images.length,
    selectorResultsCount: {
      title: scrapedContent.selectorResults.title.length,
      author: scrapedContent.selectorResults.author.length,
      date: scrapedContent.selectorResults.date.length,
      content: scrapedContent.selectorResults.content.length
    }
  })

  return scrapedContent
}
