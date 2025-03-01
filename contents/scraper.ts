// 网页内容抓取器
import { Storage } from "@plasmohq/storage"

import { debugLog } from "../utils/logger"
import { config } from "./config"
import { scrapeWebpageContent } from "./extractor"
import type { Message } from "./types"

// 创建存储实例
const storage = new Storage({ area: "sync" })

// 导出配置
export { config }

// 在页面加载完成后，检查用户配置决定是否自动抓取
window.addEventListener("load", async () => {
  // 获取用户配置的抓取时机
  const scrapeTiming = (await storage.get<string>("scrape_timing")) || "auto"

  debugLog(`页面加载完成，抓取时机配置: ${scrapeTiming}`)

  // 如果配置为自动抓取，则执行抓取
  if (scrapeTiming === "auto") {
    debugLog("根据配置执行自动抓取")
    const initialData = scrapeWebpageContent()
    debugLog("初始抓取结果:", initialData)
  } else {
    debugLog("根据配置跳过自动抓取，等待用户手动触发")
  }
})

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener(
  (message: Message, sender, sendResponse) => {
    debugLog("内容脚本收到消息:", message)

    if (message.action === "scrapeContent") {
      debugLog("收到抓取内容请求，开始执行抓取")
      // 执行抓取并返回结果
      const scrapedData = scrapeWebpageContent()
      debugLog("抓取完成，准备发送响应")
      sendResponse(scrapedData)
      debugLog("响应已发送")
    }

    // 返回true表示异步响应
    return true
  }
)
