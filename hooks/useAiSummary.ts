import { useStorage } from "@plasmohq/storage/hook"
import { generateText } from "@xsai/generate-text"
import type { StreamTextResult } from "@xsai/stream-text"
import { useCallback, useState } from "react"
import { isMobile } from "react-device-detect"
import { toast } from "react-toastify"

import type { ScrapedContent } from "~constants/types"
import { generateSummary, getAiConfig } from "~utils/ai-service"
import { useI18n } from "~utils/i18n"
import { debugLog } from "~utils/logger"
import { processTemplate } from "~utils/template"

import useAiPrompt from "./useAiPrompt"
import useHistorySaver, { type UsageInfo } from "./useHistorySaver"
import useStreamProcessor from "./useStreamProcessor"

export interface UseAiSummaryResult {
  result: StreamTextResult | null
  summary: string
  streamingText: string
  isLoading: boolean
  error: string | null
  customPrompt: string
  setCustomPrompt: (prompt: string) => void
  systemPrompt: string
  generateSummaryText: () => Promise<void>
  saveAsDefaultPrompt: (prompt: string) => Promise<void>
  usage: UsageInfo | null
  modelId: string | null
}

/**
 * Hook for AI summary generation
 * Composed from useAiPrompt, useStreamProcessor, and useHistorySaver hooks
 */
export const useAiSummary = (
  content: string,
  onSummaryGenerated?: (summary: string) => void,
  scrapedData?: ScrapedContent
): UseAiSummaryResult => {
  const { t } = useI18n()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<StreamTextResult | null>(null)
  const [summary, setSummary] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [apiKey] = useStorage<string>("ai_api_key", "")

  const {
    customPrompt,
    setCustomPrompt,
    systemPrompt,
    modelId,
    saveAsDefaultPrompt
  } = useAiPrompt()

  const { streamingText, usage, resetStream, processStream, setUsage } =
    useStreamProcessor()

  const { saveToHistory } = useHistorySaver()

  const generateSummaryText = useCallback(async () => {
    if (!content.trim()) {
      setError(t("error.emptyContentForSummary"))
      toast.warning(t("error.emptyContentForSummary"))
      return
    }

    if (!apiKey) {
      setError(t("error.aiConfigMissing"))
      toast.error(t("error.aiConfigMissing"))
      return
    }

    const config = await getAiConfig()
    if (!config.model) {
      setError(t("error.aiModelNotSelected"))
      toast.error(t("error.aiModelNotSelected"))
      return
    }

    let fullText = ""
    let currentUsage: UsageInfo | null = null
    let savedToHistory = false

    try {
      setIsLoading(true)
      setResult(null)
      resetStream()

      // Process template variables in prompt
      let processedPrompt = customPrompt
      if (scrapedData && customPrompt) {
        processedPrompt = processTemplate(customPrompt, scrapedData)
      }
      debugLog("processedPrompt", processedPrompt)

      if (isMobile) {
        // Mobile: use non-streaming generation
        debugLog("Mobile device detected, using direct generation")

        const { text, usage } = await generateText({
          apiKey: apiKey,
          baseURL: config.baseURL || "https://api.openai.com/v1/",
          messages: [
            {
              content: config.systemPrompt || "你是一个有用的助手",
              role: "system"
            },
            {
              content: `${processedPrompt}\n\n内容: ${content}`,
              role: "user"
            }
          ],
          model: config.model
        })

        fullText = text ?? ""
        setSummary(fullText)
        onSummaryGenerated?.(fullText)

        if (usage) {
          const newUsage = {
            total_tokens: usage.total_tokens,
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens
          }
          setUsage(newUsage)
          currentUsage = newUsage
        }

        await saveToHistory({
          text: fullText,
          customPrompt,
          scrapedData,
          usage: currentUsage
        })
        savedToHistory = true
        setError(null)
      } else {
        // Desktop: use streaming generation
        const streamResult = await generateSummary(processedPrompt)
        debugLog("generateSummaryText result obtained", streamResult)

        setResult(streamResult)

        const { fullText: processedText, usage: processedUsage } =
          await processStream(streamResult)

        fullText = processedText
        currentUsage = processedUsage

        if (fullText) {
          setSummary(fullText)
          onSummaryGenerated?.(fullText)
          debugLog("Processing complete, final text length:", fullText.length)

          const usageForSave = currentUsage || usage || null

          debugLog("Preparing to save history:", {
            fullTextLength: fullText.length,
            hasFullText: !!fullText,
            hasScrapedData: !!scrapedData,
            hasUrl: !!scrapedData?.url,
            usage: usageForSave
          })

          const saved = await saveToHistory({
            text: fullText,
            customPrompt,
            scrapedData,
            usage: usageForSave
          })
          savedToHistory = saved
          if (saved) {
            debugLog("Successfully saved to history")
          }
        }

        setError(null)
      }
    } catch (err) {
      setError((err as Error).message || "Unknown error")
      setResult(null)
      resetStream()
      console.error("Summary generation failed:", err)

      // Try to save collected text even if there was an error
      if (fullText && !savedToHistory) {
        debugLog(
          "Despite generation error, attempting to save collected text, length:",
          fullText.length
        )
        setSummary(fullText)
        onSummaryGenerated?.(fullText)

        await saveToHistory({
          text: fullText,
          customPrompt,
          scrapedData,
          usage: currentUsage
        })
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
    saveToHistory,
    resetStream,
    processStream,
    setUsage,
    t
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
    usage,
    modelId
  }
}
