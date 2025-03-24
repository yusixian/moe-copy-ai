import type { StreamTextChunkResult, StreamTextResult } from "@xsai/stream-text"
import { useCallback, useLayoutEffect, useState } from "react"
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
  result: StreamTextResult | null
  /** 生成的摘要内容 */
  summary: string
  /** 流式显示的文本 */
  streamingText: string
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
  /** Token使用情况 */
  usage: {
    total_tokens?: number
    prompt_tokens?: number
    completion_tokens?: number
  } | null
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
  const [result, setResult] = useState<StreamTextResult | null>(null)
  const [streamingText, setStreamingText] = useState("")
  const [summary, setSummary] = useState("")
  const [usage, setUsage] = useState<UseAiSummaryResult["usage"]>(null)
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
      setResult(null)
      setStreamingText("")
      // 处理自定义提示词中的模板变量
      let processedPrompt = customPrompt
      if (scrapedData && customPrompt) {
        processedPrompt = processTemplate(customPrompt, scrapedData)
      }
      debugLog("processedPrompt", processedPrompt)
      const result = await generateSummary(processedPrompt)
      if (result) {
        debugLog("generateSummaryText result获取成功", result)
        debugLog("streamText返回值结构:", {
          textStream: typeof result.textStream,
          stepStream: typeof result.stepStream,
          chunkStream: typeof result.chunkStream,
          hasTextStream: !!result.textStream,
          hasStepStream: !!result.stepStream,
          hasChunkStream: !!result.chunkStream
        })

        // 保存结果对象
        setResult(result)
        setUsage(null) // 初始化usage

        // 使用流式接收文本和处理 usage
        try {
          // 处理 usage 流
          const chunkStream =
            result.chunkStream as unknown as AsyncIterable<StreamTextChunkResult>
          // TODO: 流这块还得完善，现在只是能跑！
          // 单独启动一个异步任务处理 chunkStream
          const processChunkStream = async () => {
            debugLog("开始处理 chunkStream 获取 usage...")

            try {
              for await (const chunk of chunkStream) {
                // 如果 chunk 中有 usage 信息，则更新 usage 状态
                if (chunk.usage) {
                  debugLog("接收到 usage 信息:", chunk.usage)
                  setUsage({
                    total_tokens: chunk.usage.total_tokens,
                    prompt_tokens: chunk.usage.prompt_tokens,
                    completion_tokens: chunk.usage.completion_tokens
                  })
                }
              }
              debugLog("chunkStream 处理完成")
            } catch (chunkError) {
              console.error("chunkStream 处理出错:", chunkError)
              debugLog("chunkStream 处理详细错误:", {
                name: chunkError.name,
                message: chunkError.message,
                stack: chunkError.stack
              })
            }
          }

          // 启动异步处理，但不等待它完成
          processChunkStream()

          // 处理文本流
          let fullText = ""
          const textStream =
            result.textStream as unknown as AsyncIterable<string>

          // 处理文本流
          debugLog("开始处理textStream...")
          let chunkCount = 0

          for await (const textPart of textStream) {
            chunkCount++
            // 每接收 20 个文本块打印一次日志，避免日志过多
            if (chunkCount % 20 === 0 || chunkCount <= 2) {
              debugLog(`接收到第${chunkCount}个文本块:`, {
                length: textPart.length,
                preview:
                  textPart.slice(0, 20) + (textPart.length > 20 ? "..." : "")
              })
            }

            fullText += textPart
            setStreamingText((prev) => prev + textPart)
          }

          debugLog(
            `textStream 处理完成，共接收${chunkCount}个文本块，最终文本长度:${fullText?.length}`
          )

          // 流处理完成后使用收集的完整文本
          setSummary(fullText)
          onSummaryGenerated?.(fullText)
          debugLog("流式生成全部完成，最终文本:", fullText)
        } catch (streamError) {
          console.error("流处理出错:", streamError)
          debugLog("流处理详细错误:", {
            name: streamError.name,
            message: streamError.message,
            stack: streamError.stack
          })
        }

        setError(null)
      } else {
        throw new Error("生成摘要失败")
      }
    } catch (error) {
      setError(error.message || "未知错误")
      setResult(null)
      setStreamingText("")
      console.error("摘要生成失败:", error)
    } finally {
      setIsLoading(false)
    }
  }, [content, customPrompt, apiKey, onSummaryGenerated, scrapedData])

  return {
    result,
    summary,
    streamingText,
    isLoading,
    error,
    customPrompt,
    setCustomPrompt,
    systemPrompt,
    generateSummary: generateSummaryText,
    saveAsDefaultPrompt,
    usage
  }
}
