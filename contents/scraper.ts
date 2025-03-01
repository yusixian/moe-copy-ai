// 网页内容抓取器
import { config } from "./config"
import { scrapeWebpageContent } from "./extractor"
import type { Message } from "./types"
import { debugLog } from "./utils"

// 导出配置
export { config }

// 在页面加载完成后执行一次抓取，并在控制台输出结果
window.addEventListener("load", () => {
  debugLog("页面加载完成，执行初始抓取")
  const initialData = scrapeWebpageContent()
  debugLog("初始抓取结果:", initialData)
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
