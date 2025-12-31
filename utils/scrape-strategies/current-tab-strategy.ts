import { sendToBackground } from '@plasmohq/messaging'

import type { BatchScrapeResult } from '~constants/types'

import { debugLog } from '../logger'
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
 * 当前标签页策略
 * 在用户当前标签页中依次导航访问每个 URL
 * 优点：用户可见过程、完全模拟用户行为、适合需要登录的页面
 * 缺点：不支持并发、会占用用户当前标签页
 */
export class CurrentTabStrategy implements ScrapeStrategy {
  readonly type = 'current-tab' as const
  readonly supportsConcurrency = false

  private currentTabId: number | null = null
  private originalUrl: string | null = null

  async initialize(): Promise<void> {
    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      this.currentTabId = tab.id
      this.originalUrl = tab.url || null
      debugLog(`[CurrentTabStrategy] 初始化，使用标签页: ${tab.id}`)
    }
  }

  async cleanup(): Promise<void> {
    // 抓取完成后，导航回原始页面
    if (this.currentTabId && this.originalUrl) {
      try {
        await chrome.tabs.update(this.currentTabId, { url: this.originalUrl })
        debugLog(`[CurrentTabStrategy] 已恢复原始页面: ${this.originalUrl}`)
      } catch (error) {
        debugLog(`[CurrentTabStrategy] 恢复原始页面失败:`, error)
      }
    }
    this.currentTabId = null
    this.originalUrl = null
  }

  async scrape(url: string, options: ScrapeOptions): Promise<BatchScrapeResult> {
    if (!this.currentTabId) {
      return {
        url,
        success: false,
        title: extractTitleFromUrl(url),
        content: '',
        error: '无法获取当前标签页',
        method: 'current-tab',
      }
    }

    try {
      debugLog(`[CurrentTabStrategy] 开始抓取: ${url}`)

      const response = await sendToBackground<
        { url: string; timeout: number; background: boolean; tabId: number },
        { success: boolean; title?: string; content?: string; error?: string }
      >({
        name: 'scrapeViaTab',
        body: {
          url,
          timeout: options.timeout,
          background: false,
          tabId: this.currentTabId,
        },
      })

      if (!response.success) {
        throw new Error(response.error || '抓取失败')
      }

      debugLog(`[CurrentTabStrategy] 抓取成功: ${url}`)

      return {
        url,
        success: true,
        title: response.title || extractTitleFromUrl(url),
        content: response.content || '',
        method: 'current-tab',
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      debugLog(`[CurrentTabStrategy] 抓取失败: ${url}`, errorMessage)

      return {
        url,
        success: false,
        title: extractTitleFromUrl(url),
        content: '',
        error: errorMessage,
        method: 'current-tab',
      }
    }
  }
}
