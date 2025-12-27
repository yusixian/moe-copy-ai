import type { BatchProgress, BatchScrapeOptions, BatchScrapeResult, ExtractedLink } from '~constants/types'

import { debugLog } from './logger'
import { convertHtmlToMarkdown, extractWithReadability } from './readability-extractor'

/**
 * 默认批量抓取选项
 */
export const DEFAULT_BATCH_OPTIONS: BatchScrapeOptions = {
  concurrency: 2,
  timeout: 30000,
  retryCount: 1,
  delayBetweenRequests: 500,
}

/**
 * 使用 Fetch API 抓取单个页面
 */
async function scrapeViaFetch(url: string, timeout: number): Promise<BatchScrapeResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    debugLog(`[Fetch] 开始抓取: ${url}`)

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
    // 注意：DOMParser 创建的文档没有正确的 baseURI，需要手动处理相对链接
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

    debugLog(`[Fetch] 抓取成功: ${url}`, {
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
    debugLog(`[Fetch] 抓取失败: ${url}`, errorMessage)

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
 * 带重试逻辑的抓取
 * 失败后根据 retryCount 配置进行重试
 */
async function scrapeWithRetry(
  url: string,
  options: BatchScrapeOptions
): Promise<BatchScrapeResult> {
  let lastResult: BatchScrapeResult | null = null

  for (let attempt = 0; attempt <= options.retryCount; attempt++) {
    if (attempt > 0) {
      debugLog(`[Fetch] 第 ${attempt} 次重试: ${url}`)
      await delay(options.delayBetweenRequests)
    }

    lastResult = await scrapeViaFetch(url, options.timeout)

    if (lastResult.success) {
      return lastResult
    }
  }

  return lastResult!
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 批量抓取控制器
 */
export class BatchScrapeController {
  private isPaused = false
  private isCancelled = false
  private options: BatchScrapeOptions

  constructor(options: Partial<BatchScrapeOptions> = {}) {
    this.options = { ...DEFAULT_BATCH_OPTIONS, ...options }
  }

  pause() {
    this.isPaused = true
  }

  resume() {
    this.isPaused = false
  }

  cancel() {
    this.isCancelled = true
  }

  get paused() {
    return this.isPaused
  }

  get cancelled() {
    return this.isCancelled
  }

  /**
   * 等待暂停状态结束
   */
  private async waitIfPaused(): Promise<void> {
    while (this.isPaused && !this.isCancelled) {
      await delay(100)
    }
  }

  /**
   * 执行批量抓取
   */
  async execute(
    links: ExtractedLink[],
    onProgress: (progress: BatchProgress) => void
  ): Promise<BatchScrapeResult[]> {
    const results: BatchScrapeResult[] = []
    const total = links.length
    const startTime = Date.now()

    // 初始化进度
    const progress: BatchProgress = {
      total,
      completed: 0,
      current: null,
      results: [],
      startTime,
      isPaused: false,
    }

    onProgress({ ...progress })

    // 按并发数分批处理
    for (let i = 0; i < links.length; i += this.options.concurrency) {
      // 检查是否取消
      if (this.isCancelled) {
        debugLog('[BatchScrape] 已取消')
        break
      }

      // 等待暂停状态结束
      await this.waitIfPaused()
      progress.isPaused = this.isPaused

      // 获取当前批次的链接
      const batch = links.slice(i, i + this.options.concurrency)

      // 并行抓取当前批次
      const batchPromises = batch.map(async (link, batchIndex) => {
        const linkIndex = i + batchIndex

        // 更新当前进度
        progress.current = {
          url: link.url,
          status: 'fetching',
        }
        onProgress({ ...progress })

        // 执行抓取
        const result = await scrapeWithRetry(link.url, this.options)

        // 更新结果
        progress.results.push({
          url: result.url,
          status: result.success ? 'success' : 'failed',
          title: result.title,
          error: result.error,
        })
        progress.completed = progress.results.length

        return result
      })

      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)

      // 更新进度
      progress.current = null
      onProgress({ ...progress })

      // 批次间延迟（如果不是最后一批）
      if (i + this.options.concurrency < links.length && !this.isCancelled) {
        await delay(this.options.delayBetweenRequests)
      }
    }

    debugLog('[BatchScrape] 完成', {
      total: results.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    })

    return results
  }
}

/**
 * 简化的批量抓取函数
 */
export async function batchScrape(
  links: ExtractedLink[],
  options: Partial<BatchScrapeOptions> = {},
  onProgress: (progress: BatchProgress) => void
): Promise<{ results: BatchScrapeResult[]; controller: BatchScrapeController }> {
  const controller = new BatchScrapeController(options)
  const results = await controller.execute(links, onProgress)
  return { results, controller }
}
