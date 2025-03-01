import {
  AUTHOR_SELECTORS,
  CONTENT_SELECTORS,
  DATE_SELECTORS,
  TITLE_SELECTORS
} from "./config"
import { cleanContent, extractFormattedText } from "./formatter"
import type { ImageInfo, ScrapedContent } from "./types"
import { debugLog, getFirstMatchContent } from "./utils"

// 增强抓取文章内容的函数
export function extractArticleContent(imagesArray: ImageInfo[] = []): string {
  // 首先检查是否有article标签
  const articleElements = document.querySelectorAll("article")
  if (articleElements.length > 0) {
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
    return extractFormattedText(longestArticle, imagesArray)
  }

  // 如果没有article标签，尝试其他常见内容容器
  for (const selector of CONTENT_SELECTORS) {
    const contentEl = document.querySelector(selector)
    if (contentEl) {
      debugLog(`找到内容容器: ${selector}`)
      return extractFormattedText(contentEl, imagesArray)
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
      return contentArray.join("\n\n")
    }
  }

  // 最后的fallback：尝试获取body中的主要文本内容
  debugLog("未找到明确的内容区域，尝试提取body内容")
  return extractFormattedText(document.body, imagesArray)
}

// 提取页面标题
export function extractTitle(): string {
  // 首先检查是否有h1标签
  const headingEl = document.querySelector("h1")
  if (headingEl) {
    const title = headingEl.textContent?.trim() || ""
    if (title) {
      debugLog("从h1标签获取标题:", title)
      return title
    }
  }

  // 检查元数据标签
  for (const selector of TITLE_SELECTORS) {
    const metaTitle = document.querySelector(selector)
    if (metaTitle) {
      const content = metaTitle.getAttribute("content")
      if (content && content.trim()) {
        debugLog(`从${selector}获取标题:`, content.trim())
        return content.trim()
      }
    }
  }

  // 如果都没有找到，返回文档标题
  return document.title || "无标题"
}

// 提取作者信息
export function extractAuthor(): string {
  // 从常见的作者元素位置尝试获取作者信息
  return getFirstMatchContent(AUTHOR_SELECTORS, (element) => {
    if (element.tagName.toLowerCase() === "meta") {
      return element.getAttribute("content") || ""
    } else {
      return element.textContent?.trim() || ""
    }
  })
}

// 提取发布日期
export function extractPublishDate(): string {
  // 从常见的日期元素位置尝试获取日期信息
  return getFirstMatchContent(DATE_SELECTORS, (element) => {
    if (element.tagName.toLowerCase() === "meta") {
      return element.getAttribute("content") || ""
    } else if (element.tagName.toLowerCase() === "time") {
      return (
        element.getAttribute("datetime") || element.textContent?.trim() || ""
      )
    } else {
      return element.textContent?.trim() || ""
    }
  })
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
  return metadata
}

// 抓取网页内容的主函数
export function scrapeWebpageContent(): ScrapedContent {
  debugLog("开始抓取网页内容")

  // 创建一个对象存储抓取的内容
  const scrapedContent: ScrapedContent = {
    title: "",
    url: window.location.href,
    articleContent: "",
    cleanedContent: "",
    author: "",
    publishDate: "",
    metadata: {},
    images: []
  }

  // 提取标题
  scrapedContent.title = extractTitle()

  // 提取作者信息
  scrapedContent.author = extractAuthor()

  // 提取发布日期
  scrapedContent.publishDate = extractPublishDate()

  // 提取文章内容
  debugLog("开始抓取文章内容")
  scrapedContent.articleContent = extractArticleContent(scrapedContent.images)

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
    imageCount: scrapedContent.images.length
  })

  return scrapedContent
}
