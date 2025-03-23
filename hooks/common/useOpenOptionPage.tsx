import { useCallback } from "react"

import { sendToBackground } from "@plasmohq/messaging"

// 打开选项页面
export const useOpenOptionPage = () => {
  const handleOpenOptions = useCallback(() => {
    // 使用sendToBackground发送消息到background脚本打开选项页面
    sendToBackground({
      name: "openOptionsPage"
    }).catch((error) => {
      console.error("打开选项页面失败:", error)
    })
  }, [])

  return handleOpenOptions
}
