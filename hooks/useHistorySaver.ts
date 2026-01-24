import { useCallback } from "react"

import type { ScrapedContent } from "~constants/types"
import { addAiChatHistoryItem } from "~utils/ai-service"
import { debugLog } from "~utils/logger"
import { processTemplate } from "~utils/template"

export interface UsageInfo {
  total_tokens?: number
  prompt_tokens?: number
  completion_tokens?: number
}

interface HistorySaveParams {
  text: string
  customPrompt: string
  scrapedData?: ScrapedContent
  usage: UsageInfo | null
}

/**
 * Hook for saving AI chat history with timeout and retry
 */
export function useHistorySaver() {
  const saveToHistory = useCallback(
    async ({ text, customPrompt, scrapedData, usage }: HistorySaveParams) => {
      try {
        debugLog("Starting to save history:", {
          textLength: text?.length || 0,
          hasText: !!text,
          hasUrl: !!scrapedData?.url,
          url: scrapedData?.url,
          promptLength: customPrompt?.length || 0,
          usage
        })

        if (!text || !scrapedData?.url) {
          debugLog("Conditions not met for saving history", {
            hasText: !!text,
            hasUrl: !!scrapedData?.url
          })
          return false
        }

        debugLog("Conditions met, preparing to save")

        // Process template for history
        let processedPromptForHistory = customPrompt
        if (customPrompt) {
          try {
            processedPromptForHistory = processTemplate(
              customPrompt,
              scrapedData
            )
          } catch (templateError) {
            console.error(
              "Error processing template for history:",
              templateError
            )
            debugLog("Template processing error, using original prompt")
          }
        }

        const historyItem = {
          url: scrapedData.url,
          prompt: customPrompt,
          processedPrompt: processedPromptForHistory,
          content: text,
          usage: usage || undefined
        }
        debugLog("History item:", historyItem)

        // Timeout handling
        const timeoutPromise = new Promise<void>((_, reject) => {
          setTimeout(() => {
            reject(new Error("Save history timeout"))
          }, 5000)
        })

        try {
          await Promise.race([
            addAiChatHistoryItem(historyItem),
            timeoutPromise
          ])
          debugLog("Saved to chat history")
          return true
        } catch (innerError) {
          if ((innerError as Error).message === "Save history timeout") {
            debugLog("Save history timeout, retrying once")
            try {
              await addAiChatHistoryItem(historyItem)
              debugLog("Retry save history success")
              return true
            } catch (retryError) {
              debugLog("Retry save history failed:", retryError)
              throw retryError
            }
          } else {
            debugLog("Save history failed, non-timeout error:", innerError)
            throw innerError
          }
        }
      } catch (error) {
        console.error("Failed to save chat history:", error)
        debugLog("Save history detailed error:", {
          name: (error as Error).name,
          message: (error as Error).message,
          stack: (error as Error).stack
        })
        return false
      }
    },
    []
  )

  return { saveToHistory }
}

export default useHistorySaver
