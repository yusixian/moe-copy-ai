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
import { cleanContent, extractFormattedText } from "./formatter"
import { debugLog } from "./logger"
import {
  convertHtmlToMarkdown,
  evaluateContentQuality,
  extractImagesFromMarkdown,
  extractWithReadability
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
  const scrapedContent: ScrapedContent = baseContent || {
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

  // 生成清洁版内容
  scrapedContent.cleanedContent = cleanContent(scrapedContent.articleContent)

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
  const {
    mode = "selector",
    customSelectors,
    readabilityConfig: _readabilityConfig
  } = options || {}

  debugLog("开始抓取网页内容，模式:", mode)

  // 创建基础结果对象
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

  // 根据模式执行不同的抓取策略
  switch (mode) {
    case "readability":
      try {
        debugLog("使用 Readability 模式")
        const readabilityResult = await extractWithReadability()

        if (readabilityResult.success) {
          // 将 HTML 转换为 Markdown
          scrapedContent.articleContent = convertHtmlToMarkdown(
            readabilityResult.content
          )
          scrapedContent.title = readabilityResult.metadata.title || ""
          scrapedContent.author = readabilityResult.metadata.byline || ""
          scrapedContent.publishDate =
            readabilityResult.metadata.publishedTime || ""

          // 设置额外的元数据
          scrapedContent.metadata = {
            ...scrapedContent.metadata,
            "extraction:mode": "readability",
            "readability:siteName": readabilityResult.metadata.siteName || "",
            "readability:excerpt": readabilityResult.metadata.excerpt || "",
            "readability:lang": readabilityResult.metadata.lang || "",
            "readability:length": readabilityResult.metadata.length.toString()
          }

          debugLog("Readability 抓取成功")
        } else {
          debugLog("Readability 抓取失败，回退到选择器模式")
          const fallbackResult = await scrapeWithSelectors(
            customSelectors,
            scrapedContent
          )
          // 添加原始模式信息，用于UI显示
          fallbackResult.metadata = {
            ...fallbackResult.metadata,
            "original:mode": "readability",
            "fallback:reason": "Readability解析失败，自动切换到选择器模式"
          }
          return fallbackResult
        }
      } catch (error) {
        debugLog("Readability 抓取异常，回退到选择器模式:", error)
        const fallbackResult = await scrapeWithSelectors(
          customSelectors,
          scrapedContent
        )
        // 添加原始模式信息，用于UI显示
        fallbackResult.metadata = {
          ...fallbackResult.metadata,
          "original:mode": "readability",
          "fallback:reason": `Readability解析异常(${error.message || error})，自动切换到选择器模式`
        }
        return fallbackResult
      }
      break

    case "hybrid":
      try {
        debugLog("使用混合模式")

        // 串行执行两种抓取方式，避免DOM冲突
        debugLog("混合模式：首先执行选择器抓取")
        const selectorResult = await scrapeWithSelectors(customSelectors, {
          ...scrapedContent
        })

        debugLog("混合模式：然后执行 Readability 抓取")
        const readabilityResult = await extractWithReadability()

        if (readabilityResult.success) {
          const readabilityContent = convertHtmlToMarkdown(
            readabilityResult.content
          )
          const evaluation = evaluateContentQuality(
            selectorResult.articleContent,
            readabilityContent
          )

          debugLog("混合模式内容评估:", evaluation.reason)

          // 使用质量更高的内容
          scrapedContent.articleContent = evaluation.betterContent

          // 合并元数据，优先使用 Readability 的元数据
          if (
            evaluation.betterContent === readabilityContent ||
            !selectorResult.title
          ) {
            scrapedContent.title =
              readabilityResult.metadata.title || selectorResult.title
            scrapedContent.author =
              readabilityResult.metadata.byline || selectorResult.author
            scrapedContent.publishDate =
              readabilityResult.metadata.publishedTime ||
              selectorResult.publishDate
          } else {
            scrapedContent.title = selectorResult.title
            scrapedContent.author = selectorResult.author
            scrapedContent.publishDate = selectorResult.publishDate
          }

          // 合并选择器结果和图片
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
            "evaluation:readabilityScore":
              evaluation.scores.readability.toString()
          }
        } else {
          debugLog("Readability 在混合模式中失败，使用选择器结果")
          // 添加原始模式信息，用于UI显示
          selectorResult.metadata = {
            ...selectorResult.metadata,
            "original:mode": "hybrid",
            "fallback:reason":
              "混合模式中Readability解析失败，自动使用选择器模式结果"
          }
          return selectorResult
        }
      } catch (error) {
        debugLog("混合模式执行异常，回退到选择器模式:", error)
        const fallbackResult = await scrapeWithSelectors(
          customSelectors,
          scrapedContent
        )
        // 添加原始模式信息，用于UI显示
        fallbackResult.metadata = {
          ...fallbackResult.metadata,
          "original:mode": "hybrid",
          "fallback:reason": `混合模式执行异常(${error.message || error})，自动切换到选择器模式`
        }
        return fallbackResult
      }
      break

    default: // 'selector'
      debugLog("使用选择器模式")
      return await scrapeWithSelectors(customSelectors, scrapedContent)
  }

  // 生成清洁版内容
  scrapedContent.cleanedContent = cleanContent(scrapedContent.articleContent)

  // 如果没有提取到图片信息，尝试从内容中解析
  if (scrapedContent.images.length === 0) {
    scrapedContent.images = extractImagesFromMarkdown(
      scrapedContent.articleContent
    )
  }

  // 将结果输出到控制台
  debugLog("抓取完成，结果概览:", {
    mode: mode,
    title: scrapedContent.title,
    url: scrapedContent.url,
    author: scrapedContent.author,
    publishDate: scrapedContent.publishDate,
    contentLength: scrapedContent.articleContent.length,
    cleanedContentLength: scrapedContent.cleanedContent.length,
    metadataCount: Object.keys(scrapedContent.metadata).length,
    imageCount: scrapedContent.images.length
  })

  return scrapedContent
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
