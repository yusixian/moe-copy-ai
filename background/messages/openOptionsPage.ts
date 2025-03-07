// 消息处理程序用于打开选项页面
import type { PlasmoMessaging } from "@plasmohq/messaging"

// 处理打开选项页面的消息
const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    // 直接在background脚本中调用openOptionsPage
    chrome.runtime.openOptionsPage()

    // 返回成功消息
    res.send({
      success: true
    })
  } catch (error) {
    console.error("打开选项页面出错:", error)
    res.send({
      success: false,
      error: error.message || "未知错误"
    })
  }
}

export default handler
