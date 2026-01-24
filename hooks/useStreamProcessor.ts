import type { StreamTextChunkResult, StreamTextResult } from "@xsai/stream-text"
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
      let currentUsage: UsageInfo | null = null

      const chunkStream =
        result.chunkStream as unknown as AsyncIterable<StreamTextChunkResult>

      // Process chunk stream for usage info in background
      const processChunkStream = async () => {
        debugLog("Starting to process chunkStream for usage...")

        try {
          for await (const chunk of chunkStream) {
            if (chunk.usage) {
              debugLog("Received usage info:", chunk.usage)
              const newUsage = {
                total_tokens: chunk.usage.total_tokens,
                prompt_tokens: chunk.usage.prompt_tokens,
                completion_tokens: chunk.usage.completion_tokens
              }
              setUsage(newUsage)
              currentUsage = newUsage
            }
          }
          debugLog("chunkStream processing complete")
        } catch (chunkError) {
          console.error("chunkStream processing error:", chunkError)
          debugLog("chunkStream processing detailed error:", {
            name: (chunkError as Error).name,
            message: (chunkError as Error).message,
            stack: (chunkError as Error).stack
          })
        }
      }

      // Start async processing without waiting
      processChunkStream().catch(console.error)

      // Process text stream
      const textStream = result.textStream as unknown as AsyncIterable<string>

      debugLog("Starting to process textStream...")
      let chunkCount = 0

      try {
        for await (const textPart of textStream) {
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
