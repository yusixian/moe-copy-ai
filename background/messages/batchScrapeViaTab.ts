// 消息处理程序：使用后台标签页抓取单个页面
import type { PlasmoMessaging } from '@plasmohq/messaging'

import { debugLog } from '~utils/logger'

interface BatchScrapeRequest {
  url: string
  timeout?: number
}

interface BatchScrapeResponse {
  success: boolean
  title?: string
  content?: string
  error?: string
}

const DEFAULT_TIMEOUT = 30000

const handler: PlasmoMessaging.MessageHandler<BatchScrapeRequest, BatchScrapeResponse> = async (
  req,
  res
) => {
  const { url, timeout = DEFAULT_TIMEOUT } = req.body || {}

  if (!url) {
    return res.send({
      success: false,
      error: '缺少 URL 参数',
    })
  }

  debugLog('[batchScrapeViaTab] 开始抓取:', url)

  let tabId: number | undefined
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  try {
    // 创建后台标签页
    const tab = await chrome.tabs.create({
      url,
      active: false, // 不激活标签页
    })

    tabId = tab.id

    if (!tabId) {
      throw new Error('无法创建标签页')
    }

    // 等待页面加载完成
    const loadPromise = new Promise<void>((resolve, reject) => {
      const listener = (
        updatedTabId: number,
        changeInfo: chrome.tabs.TabChangeInfo
      ) => {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener)
          resolve()
        }
      }

      chrome.tabs.onUpdated.addListener(listener)

      // 设置超时
      timeoutId = setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener)
        reject(new Error('页面加载超时'))
      }, timeout)
    })

    await loadPromise
    clearTimeout(timeoutId)

    // 页面加载完成后，等待一小段时间确保内容渲染
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 向标签页发送抓取消息
    const response = await new Promise<any>((resolve, reject) => {
      let settled = false

      const scrapeTimeoutId = setTimeout(() => {
        if (!settled) {
          settled = true
          reject(new Error('抓取超时'))
        }
      }, 10000)

      chrome.tabs.sendMessage(
        tabId!,
        {
          action: 'scrapeContent',
          mode: 'readability',
        },
        (result) => {
          if (settled) return
          settled = true
          clearTimeout(scrapeTimeoutId)

          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message || '内容脚本通信失败'))
          } else {
            resolve(result)
          }
        }
      )
    })

    debugLog('[batchScrapeViaTab] 抓取成功:', url)

    // 关闭标签页
    await chrome.tabs.remove(tabId)

    res.send({
      success: true,
      title: response?.title || '',
      content: response?.articleContent || '',
    })
  } catch (error) {
    debugLog('[batchScrapeViaTab] 抓取失败:', url, error)

    // 清理：尝试关闭标签页
    if (tabId) {
      try {
        await chrome.tabs.remove(tabId)
      } catch {
        // 忽略关闭失败
      }
    }

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    res.send({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    })
  }
}

export default handler
