import { Readability } from "@mozilla/readability"
import DOMPurify from "dompurify"

import type { ImageInfo, ReadabilityResult } from "../constants/types"
import { debugLog } from "./logger"

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
    let article: any
    try {
      debugLog("开始执行 Readability 解析")
      const reader = new Readability(documentForReadability, readabilityOptions)
      article = reader.parse()

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
 * 处理表格元素，转换为 Markdown 表格格式
 */
function processTable(tableElement: Element): string {
  const rows: string[][] = []
  let hasHeader = false

  // 提取表头
  const thead = tableElement.querySelector("thead")
  if (thead) {
    const headerRow = thead.querySelector("tr")
    if (headerRow) {
      const headerCells = Array.from(headerRow.querySelectorAll("th, td"))
      if (headerCells.length > 0) {
        rows.push(headerCells.map((cell) => getCellText(cell)))
        hasHeader = true
      }
    }
  }

  // 提取表体
  const tbody = tableElement.querySelector("tbody") || tableElement
  const bodyRows = Array.from(tbody.querySelectorAll("tr")).filter(
    (row) => !row.closest("thead")
  ) // 排除已处理的表头

  for (const row of bodyRows) {
    const cells = Array.from(row.querySelectorAll("th, td"))
    if (cells.length > 0) {
      // 如果没有表头但第一行是 th，标记为表头
      if (
        !hasHeader &&
        rows.length === 0 &&
        cells[0].tagName.toLowerCase() === "th"
      ) {
        rows.push(cells.map((cell) => getCellText(cell)))
        hasHeader = true
      } else {
        rows.push(cells.map((cell) => getCellText(cell)))
      }
    }
  }

  if (rows.length === 0) return ""

  // 确定列数（取最大列数）
  const colCount = Math.max(...rows.map((row) => row.length))

  // 补齐每行的列数
  const normalizedRows = rows.map((row) => {
    while (row.length < colCount) row.push("")
    return row
  })

  // 生成 Markdown 表格
  const lines: string[] = []

  // 如果没有表头，使用第一行作为表头
  const headerRow = normalizedRows[0]
  lines.push(`| ${headerRow.join(" | ")} |`)

  // 分隔行
  lines.push(`| ${headerRow.map(() => "---").join(" | ")} |`)

  // 数据行
  const dataRows = hasHeader ? normalizedRows.slice(1) : normalizedRows.slice(1)
  for (const row of dataRows) {
    lines.push(`| ${row.join(" | ")} |`)
  }

  return `\n\n${lines.join("\n")}\n\n`
}

/**
 * 获取表格单元格的文本内容（清理格式）
 */
function getCellText(cell: Element): string {
  // 递归获取文本，处理嵌套元素
  function extractText(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent?.trim() || ""
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element
      const tag = el.tagName.toLowerCase()

      // 跳过不需要的元素
      if (["script", "style", "svg", "button", "input"].includes(tag)) {
        // 对于 input，可能需要提取 placeholder 或 value
        if (tag === "input") {
          return el.getAttribute("placeholder") || ""
        }
        return ""
      }

      // 递归处理子节点
      const children = Array.from(el.childNodes)
        .map(extractText)
        .filter(Boolean)

      // 根据标签添加格式
      const text = children.join(" ")
      if (tag === "strong" || tag === "b") return `**${text}**`
      if (tag === "em" || tag === "i") return `*${text}*`
      if (tag === "code") return `\`${text}\``

      return text
    }
    return ""
  }

  return extractText(cell)
    .replace(/\s+/g, " ")
    .replace(/\|/g, "\\|") // 转义表格分隔符
    .trim()
}

/**
 * HTML内容转换为Markdown格式
 */
export function convertHtmlToMarkdown(htmlContent: string): string {
  if (!htmlContent) {
    debugLog("convertHtmlToMarkdown: 输入内容为空")
    return ""
  }

  debugLog("convertHtmlToMarkdown: 开始转换，输入长度:", htmlContent.length)
  debugLog(
    "convertHtmlToMarkdown: 输入内容预览:",
    `${htmlContent.substring(0, 200)}...`
  )

  // 创建临时DOM元素来处理HTML
  const tempDiv = document.createElement("div")

  try {
    tempDiv.innerHTML = htmlContent
    debugLog(
      "convertHtmlToMarkdown: HTML解析成功，子节点数量:",
      tempDiv.childNodes.length
    )
  } catch (error) {
    debugLog("convertHtmlToMarkdown: HTML解析失败:", error)
    // 如果HTML解析失败，尝试提取纯文本
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

  // 递归处理节点，转换为Markdown
  function processNode(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ""
      // 保留一些空格，但清理多余的换行
      return text.replace(/\s+/g, " ")
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element
      const tagName = element.tagName.toLowerCase()

      // 跳过一些不需要的元素
      if (
        ["script", "style", "meta", "link", "noscript", "svg"].includes(tagName)
      ) {
        return ""
      }

      // 跳过扩展相关元素
      if (
        element.id?.includes("plasmo") ||
        element.className?.includes("plasmo")
      ) {
        return ""
      }

      // 特殊处理表格
      if (tagName === "table") {
        return processTable(element)
      }

      // 跳过表格内部元素（由 processTable 统一处理）
      if (["thead", "tbody", "tfoot", "tr", "th", "td"].includes(tagName)) {
        // 如果不在 table 内，则正常处理子内容
        if (!element.closest("table")) {
          const textContent = Array.from(element.childNodes)
            .map(processNode)
            .join("")
          return textContent
        }
        return ""
      }

      const textContent = Array.from(element.childNodes)
        .map(processNode)
        .join("")

      // 对于img、br、hr等自闭合标签，即使没有textContent也要处理
      const selfClosingTags = ["img", "br", "hr", "input"]
      if (!textContent.trim() && !selfClosingTags.includes(tagName)) {
        return ""
      }

      switch (tagName) {
        case "h1":
          return `\n\n# ${textContent.trim()}\n\n`
        case "h2":
          return `\n\n## ${textContent.trim()}\n\n`
        case "h3":
          return `\n\n### ${textContent.trim()}\n\n`
        case "h4":
          return `\n\n#### ${textContent.trim()}\n\n`
        case "h5":
          return `\n\n##### ${textContent.trim()}\n\n`
        case "h6":
          return `\n\n###### ${textContent.trim()}\n\n`
        case "p": {
          const pContent = textContent.trim()
          return pContent ? `\n\n${pContent}\n` : ""
        }
        case "br":
          return "\n"
        case "strong":
        case "b":
          return `**${textContent.trim()}**`
        case "em":
        case "i":
          return `*${textContent.trim()}*`
        case "code":
          return `\`${textContent.trim()}\``
        case "pre": {
          // 检查是否包含代码块
          const codeElement = element.querySelector("code")
          const preContent = codeElement
            ? codeElement.textContent?.trim() || textContent.trim()
            : textContent.trim()
          return `\n\n\`\`\`\n${preContent}\n\`\`\`\n\n`
        }
        case "blockquote":
          return `\n\n> ${textContent.trim()}\n\n`
        case "a": {
          const href = element.getAttribute("href")
          const linkText = textContent.trim()
          if (
            href &&
            !href.startsWith("#") &&
            !href.startsWith("javascript:") &&
            linkText
          ) {
            return `[${linkText}](${href})`
          }
          return linkText
        }
        case "ul":
          return `\n${textContent}\n`
        case "ol":
          // 对于有序列表，需要特殊处理
          return `\n${textContent}\n`
        case "li": {
          const liContent = textContent.trim()
          // 检查是否是有序列表的子项
          const parentOl = element.closest("ol")
          if (parentOl) {
            const siblings = Array.from(parentOl.children)
            const index = siblings.indexOf(element) + 1
            return liContent ? `\n${index}. ${liContent}` : ""
          }
          return liContent ? `\n- ${liContent}` : ""
        }
        case "img": {
          const src = element.getAttribute("src")
          const alt = element.getAttribute("alt") || ""
          if (src) {
            return `\n\n![${alt}](${src})\n\n`
          }
          return ""
        }
        case "hr":
          return "\n\n---\n\n"
        case "dl":
          // 定义列表
          return `\n${textContent}\n`
        case "dt":
          // 定义术语
          return `\n\n**${textContent.trim()}**\n`
        case "dd":
          // 定义描述
          return `\n: ${textContent.trim()}\n`
        case "div":
        case "span":
        case "section":
        case "article":
        case "main":
        case "header":
        case "footer":
        case "aside":
        case "nav":
        case "figure":
        case "figcaption":
          // 对于容器元素，直接返回子内容，但添加适当的间距
          if (textContent.trim()) {
            return [
              "div",
              "section",
              "article",
              "main",
              "aside",
              "figure"
            ].includes(tagName)
              ? `\n${textContent}\n`
              : textContent
          }
          return ""
        case "button": {
          // 按钮通常是交互元素，可以保留文本或跳过
          const buttonText = textContent.trim()
          return buttonText ? ` [${buttonText}] ` : ""
        }
        default:
          return textContent
      }
    }

    return ""
  }

  let markdownContent: string
  try {
    markdownContent = processNode(tempDiv)
    debugLog(
      "convertHtmlToMarkdown: 节点处理完成，Markdown长度:",
      markdownContent.length
    )
  } catch (error) {
    debugLog("convertHtmlToMarkdown: 节点处理失败:", error)
    // Fallback: 直接使用文本内容
    markdownContent = tempDiv.textContent || tempDiv.innerText || ""
    debugLog(
      "convertHtmlToMarkdown: 使用textContent fallback，长度:",
      markdownContent.length
    )
  }

  // 清理多余的空行和空格
  const cleanedContent = markdownContent
    .replace(/\n\s+\n/g, "\n\n") // 清理换行间的空格
    .replace(/\n{3,}/g, "\n\n") // 限制连续换行不超过2个
    .replace(/^\s+/gm, "") // 移除行首空格（但保留列表缩进）
    .trim()

  debugLog("convertHtmlToMarkdown: 最终结果长度:", cleanedContent.length)
  debugLog(
    "convertHtmlToMarkdown: 最终内容预览:",
    `${cleanedContent.substring(0, 200)}...`
  )

  return cleanedContent
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
  let match: RegExpExecArray | null
  let index = 0

  while ((match = imageRegex.exec(markdownContent)) !== null) {
    images.push({
      src: match[2],
      alt: match[1] || `图片#${index}`,
      title: "",
      index: index
    })
    index++
  }

  return images
}
