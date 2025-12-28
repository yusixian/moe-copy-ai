import type { PlasmoMessaging } from "@plasmohq/messaging"

import { debugLog } from "~utils/logger"
import { getExtractionMode, getReadabilityConfig } from "~utils/storage"

export interface ScrapeViaTabRequest {
  url: string
  timeout?: number
  /** 是否在后台打开（不激活标签页） */
  background?: boolean
  /** 使用现有标签页 ID（用于 current-tab 策略） */
  tabId?: number
}

export interface ScrapeViaTabResponse {
  success: boolean
  title?: string
  content?: string
  error?: string
}

/**
 * 通过标签页导航抓取内容
 * 支持创建新标签页或使用现有标签页
 */
const handler: PlasmoMessaging.MessageHandler<ScrapeViaTabRequest, ScrapeViaTabResponse> = async (req, res) => {
  const { url, timeout = 30000, background = true, tabId: existingTabId } = req.body || {}

  if (!url) {
    return res.send({ success: false, error: "URL 不能为空" })
  }

  let tabId: number | undefined = existingTabId
  let shouldCloseTab = false

  try {
    debugLog(`[ScrapeViaTab] 开始抓取: ${url}`)

    // 如果没有提供现有标签页，创建新标签页
    if (!tabId) {
      const tab = await chrome.tabs.create({
        url,
        active: !background,
      })
      tabId = tab.id
      shouldCloseTab = true
      debugLog(`[ScrapeViaTab] 创建新标签页: ${tabId}`)
    } else {
      // 使用现有标签页，导航到目标 URL
      await chrome.tabs.update(tabId, { url })
      debugLog(`[ScrapeViaTab] 使用现有标签页导航: ${tabId}`)
    }

    if (!tabId) {
      return res.send({ success: false, error: "无法创建或获取标签页" })
    }

    // 等待页面加载完成
    await waitForTabLoad(tabId, timeout)
    debugLog(`[ScrapeViaTab] 页面加载完成: ${url}`)

    // 获取抓取配置
    const extractionMode = await getExtractionMode()
    const readabilityConfig = getReadabilityConfig()

    // 向内容脚本发送抓取请求
    const response = await new Promise<any>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("内容抓取超时"))
      }, timeout)

      chrome.tabs.sendMessage(
        tabId!,
        {
          action: "scrapeContent",
          mode: extractionMode,
          readabilityConfig,
        },
        (result) => {
          clearTimeout(timeoutId)
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message || "内容脚本通信失败"))
          } else {
            resolve(result)
          }
        }
      )
    })

    debugLog(`[ScrapeViaTab] 抓取成功: ${url}`)

    // 关闭标签页（如果是新创建的）
    if (shouldCloseTab && tabId) {
      await chrome.tabs.remove(tabId).catch(() => {
        // 忽略关闭标签页的错误
      })
    }

    res.send({
      success: true,
      title: response?.title || "",
      content: response?.cleanedContent || response?.articleContent || "",
    })
  } catch (error) {
    debugLog(`[ScrapeViaTab] 抓取失败: ${url}`, error)

    // 尝试关闭标签页
    if (shouldCloseTab && tabId) {
      await chrome.tabs.remove(tabId).catch(() => {})
    }

    res.send({
      success: false,
      error: error instanceof Error ? error.message : "未知错误",
    })
  }
}

/**
 * 等待标签页加载完成
 */
function waitForTabLoad(tabId: number, timeout: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener)
      reject(new Error("页面加载超时"))
    }, timeout)

    const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        clearTimeout(timeoutId)
        chrome.tabs.onUpdated.removeListener(listener)
        // 给页面一点时间执行初始化脚本
        setTimeout(resolve, 500)
      }
    }

    chrome.tabs.onUpdated.addListener(listener)

    // 检查标签页是否已经加载完成
    chrome.tabs.get(tabId).then((tab) => {
      if (tab.status === "complete") {
        clearTimeout(timeoutId)
        chrome.tabs.onUpdated.removeListener(listener)
        setTimeout(resolve, 500)
      }
    }).catch(reject)
  })
}

export default handler
