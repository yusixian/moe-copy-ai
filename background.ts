import type { PlasmoMessaging } from "@plasmohq/messaging"

// 创建一个消息处理程序，用于转发内容脚本抓取的数据到弹出窗口
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("后台脚本收到请求:", req.name)

  if (req.name === "getScrapedContent") {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (!tab?.id) {
        console.error("找不到活动标签页")
        return res.send({ success: false, error: "找不到活动标签页" })
      }

      console.log("向内容脚本发送消息，tabId:", tab.id)

      // 使用Promise包装chrome.tabs.sendMessage调用
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "scrapeContent" },
          (result) => {
            if (chrome.runtime.lastError) {
              console.error("发送消息时出错:", chrome.runtime.lastError)
              reject(chrome.runtime.lastError)
            } else {
              console.log("内容脚本返回数据:", result)
              resolve(result)
            }
          }
        )
      })

      console.log("成功获取抓取数据，准备发送到弹出窗口:", response)

      // 将抓取的数据转发到弹出窗口
      res.send({
        success: true,
        data: response
      })
    } catch (error) {
      console.error("处理消息时出错:", error)
      res.send({
        success: false,
        error: error.message || "无法连接到内容脚本"
      })
    }
  }
}

export default handler
