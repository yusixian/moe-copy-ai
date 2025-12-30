import type { PlasmoMessaging } from "@plasmohq/messaging"

import { debugLog } from "~utils/logger"

export interface ClickNextPageRequest {
  tabId: number
  nextPageXPath: string
  timeout?: number
}

export interface ClickNextPageResponse {
  success: boolean
  hasNextPage: boolean
  newUrl?: string
  error?: string
}

/**
 * 使用 XPath 查找元素
 */
function findElementByXPath(xpath: string): Element | null {
  try {
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
    return result.singleNodeValue as Element | null
  } catch {
    return null
  }
}

/**
 * 点击下一页按钮并等待页面加载
 */
const handler: PlasmoMessaging.MessageHandler<ClickNextPageRequest, ClickNextPageResponse> = async (req, res) => {
  const { tabId, nextPageXPath, timeout = 10000 } = req.body || {}

  if (!tabId || !nextPageXPath) {
    return res.send({ success: false, hasNextPage: false, error: "tabId 和 nextPageXPath 不能为空" })
  }

  try {
    console.log(`[ClickNextPage] 在标签页 ${tabId} 点击下一页: ${nextPageXPath}`)

    // 先检查下一页按钮是否存在
    const checkResults = await chrome.scripting.executeScript({
      target: { tabId },
      func: (xpath: string) => {
        const findElement = (xp: string): Element | null => {
          try {
            const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            return result.singleNodeValue as Element | null
          } catch {
            return null
          }
        }

        const el = findElement(xpath)

        if (!el) return { exists: false }

        // 检查是否被禁用
        const isDisabled =
          el.hasAttribute('disabled') ||
          el.classList.contains('disabled') ||
          el.getAttribute('aria-disabled') === 'true'

        return { exists: true, isDisabled }
      },
      args: [nextPageXPath],
    })

    const checkResult = checkResults[0]?.result
    console.log(`[ClickNextPage] 检查结果:`, checkResult)
    if (!checkResult?.exists) {
      console.log(`[ClickNextPage] 下一页按钮不存在`)
      return res.send({ success: true, hasNextPage: false })
    }

    if (checkResult.isDisabled) {
      console.log(`[ClickNextPage] 下一页按钮已禁用`)
      return res.send({ success: true, hasNextPage: false })
    }

    // 获取当前 URL 用于比较
    const tab = await chrome.tabs.get(tabId)
    const originalUrl = tab.url

    // 点击下一页按钮
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (xpath: string) => {
        const findElement = (xp: string): Element | null => {
          try {
            const result = document.evaluate(xp, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
            return result.singleNodeValue as Element | null
          } catch {
            return null
          }
        }

        const el = findElement(xpath)

        if (el && el instanceof HTMLElement) {
          el.click()
        }
      },
      args: [nextPageXPath],
    })

    // 等待页面加载完成
    await waitForNavigation(tabId, timeout, originalUrl)

    // 获取新 URL
    const newTab = await chrome.tabs.get(tabId)
    debugLog(`[ClickNextPage] 导航完成，新 URL: ${newTab.url}`)

    res.send({
      success: true,
      hasNextPage: true,
      newUrl: newTab.url,
    })
  } catch (error) {
    debugLog(`[ClickNextPage] 失败:`, error)
    res.send({
      success: false,
      hasNextPage: false,
      error: error instanceof Error ? error.message : "点击下一页失败",
    })
  }
}

/**
 * 等待页面导航完成
 */
function waitForNavigation(tabId: number, timeout: number, originalUrl?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener)
      // 超时但不报错，可能是单页应用不会触发导航
      resolve()
    }, timeout)

    let navigationStarted = false

    const listener = (updatedTabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (updatedTabId !== tabId) return

      // 检测到 URL 变化或加载状态变化
      if (changeInfo.url && changeInfo.url !== originalUrl) {
        navigationStarted = true
      }

      if (changeInfo.status === 'complete' && navigationStarted) {
        clearTimeout(timeoutId)
        chrome.tabs.onUpdated.removeListener(listener)
        // 给页面一点时间执行 JS
        setTimeout(resolve, 500)
      }
    }

    chrome.tabs.onUpdated.addListener(listener)

    // 如果是单页应用，可能不会触发真正的导航
    // 设置一个较短的检查间隔
    setTimeout(() => {
      if (!navigationStarted) {
        clearTimeout(timeoutId)
        chrome.tabs.onUpdated.removeListener(listener)
        // 即使没有导航也继续，因为可能是 AJAX 加载
        setTimeout(resolve, 1000)
      }
    }, 2000)
  })
}

export default handler
