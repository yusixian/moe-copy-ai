import type { ScrapeStrategyType } from "~constants/types"

import { BackgroundTabsStrategy } from "./background-tabs-strategy"
import { CurrentTabStrategy } from "./current-tab-strategy"
import { FetchStrategy } from "./fetch-strategy"
import type { ScrapeStrategy } from "./types"

export { BackgroundTabsStrategy } from "./background-tabs-strategy"
export { CurrentTabStrategy } from "./current-tab-strategy"
export { FetchStrategy } from "./fetch-strategy"
export type { ScrapeOptions, ScrapeStrategy } from "./types"

/**
 * 创建抓取策略实例
 */
export function createScrapeStrategy(type: ScrapeStrategyType): ScrapeStrategy {
  switch (type) {
    case "fetch":
      return new FetchStrategy()
    case "background-tabs":
      return new BackgroundTabsStrategy()
    case "current-tab":
      return new CurrentTabStrategy()
    default:
      throw new Error(`未知的抓取策略: ${type}`)
  }
}

/**
 * 获取策略的描述信息
 */
export function getStrategyInfo(type: ScrapeStrategyType): {
  name: string
  description: string
  supportsConcurrency: boolean
} {
  switch (type) {
    case "fetch":
      return {
        name: "Fetch API",
        description: "直接获取页面 HTML，速度快但无法处理 JS 渲染",
        supportsConcurrency: true
      }
    case "background-tabs":
      return {
        name: "后台标签页",
        description: "在后台标签页中加载页面，支持 JS 渲染和登录态",
        supportsConcurrency: true
      }
    case "current-tab":
      return {
        name: "当前标签页",
        description: "在当前标签页中依次访问，用户可见整个过程",
        supportsConcurrency: false
      }
    default:
      return {
        name: "未知",
        description: "未知策略",
        supportsConcurrency: false
      }
  }
}
