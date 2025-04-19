import { streamText } from "@xsai/stream-text"

import { Storage } from "@plasmohq/storage"

import { debugLog } from "./logger"

// 创建存储实例
const storage = new Storage({ area: "sync" })

// 获取AI配置
export async function getAiConfig() {
  try {
    const apiKey = await storage.get<string>("ai_api_key")
    const baseURL =
      (await storage.get<string>("ai_base_url")) || "https://api.openai.com/v1/"
    const systemPrompt =
      (await storage.get<string>("ai_system_prompt")) ||
      "摘要任务：提取核心观点并总结要点\n链接：{{url}}\n标题：{{title}}\n内容：{{cleanedContent}}"
    const model = (await storage.get<string>("ai_model")) || "gpt-3.5-turbo"

    return {
      apiKey,
      baseURL,
      systemPrompt,
      model
    }
  } catch (error) {
    debugLog("获取AI配置出错:", error)
    throw new Error("获取AI配置失败，请检查设置")
  }
}

// 生成文章摘要
export async function generateSummary(customPrompt?: string) {
  try {
    debugLog("开始生成摘要...")
    const { apiKey, baseURL, systemPrompt, model } = await getAiConfig()

    if (!apiKey) {
      throw new Error("未设置API密钥，请在设置中配置AI提供商信息")
    }

    const systemMessage = customPrompt || systemPrompt

    debugLog("模型:", model)
    debugLog("baseURL:", baseURL)

    const res = await streamText({
      apiKey,
      baseURL,
      model,
      messages: [
        {
          role: "user",
          content: systemMessage
        }
      ],
      streamOptions: {
        includeUsage: true // 启用 usage 统计
      }
    })

    debugLog("摘要生成成功")
    return res
  } catch (error) {
    debugLog("生成摘要出错:", error)
    return null
  }
}
