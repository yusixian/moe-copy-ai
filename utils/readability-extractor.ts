import { Readability } from "@mozilla/readability"
import DOMPurify from "dompurify"

import type { ImageInfo, ReadabilityResult } from "../constants/types"
import { parseHtmlToMarkdown } from "../parser/htmlParser"
import { debugLog } from "./logger"

/**
 * Readability.parse() 的实际返回类型
 * 注意：@mozilla/readability 的类型定义中 content 是 T (泛型)，
 * 但实际返回的是 HTML 字符串
 */
interface ReadabilityParseResult {
  title: string
  content: string
  textContent: string
  length: number
  excerpt: string
  byline: string
  dir: string
  siteName: string
  lang: string
  publishedTime: string
}

/**
 * 使用 DOMPurify + Readability.js 提取网页内容
 * 先用DOMPurify清洗整个body，然后用Readability进行智能提取
 */
export async function extractWithReadability(
  extractionDocument?: Document
): Promise<{
  content: string
  metadata: ReadabilityResult
  success: boolean
}> {
  try {
    debugLog("开始使用 DOMPurify + Readability.js 提取内容")

    // 使用传入的 document 或当前页面的 document
    const sourceDoc = extractionDocument || document

    // 等待一小段时间，确保页面内容完全加载（特别是动态内容）
    if (!extractionDocument) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // 记录原始文档信息用于调试
    debugLog("原始文档信息:", {
      title: sourceDoc.title,
      bodyLength: sourceDoc.body?.innerHTML?.length || 0,
      url: sourceDoc.URL
    })

    // 使用DOMPurify清洗整个body内容
    let cleanBodyHTML: string
    try {
      debugLog("开始使用 DOMPurify 清洗 body 内容")

      // 获取完整的body HTML
      const originalBodyHTML = sourceDoc.body?.outerHTML || ""

      // 使用DOMPurify清洗HTML，移除恶意脚本但保留所有内容结构
      cleanBodyHTML = DOMPurify.sanitize(originalBodyHTML, {
        WHOLE_DOCUMENT: false, // 不处理整个文档，只处理body
        RETURN_DOM: false, // 返回HTML字符串而不是DOM
        ADD_TAGS: [
          "article",
          "section",
          "aside",
          "nav",
          "header",
          "footer",
          "main",
          "time"
        ], // 保留语义标签
        ADD_ATTR: ["datetime", "pubdate", "itemscope", "itemtype", "itemprop"], // 保留语义属性
        ALLOW_DATA_ATTR: true, // 允许data-*属性（但会自动过滤掉plasmo相关的）
        KEEP_CONTENT: true, // 保留被移除标签的内容
        FORBID_TAGS: ["script", "style", "iframe", "object", "embed"], // 禁止的标签
        FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover", "style"], // 禁止的属性
        CUSTOM_ELEMENT_HANDLING: {
          tagNameCheck: (tagName) => {
            // 禁止plasmo相关的自定义元素
            return !tagName.toLowerCase().includes("plasmo")
          },
          attributeNameCheck: (attr) => {
            // 禁止plasmo相关的属性
            return !attr.toLowerCase().includes("plasmo")
          }
        }
      })

      debugLog("DOMPurify 清洗完成:", {
        originalLength: originalBodyHTML.length,
        cleanedLength: cleanBodyHTML.length,
        removedBytes: originalBodyHTML.length - cleanBodyHTML.length
      })
    } catch (purifyError) {
      debugLog("DOMPurify 清洗失败，使用原始内容:", purifyError)
      cleanBodyHTML = sourceDoc.body?.outerHTML || ""
    }

    // 创建新的文档用于Readability处理
    let documentForReadability: Document
    try {
      // 构建完整的HTML文档
      const fullHTML = `<!DOCTYPE html>
<html lang="${sourceDoc.documentElement.lang || "en"}">
<head>
  <title>${sourceDoc.title || ""}</title>
  <meta charset="utf-8">
  ${sourceDoc.head?.innerHTML || ""}
</head>
${cleanBodyHTML}
</html>`

      // 解析为新的Document对象
      const parser = new DOMParser()
      documentForReadability = parser.parseFromString(fullHTML, "text/html")

      // 验证解析结果
      if (!documentForReadability.body || !documentForReadability.head) {
        throw new Error("文档解析结果不完整")
      }

      debugLog("创建用于Readability的文档成功:", {
        bodyLength: documentForReadability.body.innerHTML.length,
        headLength: documentForReadability.head.innerHTML.length
      })
    } catch (parseError) {
      debugLog("创建Readability文档失败，使用原始文档:", parseError)
      documentForReadability = sourceDoc
    }

    // 配置 Readability 选项 - 由于已经用DOMPurify清洗过，可以使用更宽松的配置
    const readabilityOptions = {
      charThreshold: 0, // 移除字符数限制，因为DOMPurify已经清洗过
      maxElemsToParse: 0, // 处理所有元素
      nbTopCandidates: 50, // 大量候选节点，确保不遗漏内容
      keepClasses: true, // 保留CSS类名
      classesToPreserve: [
        // 保留重要的CSS类
        "newsletter",
        "newsletter-section",
        "newsletter-article",
        "newsletter-header",
        "article-title",
        "section-title",
        "content",
        "article",
        "main",
        "box"
      ],
      tags: {
        // 给所有可能包含内容的标签高权重
        SECTION: 50, // section是newsletter的主要容器
        ARTICLE: 50, // article包含具体内容
        DIV: 30, // div是主要的内容容器
        MAIN: 50, // main是页面主要内容
        P: 10, // 段落内容
        H1: 50,
        H2: 45,
        H3: 40, // 标题很重要
        HEADER: 20, // header包含标题信息
        TIME: 15, // 时间信息
        A: 10, // 链接
        ASIDE: 20, // 侧边栏内容
        SPAN: 5 // 内联内容
      }
    }

    debugLog("Readability 配置:", readabilityOptions)

    // 执行内容提取
    let article: ReadabilityParseResult | null
    try {
      debugLog("开始执行 Readability 解析")
      const reader = new Readability(documentForReadability, readabilityOptions)
      article = reader.parse() as ReadabilityParseResult | null

      debugLog("Readability 解析完成:", {
        success: !!article,
        contentLength: article?.content?.length || 0,
        title: article?.title || "N/A"
      })
    } catch (readabilityError) {
      debugLog("Readability解析失败:", readabilityError)
      return {
        content: "",
        metadata: {} as ReadabilityResult,
        success: false
      }
    }

    // 检查提取结果
    if (!article || !article.content) {
      debugLog("Readability 未能解析出内容")
      return {
        content: "",
        metadata: {} as ReadabilityResult,
        success: false
      }
    }

    debugLog("DOMPurify + Readability 提取成功:", {
      title: `${article.title?.substring(0, 50)}...`,
      contentLength: article.content?.length || 0,
      textLength: article.textContent?.length || 0,
      excerpt: `${article.excerpt?.substring(0, 100)}...`
    })

    // 分析提取的内容结构
    if (article.content) {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = article.content
      const sections = tempDiv.querySelectorAll("section, .newsletter-section")
      const articles = tempDiv.querySelectorAll("article, .newsletter-article")
      const headers = tempDiv.querySelectorAll("h1, h2, h3")
      const sectionTitles = tempDiv.querySelectorAll(".section-title, h2")

      debugLog("提取内容结构分析:", {
        sectionsFound: sections.length,
        articlesFound: articles.length,
        headersFound: headers.length,
        sectionTitles: Array.from(sectionTitles)
          .map((s) => s.textContent?.trim())
          .slice(0, 10)
      })
    }

    return {
      content: article.content || "",
      metadata: {
        title: article.title,
        content: article.content,
        textContent: article.textContent,
        length: article.length,
        excerpt: article.excerpt,
        byline: article.byline,
        dir: article.dir,
        siteName: article.siteName,
        lang: article.lang,
        publishedTime: article.publishedTime
      },
      success: true
    }
  } catch (error) {
    debugLog("Readability 提取过程中出错:", error)
    return {
      content: "",
      metadata: {} as ReadabilityResult,
      success: false
    }
  }
}

/**
 * HTML内容转换为Markdown格式
 * 使用 unified 生态系统进行转换
 */
export async function convertHtmlToMarkdown(
  htmlContent: string,
  baseUrl?: string
): Promise<string> {
  if (!htmlContent) {
    debugLog("convertHtmlToMarkdown: 输入内容为空")
    return ""
  }

  debugLog("convertHtmlToMarkdown: 开始转换，输入长度:", htmlContent.length)
  debugLog(
    "convertHtmlToMarkdown: 输入内容预览:",
    `${htmlContent.substring(0, 200)}...`
  )

  try {
    const markdownContent = await parseHtmlToMarkdown(htmlContent, baseUrl)
    // 清理多余的空行和空格
    const cleanedContent = markdownContent
      .replace(/\n{3,}/g, "\n\n") // 限制连续换行不超过2个
      .trim()

    debugLog("convertHtmlToMarkdown: 最终结果长度:", cleanedContent.length)
    debugLog(
      "convertHtmlToMarkdown: 最终内容预览:",
      `${cleanedContent.substring(0, 200)}...`
    )

    return cleanedContent
  } catch (error) {
    debugLog("convertHtmlToMarkdown: 转换失败:", error)
    // Fallback: 提取纯文本
    const textOnly = htmlContent
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    debugLog(
      "convertHtmlToMarkdown: 使用纯文本fallback，长度:",
      textOnly.length
    )
    return textOnly
  }
}

/**
 * 质量评估：比较两种提取方法的结果
 */
export function evaluateContentQuality(
  selectorContent: string,
  readabilityContent: string
): {
  betterContent: string
  reason: string
  scores: { selector: number; readability: number }
} {
  // 简单的质量评分算法
  function calculateScore(content: string): number {
    if (!content) return 0

    let score = 0

    // 内容长度评分 (0-40分)
    const length = content.length
    if (length > 1000) score += 40
    else if (length > 500) score += 30
    else if (length > 200) score += 20
    else score += 10

    // 段落结构评分 (0-20分)
    const paragraphs = content.split("\n\n").filter((p) => p.trim().length > 20)
    if (paragraphs.length > 5) score += 20
    else if (paragraphs.length > 2) score += 15
    else score += 5

    // 标题结构评分 (0-20分)
    const headings = (content.match(/^#+\s/gm) || []).length
    if (headings > 2) score += 20
    else if (headings > 0) score += 10

    // HTML标签密度评分（越少越好） (0-20分)
    const htmlTagCount = (content.match(/<[^>]+>/g) || []).length
    const htmlTagRatio = htmlTagCount / (content.length / 100)
    if (htmlTagRatio < 1) score += 20
    else if (htmlTagRatio < 3) score += 10

    return Math.min(score, 100) // 最高100分
  }

  const selectorScore = calculateScore(selectorContent)
  const readabilityScore = calculateScore(readabilityContent)

  debugLog("内容质量评分:", {
    selector: selectorScore,
    readability: readabilityScore
  })

  if (readabilityScore > selectorScore + 10) {
    // 10分的阈值差异
    return {
      betterContent: readabilityContent,
      reason: `Readability 内容质量更高 (${readabilityScore} vs ${selectorScore})`,
      scores: { selector: selectorScore, readability: readabilityScore }
    }
  } else if (selectorScore > readabilityScore + 10) {
    return {
      betterContent: selectorContent,
      reason: `选择器内容质量更高 (${selectorScore} vs ${readabilityScore})`,
      scores: { selector: selectorScore, readability: readabilityScore }
    }
  } else {
    // 得分接近，优先选择更长的内容
    const betterContent =
      readabilityContent.length > selectorContent.length
        ? readabilityContent
        : selectorContent
    return {
      betterContent,
      reason: "质量得分接近，选择更详细的内容",
      scores: { selector: selectorScore, readability: readabilityScore }
    }
  }
}

// 从 Markdown 内容中提取图片信息
export function extractImagesFromMarkdown(
  markdownContent: string
): ImageInfo[] {
  const images: ImageInfo[] = []
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null = imageRegex.exec(markdownContent)
  let index = 0

  while (match !== null) {
    images.push({
      src: match[2],
      alt: match[1] || `图片#${index}`,
      title: "",
      index: index
    })
    index++
    match = imageRegex.exec(markdownContent)
  }

  return images
}
