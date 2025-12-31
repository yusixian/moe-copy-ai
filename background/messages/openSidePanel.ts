import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const windowId = req.sender?.tab?.windowId
    if (windowId) {
      await chrome.sidePanel.open({ windowId })
      res.send({ success: true })
    } else {
      res.send({ success: false, error: "No window ID" })
    }
  } catch (error) {
    console.error("打开侧边栏失败:", error)
    res.send({ success: false, error: error instanceof Error ? error.message : "未知错误" })
  }
}

export default handler
