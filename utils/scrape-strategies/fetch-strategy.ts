import type { BatchScrapeResult } from '~constants/types'

import { debugLog } from '../logger'
import { convertHtmlToMarkdown, extractWithReadability } from '../readability-extractor'
import type { ScrapeOptions, ScrapeStrategy } from './types'

/**
 * 从 URL 提取标题（备用）
 */
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1]
      return decodeURIComponent(lastPart.replace(/[-_]/g, ' ').replace(/\.\w+$/, ''))
    }
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * Fetch 策略
 * 使用 Fetch API 直接获取页面内容
 * 优点：速度快、支持并发
 * 缺点：无法获取需要登录或 JS 渲染的页面
 */
export class FetchStrategy implements ScrapeStrategy {
  readonly type = 'fetch' as const
  readonly supportsConcurrency = true

  async scrape(url: string, options: ScrapeOptions): Promise<BatchScrapeResult> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), options.timeout)

    try {
      debugLog(`[FetchStrategy] 开始抓取: ${url}`)

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`)
      }

      const html = await response.text()

      // 创建 Document 对象
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // 设置文档的 URL（Readability 需要）
      const base = doc.createElement('base')
      base.href = url
      doc.head.insertBefore(base, doc.head.firstChild)

      // 使用 Readability 提取内容
      const result = await extractWithReadability(doc)

      if (!result.success || !result.content) {
        throw new Error('Readability 提取失败')
      }

      // 转换为 Markdown
      const markdown = convertHtmlToMarkdown(result.content)

      debugLog(`[FetchStrategy] 抓取成功: ${url}`, {
        titleLength: result.metadata.title?.length || 0,
        contentLength: markdown.length,
      })

      return {
        url,
        success: true,
        title: result.metadata.title || extractTitleFromUrl(url),
        content: markdown,
        method: 'fetch',
      }
    } catch (error) {
      clearTimeout(timeoutId)
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      debugLog(`[FetchStrategy] 抓取失败: ${url}`, errorMessage)

      return {
        url,
        success: false,
        title: extractTitleFromUrl(url),
        content: '',
        error: errorMessage,
        method: 'fetch',
      }
    }
  }
}
