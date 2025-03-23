import { type GenerateTextResult } from "@xsai/generate-text"
import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { toast } from "react-toastify"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import type { ScrapedContent } from "~constants/types"
import { generateSummary, getAiConfig } from "~utils/ai-service"
import { debugLog } from "~utils/logger"
import { processTemplate } from "~utils/template"

// 创建存储实例
const storage = new Storage({ area: "sync" })

/**
 * AI摘要生成钩子返回值类型
 */
export interface UseAiSummaryResult {
  /** 生成的摘要内容 */
  summary: string
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null
  /** 自定义提示词 */
  customPrompt: string
  /** 设置自定义提示词 */
  setCustomPrompt: (prompt: string) => void
  /** 系统默认提示词 */
  systemPrompt: string
  /** 生成摘要的方法 */
  generateSummary: () => Promise<void>
  /** 保存为系统默认提示词 */
  saveAsDefaultPrompt: (prompt: string) => Promise<void>
}

/**
 * 自定义hook，用于处理AI摘要生成相关的逻辑
 *
 * @param content 需要生成摘要的内容
 * @param onSummaryGenerated 摘要生成后的回调函数
 * @param scrapedData 抓取的数据，用于替换模板中的占位符
 * @returns 与AI摘要相关的状态和方法
 */
export const useAiSummary = (
  content: string,
  onSummaryGenerated?: (summary: string) => void,
  scrapedData?: ScrapedContent
): UseAiSummaryResult => {
  const [isLoading, setIsLoading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const [summary, setSummary] = useState("")
  const [apiKey] = useStorage<string>("ai_api_key", "")
  const [error, setError] = useState<string | null>(null)
  const [systemPrompt, setSystemPrompt] = useState("")

  const fetchSystemPrompt = useCallback(async () => {
    if (!customPrompt) {
      try {
        const config = await getAiConfig()
        setSystemPrompt(config.systemPrompt)
        setCustomPrompt(config.systemPrompt)
      } catch (error) {
        console.error("获取系统提示词失败:", error)
      }
    }
  }, [customPrompt])

  // 保存系统默认提示词
  const saveAsDefaultPrompt = useCallback(async (prompt: string) => {
    try {
      await storage.set("ai_system_prompt", prompt)
      setSystemPrompt(prompt)
      toast.success("成功保存为系统默认提示词 (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧")
    } catch (error) {
      toast.error("保存默认提示词失败 (╥﹏╥)")
      console.error("保存默认提示词出错:", error)
    }
  }, [])

  // 当自定义提示词为空时，获取系统提示词
  useLayoutEffect(() => {
    fetchSystemPrompt()
  }, [])

  // 处理摘要生成
  const generateSummaryText = useCallback(async () => {
    if (!content.trim()) {
      setError("内容为空，无法生成摘要")
      toast.warning("内容为空，无法生成摘要")
      return
    }

    if (!apiKey) {
      setError("请先在扩展设置中配置AI提供商信息")
      toast.error("请先在扩展设置中配置AI提供商信息")
      return
    }

    try {
      setIsLoading(true)
      setSummary("")

      // 处理自定义提示词中的模板变量
      let processedPrompt = customPrompt
      if (scrapedData && customPrompt) {
        processedPrompt = processTemplate(customPrompt, scrapedData)
      }
      debugLog("processedPrompt", processedPrompt)
      // 使用生成API
      const result = await generateSummary(
        content,
        processedPrompt || undefined
      )
      if (result) {
        const summaryText = result.text
        setSummary(summaryText)
        if (onSummaryGenerated) {
          onSummaryGenerated(summaryText)
        }
        setError(null)
      } else {
        throw new Error("生成摘要失败")
      }
    } catch (error) {
      setError(error.message || "未知错误")
      console.error("摘要生成失败:", error)
    } finally {
      setIsLoading(false)
    }
  }, [content, customPrompt, apiKey, onSummaryGenerated, scrapedData])

  return {
    summary,
    isLoading,
    error,
    customPrompt,
    setCustomPrompt,
    systemPrompt,
    generateSummary: generateSummaryText,
    saveAsDefaultPrompt
  }
}
