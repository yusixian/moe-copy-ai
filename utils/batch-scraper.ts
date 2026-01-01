import type {
  BatchProgress,
  BatchScrapeOptions,
  BatchScrapeResult,
  ExtractedLink,
  ScrapeStrategyType
} from "~constants/types"

import { debugLog } from "./logger"
import { createScrapeStrategy, type ScrapeStrategy } from "./scrape-strategies"

/**
 * 扩展的批量抓取选项
 */
export interface ExtendedBatchScrapeOptions extends BatchScrapeOptions {
  /** 抓取策略类型 */
  strategy: ScrapeStrategyType
}

/**
 * 默认批量抓取选项
 */
export const DEFAULT_BATCH_OPTIONS: ExtendedBatchScrapeOptions = {
  concurrency: 2,
  timeout: 30000,
  retryCount: 1,
  delayBetweenRequests: 500,
  strategy: "fetch"
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
  private options: ExtendedBatchScrapeOptions
  private strategy: ScrapeStrategy

  constructor(options: Partial<ExtendedBatchScrapeOptions> = {}) {
    this.options = { ...DEFAULT_BATCH_OPTIONS, ...options }
    this.strategy = createScrapeStrategy(this.options.strategy)
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
   * 带重试逻辑的抓取
   */
  private async scrapeWithRetry(url: string): Promise<BatchScrapeResult> {
    let lastResult: BatchScrapeResult | null = null

    for (let attempt = 0; attempt <= this.options.retryCount; attempt++) {
      if (attempt > 0) {
        debugLog(`[BatchScrape] 第 ${attempt} 次重试: ${url}`)
        await delay(this.options.delayBetweenRequests)
      }

      lastResult = await this.strategy.scrape(url, {
        timeout: this.options.timeout,
        retryCount: this.options.retryCount
      })

      if (lastResult.success) {
        return lastResult
      }
    }

    return lastResult!
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

    // 初始化策略
    await this.strategy.initialize?.()

    // 初始化进度
    const progress: BatchProgress = {
      total,
      completed: 0,
      current: null,
      results: [],
      startTime,
      isPaused: false
    }

    onProgress({ ...progress })

    try {
      // 根据策略是否支持并发决定处理方式
      const concurrency = this.strategy.supportsConcurrency
        ? this.options.concurrency
        : 1

      // 按并发数分批处理
      for (let i = 0; i < links.length; i += concurrency) {
        // 检查是否取消
        if (this.isCancelled) {
          debugLog("[BatchScrape] 已取消")
          break
        }

        // 等待暂停状态结束
        await this.waitIfPaused()
        progress.isPaused = this.isPaused

        // 获取当前批次的链接
        const batch = links.slice(i, i + concurrency)

        // 并行抓取当前批次
        const batchPromises = batch.map(async (link) => {
          // 更新当前进度
          progress.current = {
            url: link.url,
            status: "fetching"
          }
          onProgress({ ...progress })

          // 执行抓取
          const result = await this.scrapeWithRetry(link.url)

          // 更新结果
          progress.results.push({
            url: result.url,
            status: result.success ? "success" : "failed",
            title: result.title,
            error: result.error
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
        if (i + concurrency < links.length && !this.isCancelled) {
          await delay(this.options.delayBetweenRequests)
        }
      }
    } finally {
      // 清理策略
      await this.strategy.cleanup?.()
    }

    debugLog("[BatchScrape] 完成", {
      total: results.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      strategy: this.options.strategy
    })

    return results
  }
}

/**
 * 简化的批量抓取函数
 */
export async function batchScrape(
  links: ExtractedLink[],
  options: Partial<ExtendedBatchScrapeOptions> = {},
  onProgress: (progress: BatchProgress) => void
): Promise<{
  results: BatchScrapeResult[]
  controller: BatchScrapeController
}> {
  const controller = new BatchScrapeController(options)
  const results = await controller.execute(links, onProgress)
  return { results, controller }
}
