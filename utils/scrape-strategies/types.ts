import type { BatchScrapeResult, ScrapeStrategyType } from "~constants/types"

/**
 * 单页抓取选项
 */
export interface ScrapeOptions {
  timeout: number
  retryCount: number
}

/**
 * 抓取策略接口
 * 所有抓取策略必须实现此接口
 */
export interface ScrapeStrategy {
  /** 策略类型标识 */
  readonly type: ScrapeStrategyType

  /** 策略是否支持并发 */
  readonly supportsConcurrency: boolean

  /**
   * 抓取单个页面
   * @param url 目标 URL
   * @param options 抓取选项
   */
  scrape(url: string, options: ScrapeOptions): Promise<BatchScrapeResult>

  /**
   * 初始化策略（可选）
   * 用于创建标签页等准备工作
   */
  initialize?(): Promise<void>

  /**
   * 清理策略（可选）
   * 用于关闭标签页等清理工作
   */
  cleanup?(): Promise<void>
}

/**
 * 策略工厂函数类型
 */
export type ScrapeStrategyFactory = () => ScrapeStrategy
