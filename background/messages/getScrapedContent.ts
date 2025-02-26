// 消息处理程序用于获取网页内容
import type { PlasmoMessaging } from "@plasmohq/messaging"

// 处理获取抓取内容的消息
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab?.id) {
      return res.send({
        success: false,
        error: "找不到活动标签页"
      })
    }

    // 向内容脚本发送消息请求抓取内容
    chrome.tabs.sendMessage(tab.id, { action: "scrapeContent" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("发送消息时出错:", chrome.runtime.lastError)
        res.send({
          success: false,
          error: chrome.runtime.lastError.message || "无法连接到内容脚本"
        })
      } else {
        // 将抓取的数据发送回弹出窗口
        res.send({
          success: true,
          data: response
        })
      }
    })
  } catch (error) {
    console.error("处理消息时出错:", error)
    res.send({
      success: false,
      error: error.message || "未知错误"
    })
  }
}

export default handler
