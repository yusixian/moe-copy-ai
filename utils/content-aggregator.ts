import type { AggregatedContent, BatchScrapeResult } from "~constants/types"

/**
 * 生成 Markdown 锚点 ID
 */
function generateAnchorId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "") // 保留字母、数字、中文、空格和连字符
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

/**
 * 生成目录
 */
function generateTableOfContents(results: BatchScrapeResult[]): string {
  const successResults = results.filter((r) => r.success)
  if (successResults.length === 0) return ""

  const tocItems = successResults.map((result, index) => {
    const anchorId = generateAnchorId(result.title || `document-${index + 1}`)
    return `${index + 1}. [${result.title || "无标题"}](#${anchorId})`
  })

  return tocItems.join("\n")
}

/**
 * 格式化时间
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
 * 将批量抓取结果聚合为单个 Markdown 文件
 */
export function aggregateToSingleMarkdown(
  results: BatchScrapeResult[]
): AggregatedContent {
  const now = new Date()
  const successResults = results.filter((r) => r.success)
  const failedResults = results.filter((r) => !r.success)
  const totalChars = successResults.reduce(
    (sum, r) => sum + r.content.length,
    0
  )

  const metadata = {
    totalPages: results.length,
    successCount: successResults.length,
    failedCount: failedResults.length,
    totalChars,
    scrapedAt: formatDateTime(now)
  }

  // 生成目录
  const toc = generateTableOfContents(results)

  // 生成头部
  const header = `# 批量抓取文档

> 抓取时间: ${metadata.scrapedAt}
> 总页面: ${metadata.totalPages} | 成功: ${metadata.successCount} | 失败: ${metadata.failedCount}

---

## 目录

${toc}

---
`

  // 生成内容部分
  const contentParts = successResults.map((result, index) => {
    const title = result.title || `文档 ${index + 1}`
    return `## ${title}

**URL**: ${result.url}

${result.content}

---
`
  })

  // 如果有失败的页面，添加失败列表
  let failedSection = ""
  if (failedResults.length > 0) {
    failedSection = `
## 抓取失败的页面

${failedResults.map((r) => `- ${r.url}: ${r.error || "未知错误"}`).join("\n")}

---
`
  }

  const content = header + contentParts.join("\n") + failedSection

  return {
    toc,
    content,
    metadata
  }
}

/**
 * 生成单个文档的 Markdown 内容
 */
export function formatSingleDocument(result: BatchScrapeResult): string {
  if (!result.success) {
    return `# ${result.title || "抓取失败"}

> 抓取失败: ${result.error || "未知错误"}

**URL**: ${result.url}
`
  }

  return `# ${result.title}

**URL**: ${result.url}

---

${result.content}
`
}
