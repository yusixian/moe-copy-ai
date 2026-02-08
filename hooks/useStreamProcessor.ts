import type { StreamTextResult } from "@xsai/stream-text"
import { useCallback, useState } from "react"

import { debugLog } from "~utils/logger"

import type { UsageInfo } from "./useHistorySaver"

interface StreamProcessResult {
  fullText: string
  usage: UsageInfo | null
}

/**
 * Hook for processing AI text streams
 */
export function useStreamProcessor() {
  const [streamingText, setStreamingText] = useState("")
  const [usage, setUsage] = useState<UsageInfo | null>(null)

  const resetStream = useCallback(() => {
    setStreamingText("")
    setUsage(null)
  }, [])

  const processStream = useCallback(
    async (result: StreamTextResult): Promise<StreamProcessResult> => {
      let fullText = ""

      debugLog("Starting to process textStream...")
      let chunkCount = 0

      const reader = result.textStream.getReader()
      try {
        while (true) {
          const { done, value: textPart } = await reader.read()
          if (done) break

          chunkCount++
          if (chunkCount % 20 === 0 || chunkCount <= 2) {
            debugLog(`Received chunk ${chunkCount}:`, {
              length: textPart.length,
              preview:
                textPart.slice(0, 20) + (textPart.length > 20 ? "..." : "")
            })
          }

          fullText += textPart
          setStreamingText((prev) => prev + textPart)
        }

        debugLog(
          `textStream processing complete, received ${chunkCount} chunks, final text length: ${fullText?.length}`
        )
      } catch (textStreamError) {
        console.error("textStream processing error:", textStreamError)
        debugLog("textStream processing detailed error:", {
          name: (textStreamError as Error).name,
          message: (textStreamError as Error).message,
          stack: (textStreamError as Error).stack
        })
        debugLog(
          "Despite textStream error, using collected text, length:",
          fullText.length
        )
      } finally {
        reader.releaseLock()
      }

      // Retrieve usage from the Promise (resolves after stream ends)
      let currentUsage: UsageInfo | null = null
      try {
        const usageResult = await result.usage
        if (usageResult) {
          debugLog("Received usage info:", usageResult)
          currentUsage = {
            total_tokens: usageResult.total_tokens,
            prompt_tokens: usageResult.prompt_tokens,
            completion_tokens: usageResult.completion_tokens
          }
          setUsage(currentUsage)
        }
      } catch (usageError) {
        debugLog("Failed to get usage:", usageError)
      }

      return { fullText, usage: currentUsage }
    },
    []
  )

  return {
    streamingText,
    usage,
    resetStream,
    processStream,
    setUsage
  }
}

export default useStreamProcessor
