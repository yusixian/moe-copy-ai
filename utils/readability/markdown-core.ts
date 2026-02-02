import type { ImageInfo } from "../../constants/types"
import { parseHtmlToMarkdown } from "../../parser/htmlParser"

// 仅解析最常见的 Markdown 图片语法，保持轻量与稳定。
const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g

export async function convertHtmlToMarkdownCore(
  htmlContent: string,
  baseUrl?: string
): Promise<string> {
  if (!htmlContent) {
    return ""
  }

  try {
    // 交由统一解析器处理，保留结构信息。
    const markdownContent = await parseHtmlToMarkdown(htmlContent, baseUrl)
    return markdownContent.replace(/\n{3,}/g, "\n\n").trim()
  } catch {
    // 解析失败时退化为纯文本，避免抛错中断流程。
    return htmlContent
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  }
}

export function extractImagesFromMarkdownCore(
  markdownContent: string
): ImageInfo[] {
  const images: ImageInfo[] = []
  let match: RegExpExecArray | null
  let index = 0

  IMAGE_REGEX.lastIndex = 0
  while (true) {
    match = IMAGE_REGEX.exec(markdownContent)
    if (!match) {
      break
    }
    images.push({
      src: match[2],
      alt: match[1] || `Image#${index}`,
      title: "",
      index
    })
    index++
  }

  return images
}
