import { usePort } from "@plasmohq/messaging/hook"
import { useCallback, useEffect, useRef, useState } from "react"

import type {
  AiStreamRequest,
  AiStreamResponse
} from "~background/ports/aiStream"
import { debugLog } from "~utils/logger"

import type { UsageInfo } from "./useHistorySaver"

interface PortStreamResult {
  text: string
  usage: UsageInfo | null
}

/**
 * Hook for streaming AI text via background port messaging.
 * Used in content script context to bypass CORS restrictions.
 *
 * Always call this hook (hooks can't be conditional),
 * but only invoke `startStream` when in content script context.
 */
export function usePortStream() {
  const [streamingText, setStreamingText] = useState("")
  const [usage, setUsage] = useState<UsageInfo | null>(null)

  const port = usePort<AiStreamRequest, AiStreamResponse>("aiStream")

  // Use refs to resolve/reject the stream promise from the listener
  const resolveRef = useRef<((result: PortStreamResult) => void) | null>(null)
  const rejectRef = useRef<((error: Error) => void) | null>(null)
  const accumulatedTextRef = useRef("")
  const usageRef = useRef<UsageInfo | null>(null)

  // Set up the port listener once
  useEffect(() => {
    const { port: chromePort, disconnect } = port.listen<AiStreamResponse>(
      (msg) => {
        switch (msg.type) {
          case "chunk":
            accumulatedTextRef.current += msg.text
            setStreamingText((prev) => prev + msg.text)
            break

          case "usage":
            usageRef.current = msg.usage as UsageInfo
            setUsage(msg.usage as UsageInfo)
            break

          case "done":
            debugLog(
              "Port stream completed, text length:",
              accumulatedTextRef.current.length
            )
            resolveRef.current?.({
              text: accumulatedTextRef.current,
              usage: usageRef.current
            })
            resolveRef.current = null
            rejectRef.current = null
            break

          case "error":
            debugLog("Port stream error:", msg.message)
            rejectRef.current?.(new Error(msg.message))
            resolveRef.current = null
            rejectRef.current = null
            break
        }
      }
    )

    // Reject pending promise if the port disconnects (e.g. service worker restart)
    const onDisconnect = (port: chrome.runtime.Port) => {
      if (resolveRef.current) {
        debugLog("Port disconnected while stream in progress")
        rejectRef.current?.(new Error("Port disconnected", { cause: port }))
        resolveRef.current = null
        rejectRef.current = null
      }
    }
    chromePort.onDisconnect.addListener(onDisconnect)

    return () => {
      disconnect()
      chromePort.onDisconnect.removeListener(onDisconnect)
    }
  }, [port])

  const resetStream = useCallback(() => {
    setStreamingText("")
    setUsage(null)
    accumulatedTextRef.current = ""
    usageRef.current = null
  }, [])

  const startStream = useCallback(
    (content: string, processedPrompt: string): Promise<PortStreamResult> => {
      resetStream()

      return new Promise<PortStreamResult>((resolve, reject) => {
        resolveRef.current = resolve
        rejectRef.current = reject
        port.send({ content, processedPrompt })
      })
    },
    [port, resetStream]
  )

  return {
    streamingText,
    usage,
    startStream,
    resetStream
  }
}

export default usePortStream
