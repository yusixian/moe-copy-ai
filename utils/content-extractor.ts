import type {
  ExtractedContent,
  ScrapedContent,
  SelectedElementInfo
} from "~constants/types"

import { convertHtmlToMarkdown } from "./readability-extractor"

// 块级元素 - 前后需要换行
const BLOCK_ELEMENTS = new Set([
  "div",
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "article",
  "section",
  "header",
  "footer",
  "main",
  "nav",
  "aside",
  "ul",
  "ol",
  "li",
  "dl",
  "dt",
  "dd",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "blockquote",
  "pre",
  "figure",
  "figcaption",
  "form",
  "fieldset",
  "legend",
  "hr"
])

// 表格单元格 - 用 Tab 分隔
const TABLE_CELLS = new Set(["td", "th"])

// 标题元素 - 前后需要额外空行
const HEADING_ELEMENTS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"])

/**
 * 智能提取带格式的纯文本
 * 根据 HTML 元素类型添加适当的换行和空格
 */
function extractFormattedText(element: Element): string {
  const result: string[] = []

  function traverse(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        result.push(text)
      }
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as Element
    const tag = el.tagName.toLowerCase()

    // 跳过隐藏元素和脚本/样式
    if (["script", "style", "noscript", "svg"].includes(tag)) return

    const isBlock = BLOCK_ELEMENTS.has(tag)
    const isHeading = HEADING_ELEMENTS.has(tag)
    const isTableCell = TABLE_CELLS.has(tag)

    // 块级元素前添加换行
    if (isBlock && result.length > 0) {
      result.push("\n")
      if (isHeading) result.push("\n") // 标题前额外空行
    }

    // 表格单元格前添加 Tab（同行分隔）
    if (isTableCell && result.length > 0) {
      const lastChar = result[result.length - 1]
      if (lastChar !== "\n" && lastChar !== "\t") {
        result.push("\t")
      }
    }

    // 遍历子节点
    for (const child of el.childNodes) {
      traverse(child)
    }

    // 块级元素后添加换行
    if (isBlock) {
      result.push("\n")
      if (isHeading) result.push("\n") // 标题后额外空行
    }

    // <br> 标签
    if (tag === "br") {
      result.push("\n")
    }
  }

  traverse(element)

  // 清理：合并多余的换行和空格
  return result
    .join("")
    .replace(/\n{3,}/g, "\n\n") // 最多两个连续换行
    .replace(/[ \t]+/g, " ") // 合并空格
    .replace(/\n /g, "\n") // 移除行首空格
    .replace(/ \n/g, "\n") // 移除行尾空格
    .trim()
}

/**
 * 获取元素的基本信息
 */
export function getElementInfo(element: Element): SelectedElementInfo {
  return {
    tagName: element.tagName.toLowerCase(),
    className: element.className || "",
    id: element.id || "",
    linkCount: element.querySelectorAll("a[href]").length,
    outerHTML: element.outerHTML.substring(0, 500) // 限制长度用于显示
  }
}

/**
 * 从 DOM 元素中提取内容
 * 返回三种格式：HTML、Markdown、纯文本
 */
export async function extractContentFromElement(
  element: Element
): Promise<ExtractedContent> {
  const html = element.outerHTML
  const text = extractFormattedText(element) // 使用智能文本提取

  // 转换 HTML 为 Markdown
  let markdown = ""
  try {
    markdown = await convertHtmlToMarkdown(html, element.baseURI)
  } catch (error) {
    console.error("Markdown 转换失败:", error)
    // 回退到纯文本
    markdown = text
  }

  return {
    html,
    markdown,
    text,
    elementInfo: getElementInfo(element)
  }
}

/**
 * 获取内容的统计信息
 */
export function getContentStats(content: ExtractedContent): {
  htmlLength: number
  markdownLength: number
  textLength: number
  wordCount: number
} {
  const wordCount = content.text
    .split(/\s+/)
    .filter((word) => word.length > 0).length

  return {
    htmlLength: content.html.length,
    markdownLength: content.markdown.length,
    textLength: content.text.length,
    wordCount
  }
}

/**
 * 将提取的内容转换为 ScrapedContent 格式
 * 用于与 useAiSummary hook 兼容
 */
export function createScrapedDataFromExtraction(
  content: ExtractedContent,
  tabInfo: { url: string; title: string }
): ScrapedContent {
  return {
    title: tabInfo.title,
    url: tabInfo.url,
    articleContent: content.markdown,
    cleanedContent: content.text,
    author: "",
    publishDate: "", // 内容提取无法获取发布日期
    metadata: {
      "extraction:tagName": content.elementInfo.tagName,
      "extraction:id": content.elementInfo.id || "",
      "extraction:class": content.elementInfo.className || "",
      "extraction:htmlLength": String(content.html.length),
      "extraction:textLength": String(content.text.length)
    },
    images: []
  }
}
