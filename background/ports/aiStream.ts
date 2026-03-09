import type { PlasmoMessaging } from "@plasmohq/messaging"
import { streamText } from "@xsai/stream-text"

import { getAiConfig } from "~utils/ai-service"
import { debugLog } from "~utils/logger"

export interface AiStreamRequest {
  content: string
  processedPrompt: string
}

export type AiStreamResponse =
  | { type: "chunk"; text: string }
  | {
      type: "usage"
      usage: {
        total_tokens?: number
        prompt_tokens?: number
        completion_tokens?: number
      }
    }
  | { type: "done" }
  | { type: "error"; message: string }

const handler: PlasmoMessaging.PortHandler<
  AiStreamRequest,
  AiStreamResponse
> = async (req, res) => {
  try {
    const { content, processedPrompt } = req.body

    const { apiKey, baseURL, systemPrompt, model } = await getAiConfig()

    if (!apiKey) {
      res.send({ type: "error", message: "API key not configured" })
      return
    }

    if (!model) {
      res.send({ type: "error", message: "AI model not selected" })
      return
    }

    debugLog("Port aiStream: starting stream", { model, baseURL })

    const result = streamText({
      apiKey,
      baseURL,
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt || "你是一个有用的助手"
        },
        {
          role: "user",
          content: `${processedPrompt}\n\n内容: ${content}`
        }
      ],
      streamOptions: {
        includeUsage: true
      }
    })

    const reader = result.textStream.getReader()
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.send({ type: "chunk", text: value })
      }
    } finally {
      reader.releaseLock()
    }

    // Send usage after stream completes
    try {
      const usage = await result.usage
      if (usage) {
        res.send({
          type: "usage",
          usage: {
            total_tokens: usage.total_tokens,
            prompt_tokens: usage.prompt_tokens,
            completion_tokens: usage.completion_tokens
          }
        })
      }
    } catch (usageError) {
      debugLog("Port aiStream: failed to get usage", usageError)
    }

    res.send({ type: "done" })
    debugLog("Port aiStream: stream completed")
  } catch (error) {
    debugLog("Port aiStream: error", error)
    res.send({
      type: "error",
      message: (error as Error).message || "Unknown error"
    })
  }
}

export default handler
