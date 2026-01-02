import { getParser } from "./parser"
import { preprocessHtml } from "./plugins/preprocess-html"

/**
 * Convert HTML to Markdown using unified ecosystem
 * @param html - HTML string to convert
 * @returns Promise<string> - Markdown string
 */
export async function parseHtmlToMarkdown(
  html: string,
  baseUrl?: string
): Promise<string> {
  if (!html || !html.trim()) {
    return ""
  }

  const cleanedHtml = preprocessHtml(html, baseUrl)
  const result = await getParser().process(cleanedHtml)

  return String(result).trim()
}
