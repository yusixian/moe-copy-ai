import { sendToBackground } from "@plasmohq/messaging"

import type { BatchScrapeResult } from "~constants/types"

import { debugLog } from "../logger"
import type { ScrapeOptions, ScrapeStrategy } from "./types"

/**
 * 从 URL 提取标题（备用）
 */
function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/").filter(Boolean)
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1]
      return decodeURIComponent(
        lastPart.replace(/[-_]/g, " ").replace(/\.\w+$/, "")
      )
    }
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * 后台标签页策略
 * 创建后台标签页进行抓取，支持并发
 * 优点：能获取需要 JS 渲染的页面、共享浏览器 session
 * 缺点：会创建多个标签页、资源消耗较大
 */
export class BackgroundTabsStrategy implements ScrapeStrategy {
  readonly type = "background-tabs" as const
  readonly supportsConcurrency = true

  async scrape(
    url: string,
    options: ScrapeOptions
  ): Promise<BatchScrapeResult> {
    try {
      debugLog(`[BackgroundTabsStrategy] 开始抓取: ${url}`)

      const response = await sendToBackground<
        { url: string; timeout: number; background: boolean },
        { success: boolean; title?: string; content?: string; error?: string }
      >({
        name: "scrapeViaTab",
        body: {
          url,
          timeout: options.timeout,
          background: true
        }
      })

      if (!response.success) {
        throw new Error(response.error || "抓取失败")
      }

      debugLog(`[BackgroundTabsStrategy] 抓取成功: ${url}`)

      return {
        url,
        success: true,
        title: response.title || extractTitleFromUrl(url),
        content: response.content || "",
        method: "background-tabs"
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "未知错误"
      debugLog(`[BackgroundTabsStrategy] 抓取失败: ${url}`, errorMessage)

      return {
        url,
        success: false,
        title: extractTitleFromUrl(url),
        content: "",
        error: errorMessage,
        method: "background-tabs"
      }
    }
  }
}
