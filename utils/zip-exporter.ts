import JSZip from "jszip"

import type { BatchScrapeResult, ZipExportOptions } from "~constants/types"

import {
  aggregateToSingleMarkdown,
  formatSingleDocument
} from "./content-aggregator"

/**
 * 默认 ZIP 导出选项
 */
export const DEFAULT_ZIP_OPTIONS: ZipExportOptions = {
  includeIndex: true,
  filenameFormat: "title",
  maxFilenameLength: 50
}

/**
 * 清理文件名，移除非法字符
 */
function sanitizeFilename(name: string, maxLength: number): string {
  // 移除或替换非法字符
  let sanitized = name
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "") // Windows 非法字符
    .replace(/[\s.]+/g, "-") // 空格和点号替换为连字符
    .replace(/-+/g, "-") // 多个连字符合并
    .replace(/^-+|-+$/g, "") // 移除开头和结尾的连字符
    .trim()

  // 如果为空，使用默认名称
  if (!sanitized) {
    sanitized = "untitled"
  }

  // 截断到最大长度
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
    // 确保不在单词中间截断
    const lastDash = sanitized.lastIndexOf("-")
    if (lastDash > maxLength * 0.6) {
      sanitized = sanitized.substring(0, lastDash)
    }
  }

  return sanitized
}

/**
 * 根据 URL 生成文件名
 */
function filenameFromUrl(url: string, maxLength: number): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/").filter(Boolean)
    if (pathParts.length > 0) {
      const lastPart = decodeURIComponent(pathParts[pathParts.length - 1])
      return sanitizeFilename(lastPart.replace(/\.\w+$/, ""), maxLength)
    }
    return sanitizeFilename(urlObj.hostname, maxLength)
  } catch {
    return sanitizeFilename(url, maxLength)
  }
}

/**
 * 生成文件名（确保唯一性）
 */
function generateFilename(
  result: BatchScrapeResult,
  index: number,
  format: ZipExportOptions["filenameFormat"],
  maxLength: number,
  existingNames: Set<string>
): string {
  let baseName: string

  switch (format) {
    case "title":
      baseName = sanitizeFilename(
        result.title || `document-${index + 1}`,
        maxLength
      )
      break
    case "url":
      baseName = filenameFromUrl(result.url, maxLength)
      break
    default:
      baseName = `${String(index + 1).padStart(3, "0")}-document`
      break
  }

  // 确保唯一性
  let filename = baseName
  let counter = 1
  while (existingNames.has(filename)) {
    filename = `${baseName}-${counter}`
    counter++
  }
  existingNames.add(filename)

  return `${filename}.md`
}

/**
 * 将批量抓取结果导出为 ZIP 文件
 */
export async function exportAsZip(
  results: BatchScrapeResult[],
  options: Partial<ZipExportOptions> = {}
): Promise<Blob> {
  const mergedOptions = { ...DEFAULT_ZIP_OPTIONS, ...options }
  const zip = new JSZip()
  const existingNames = new Set<string>()

  // 过滤成功的结果
  const successResults = results.filter((r) => r.success)

  // 添加索引文件
  if (mergedOptions.includeIndex) {
    const { content } = aggregateToSingleMarkdown(results)
    zip.file("index.md", content)
  }

  // 创建 docs 文件夹存放单独的文档
  const docsFolder = zip.folder("docs")

  if (docsFolder) {
    // 添加每个文档
    successResults.forEach((result, index) => {
      const filename = generateFilename(
        result,
        index,
        mergedOptions.filenameFormat,
        mergedOptions.maxFilenameLength,
        existingNames
      )
      const content = formatSingleDocument(result)
      docsFolder.file(filename, content)
    })
  }

  // 生成 ZIP
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6
    }
  })

  return blob
}

/**
 * 生成 ZIP 文件名
 */
export function generateZipFilename(): string {
  const date = new Date().toISOString().split("T")[0]
  return `batch-scrape-${date}.zip`
}
