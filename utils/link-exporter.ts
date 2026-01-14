import type { ExtractedLink } from "~constants/types"

/**
 * 格式化时间为易读格式
 */
function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 导出链接为 Markdown 格式
 * 格式: 带编号的链接列表
 */
export function exportLinksToMarkdown(links: ExtractedLink[]): string {
  const now = new Date()

  const header = `# 链接列表

> 导出时间: ${formatDateTime(now)}
> 共 ${links.length} 个链接

`

  const linkList = links
    .map(
      (link, index) => `${index + 1}. [${link.text || "无标题"}](${link.url})`
    )
    .join("\n")

  return header + linkList
}

/**
 * 导出链接为 JSON 格式
 * 包含完整信息: { url, text, index }
 */
export function exportLinksToJson(links: ExtractedLink[]): string {
  const data = {
    exportedAt: new Date().toISOString(),
    totalLinks: links.length,
    links: links.map((link) => ({
      url: link.url,
      text: link.text,
      index: link.index
    }))
  }

  return JSON.stringify(data, null, 2)
}
