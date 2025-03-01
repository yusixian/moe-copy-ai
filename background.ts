import type { PlasmoMessaging } from "@plasmohq/messaging"

import { logger } from "./contents/utils" // 导入logger

// 创建一个消息处理程序，用于转发内容脚本抓取的数据到弹出窗口
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  logger.info(`后台脚本收到请求: ${req.name}`)

  if (req.name === "getScrapedContent") {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (!tab?.id) {
        logger.error("找不到活动标签页")
        return res.send({ success: false, error: "找不到活动标签页" })
      }

      logger.info(`向内容脚本发送消息，tabId: ${tab.id}`)

      // 使用Promise包装chrome.tabs.sendMessage调用
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(
          tab.id,
          { action: "scrapeContent" },
          (result) => {
            if (chrome.runtime.lastError) {
              logger.error(
                `发送消息时出错: ${chrome.runtime.lastError.message}`
              )
              reject(chrome.runtime.lastError)
            } else {
              logger.debug("内容脚本返回数据:", result)
              resolve(result)
            }
          }
        )
      })

      logger.info("成功获取抓取数据，准备发送到弹出窗口")
      logger.debug("抓取数据详情:", { response })

      // 将抓取的数据转发到弹出窗口
      res.send({
        success: true,
        data: response
      })
    } catch (error) {
      logger.error("处理消息时出错:", error)
      res.send({
        success: false,
        error: error.message || "无法连接到内容脚本"
      })
    }
  }
}

export default handler
