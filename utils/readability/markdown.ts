import type { ImageInfo } from "../../constants/types"
import { debugLog } from "../logger"
import {
  convertHtmlToMarkdownCore,
  extractImagesFromMarkdownCore
} from "./markdown-core"

export async function convertHtmlToMarkdown(
  htmlContent: string,
  baseUrl?: string
): Promise<string> {
  if (!htmlContent) {
    debugLog("convertHtmlToMarkdown: empty input")
    return ""
  }

  debugLog("convertHtmlToMarkdown: starting, input length:", htmlContent.length)

  const cleanedContent = await convertHtmlToMarkdownCore(htmlContent, baseUrl)

  debugLog("convertHtmlToMarkdown: result length:", cleanedContent.length)
  return cleanedContent
}

export function extractImagesFromMarkdown(
  markdownContent: string
): ImageInfo[] {
  return extractImagesFromMarkdownCore(markdownContent)
}
