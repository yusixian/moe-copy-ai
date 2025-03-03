import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import type { ScrapedContent, ScrapeResponse } from "~constants/types"
import { detectMarkdown } from "~utils"
import { formatContent } from "~utils/formatter"
import { logger } from "~utils/logger"

/**
 * 抓取数据钩子
 */
export const useScrapedData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [isMarkdown, setIsMarkdown] = useState(false)

  // 添加调试信息
  const addDebugInfo = (info: string) => {
    logger.debug(info)
    setDebugInfo((prev) => prev + "\n" + info)
  }

  // 获取抓取数据
  const fetchScrapedContent = async () => {
    try {
      setIsLoading(true)
      setError(null)
      addDebugInfo("开始请求抓取内容...")

      const response = await sendToBackground<any, ScrapeResponse>({
        name: "getScrapedContent"
      })

      addDebugInfo(
        "收到响应: " + JSON.stringify(response).substring(0, 100) + "..."
      )

      if (response && response.success && response.data) {
        addDebugInfo("抓取成功, 标题: " + response.data.title)

        // 处理文章内容，保留必要的格式
        if (response.data.articleContent) {
          response.data.articleContent = formatContent(
            response.data.articleContent
          )
        }

        setScrapedData(response.data)
        // 检测是否为 Markdown 内容
        if (response.data.articleContent) {
          setIsMarkdown(detectMarkdown(response.data.articleContent))
        }
      } else {
        const errorMsg = response?.error || "获取内容失败"
        addDebugInfo("抓取失败: " + errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error("抓取内容时出错:", err)
      addDebugInfo("抓取异常: " + JSON.stringify(err))
      setError("抓取内容时出错: " + (err.message || "未知错误"))
    } finally {
      setIsLoading(false)
    }
  }

  // 在组件挂载时抓取当前页面内容
  useEffect(() => {
    fetchScrapedContent()
  }, [])

  // 处理手动刷新
  const handleRefresh = () => {
    fetchScrapedContent()
  }

  return {
    isLoading,
    error,
    scrapedData,
    debugInfo,
    isMarkdown,
    handleRefresh
  }
}

export default useScrapedData
