import { generateText } from "@xsai/generate-text"
import type { StreamTextChunkResult, StreamTextResult } from "@xsai/stream-text"
import { useCallback, useLayoutEffect, useState } from "react"
import { isMobile } from "react-device-detect"
import { toast } from "react-toastify"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import type { ScrapedContent } from "~constants/types"
import {
  addAiChatHistoryItem,
  generateSummary,
  getAiConfig
} from "~utils/ai-service"
import { debugLog } from "~utils/logger"
import { processTemplate } from "~utils/template"

// 创建存储实例
const storage = new Storage({ area: "sync" })

/**
 * AI 摘要生成钩子返回值类型
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
  generateSummaryText: () => Promise<void>
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

  // 保存聊天历史记录
  const saveToHistory = useCallback(
    async (text: string, currentUsage: UseAiSummaryResult["usage"]) => {
      try {
        // 添加详细的日志
        debugLog("开始保存历史记录，参数:", {
          textLength: text?.length || 0,
          hasText: !!text,
          hasUrl: !!scrapedData?.url,
          url: scrapedData?.url,
          promptLength: customPrompt?.length || 0,
          usage: currentUsage
        })

        // 只有当有文本内容和scrapedData时才保存
        if (text && scrapedData?.url) {
          debugLog("条件满足，准备调用 addAiChatHistoryItem")

          // 计算处理后的提示词
          let processedPromptForHistory = customPrompt
          if (customPrompt) {
            try {
              processedPromptForHistory = processTemplate(
                customPrompt,
                scrapedData
              )
            } catch (templateError) {
              console.error("处理历史记录的模板时出错:", templateError)
              debugLog("处理历史记录模板错误，将使用原始prompt")
            }
          }

          const historyItem = {
            url: scrapedData.url,
            prompt: customPrompt,
            processedPrompt: processedPromptForHistory,
            content: text,
            usage: currentUsage || undefined
          }
          debugLog("历史记录项:", historyItem)

          // 设置超时处理
          const timeoutPromise = new Promise<void>((_, reject) => {
            setTimeout(() => {
              reject(new Error("保存历史记录超时"))
            }, 5000) // 5秒超时
          })

          try {
            // 使用Promise.race同时处理正常保存和超时情况
            await Promise.race([
              addAiChatHistoryItem(historyItem),
              timeoutPromise
            ])
            debugLog("已保存到聊天历史记录")
          } catch (innerError) {
            if (innerError.message === "保存历史记录超时") {
              debugLog("保存历史记录超时，将重试一次")
              // 超时后再尝试一次不带超时的保存
              try {
                await addAiChatHistoryItem(historyItem)
                debugLog("重试保存历史记录成功")
              } catch (retryError) {
                debugLog("重试保存历史记录失败:", retryError)
                throw retryError
              }
            } else {
              debugLog("保存历史记录失败，非超时错误:", innerError)
              throw innerError
            }
          }
        } else {
          debugLog("条件不满足，无法保存历史记录", {
            hasText: !!text,
            hasUrl: !!scrapedData?.url
          })
        }
      } catch (error) {
        console.error("保存聊天历史记录失败:", error)
        debugLog("保存历史记录详细错误:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
    },
    [customPrompt, scrapedData]
  )

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

    let fullText = ""
    let currentUsage = null
    let savedToHistory = false

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

      // 根据是否为移动端选择不同的生成方式
      if (isMobile) {
        // 移动端使用非流式生成
        // TODO: 移动端流式输出好像有问题，等后续 debug，先打补丁
        debugLog("检测到移动设备，使用直接生成方式")

        // 获取AI配置信息
        const config = await getAiConfig()

        // 调用generateText直接生成文本
        const { text, usage } = await generateText({
          apiKey: apiKey,
          baseURL: config.baseURL || "https://api.openai.com/v1/",
          messages: [
            {
              content: config.systemPrompt || "你是一个有用的助手",
              role: "system"
            },
            {
              content: processedPrompt + "\n\n内容: " + content,
              role: "user"
            }
          ],
          model: config.model || "gpt-3.5-turbo"
        })

        // 设置生成的文本
        fullText = text
        setSummary(text)
        setStreamingText(text)
        onSummaryGenerated?.(text)

        // 设置token使用情况
        if (usage) {
          const newUsage = {
            total_tokens: usage.total_tokens,
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens
          }
          setUsage(newUsage)
          currentUsage = newUsage
        }

        // 保存到历史记录
        await saveToHistory(text, currentUsage)
        savedToHistory = true
        setError(null)
      } else {
        // 桌面端使用流式生成
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
                    const newUsage = {
                      total_tokens: chunk.usage.total_tokens,
                      prompt_tokens: chunk.usage.prompt_tokens,
                      completion_tokens: chunk.usage.completion_tokens
                    }
                    setUsage(newUsage)
                    currentUsage = newUsage
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
            const textStream =
              result.textStream as unknown as AsyncIterable<string>

            // 处理文本流
            debugLog("开始处理textStream...")
            let chunkCount = 0

            try {
              for await (const textPart of textStream) {
                chunkCount++
                // 每接收 20 个文本块打印一次日志，避免日志过多
                if (chunkCount % 20 === 0 || chunkCount <= 2) {
                  debugLog(`接收到第${chunkCount}个文本块:`, {
                    length: textPart.length,
                    preview:
                      textPart.slice(0, 20) +
                      (textPart.length > 20 ? "..." : "")
                  })
                }

                fullText += textPart
                setStreamingText((prev) => prev + textPart)
              }

              debugLog(
                `textStream 处理完成，共接收${chunkCount}个文本块，最终文本长度:${fullText?.length}`
              )
            } catch (textStreamError) {
              console.error("textStream 处理出错:", textStreamError)
              debugLog("textStream 处理详细错误:", {
                name: textStreamError.name,
                message: textStreamError.message,
                stack: textStreamError.stack
              })
              // 即使textStream出错，但如果我们已经收集了一些文本，我们也应该使用它
              debugLog(
                "尽管 textStream 出错，仍将使用已收集的文本，长度:",
                fullText.length
              )
            }

            // 无论流处理是否成功，都使用收集的文本
            if (fullText) {
              // 流处理完成后使用收集的完整文本
              setSummary(fullText)
              onSummaryGenerated?.(fullText)
              debugLog("处理完成，最终文本长度:", fullText.length)

              // 获取当前usage状态用于保存历史记录
              const usageForSave = currentUsage || usage || null

              debugLog("准备保存历史记录，当前状态:", {
                fullTextLength: fullText?.length || 0,
                hasFullText: !!fullText,
                hasScrapedData: !!scrapedData,
                hasUrl: !!scrapedData?.url,
                usage: usageForSave
              })

              // 保存到历史记录
              try {
                await saveToHistory(fullText, usageForSave)
                savedToHistory = true
                debugLog("成功保存到历史记录")
              } catch (saveError) {
                console.error("保存历史记录失败:", saveError)
                debugLog("保存历史记录失败:", saveError)
              }
            }
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
      }
    } catch (error) {
      setError(error.message || "未知错误")
      setResult(null)
      setStreamingText("")
      console.error("摘要生成失败:", error)

      // 如果在整体过程中出错，但已经收集了一些文本，仍然尝试设置并保存
      if (fullText && !savedToHistory) {
        debugLog(
          "尽管生成过程出错，但尝试保存已收集的文本，长度:",
          fullText.length
        )
        setSummary(fullText)
        onSummaryGenerated?.(fullText)

        try {
          await saveToHistory(fullText, currentUsage)
        } catch (finalSaveError) {
          debugLog("最终尝试保存历史记录失败:", finalSaveError)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [
    content,
    customPrompt,
    apiKey,
    onSummaryGenerated,
    scrapedData,
    usage,
    saveToHistory
  ])

  return {
    result,
    summary,
    streamingText,
    isLoading,
    error,
    customPrompt,
    setCustomPrompt,
    systemPrompt,
    generateSummaryText,
    saveAsDefaultPrompt,
    usage
  }
}
