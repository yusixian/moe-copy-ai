import { streamText } from "@xsai/stream-text"

import { AiChatHistory, AiChatHistoryItem } from "~constants/types"
import { generateUUID } from "~utils"

import { debugLog } from "./logger"
import { localStorage, syncStorage } from "./storage"

// 获取AI配置
export async function getAiConfig() {
  try {
    const apiKey = await syncStorage.get<string>("ai_api_key")
    const baseURL =
      (await syncStorage.get<string>("ai_base_url")) ||
      "https://api.openai.com/v1/"
    const systemPrompt =
      (await syncStorage.get<string>("ai_system_prompt")) ||
      "摘要任务：提取核心观点并总结要点\n链接：{{url}}\n标题：{{title}}\n内容：{{cleanedContent}}"
    const model = (await syncStorage.get<string>("ai_model")) || "gpt-3.5-turbo"

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

// Storage对象是否已准备好
let isStorageReady = false

// 初始化存储系统
async function initStorage(): Promise<void> {
  try {
    debugLog("初始化本地存储...")
    // 尝试读写一个测试值来确认本地存储可用
    await localStorage.set("storage_test", { test: "ready" })
    const test = await localStorage.get<{ test: string } | undefined>(
      "storage_test"
    )
    if (
      test &&
      typeof test === "object" &&
      "test" in test &&
      test.test === "ready"
    ) {
      isStorageReady = true
      debugLog("本地存储初始化成功")
    } else {
      debugLog("本地存储初始化警告: 测试值验证失败", test)
    }
  } catch (error) {
    console.error("本地存储初始化失败:", error)
    debugLog("本地存储初始化错误:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }
}

// 立即初始化存储
initStorage()

// 获取AI聊天历史记录
export async function getAiChatHistory(): Promise<AiChatHistory> {
  try {
    debugLog("开始获取AI聊天历史记录, 存储准备状态:", isStorageReady)

    // 确保存储已初始化
    if (!isStorageReady) {
      await initStorage()
    }

    const history = await localStorage.get<AiChatHistory>("ai_chat_history")
    debugLog("获取到的历史记录:", {
      hasHistory: !!history,
      itemCount: history?.items?.length || 0
    })
    return history || { items: [] }
  } catch (error) {
    console.error("获取AI聊天历史记录失败:", error)
    debugLog("获取历史记录详细错误:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
    return { items: [] }
  }
}

// 添加AI聊天历史记录
export async function addAiChatHistoryItem(
  item: Omit<AiChatHistoryItem, "id" | "timestamp">
): Promise<void> {
  try {
    debugLog("开始添加AI聊天历史记录项:", {
      hasUrl: !!item.url,
      url: item.url,
      promptLength: item.prompt?.length || 0,
      contentLength: item.content?.length || 0,
      hasUsage: !!item.usage
    })

    // 检查storage对象
    debugLog("storage对象信息:", {
      type: typeof localStorage,
      area: (localStorage as any).area,
      isReady: isStorageReady,
      methods: Object.keys(localStorage)
    })

    // 确保存储已初始化
    if (!isStorageReady) {
      await initStorage()
    }

    const history = await getAiChatHistory()
    debugLog("当前历史记录状态:", {
      itemCount: history.items.length
    })

    const newItem: AiChatHistoryItem = {
      ...item,
      id: generateUUID(),
      timestamp: Date.now()
    }
    debugLog("创建的新历史记录项:", {
      id: newItem.id,
      timestamp: newItem.timestamp,
      url: newItem.url.substring(0, 50) + (newItem.url.length > 50 ? "..." : "")
    })

    // 添加到历史记录列表开头（最新的在最前面）
    history.items.unshift(newItem)

    // 限制历史记录数量，最多保存50条
    if (history.items.length > 50) {
      history.items = history.items.slice(0, 50)
    }

    // 尝试直接读取已保存历史记录进行比对
    const before = await localStorage.get<AiChatHistory | undefined>(
      "ai_chat_history"
    )
    debugLog("保存前的历史记录状态:", {
      exists: !!before,
      isObject: typeof before === "object",
      hasItems: before && "items" in before
    })

    debugLog("准备保存更新后的历史记录，项数:", history.items.length)
    try {
      // 使用简单对象保存，而不是复杂的类实例
      const simpleHistory = {
        items: history.items.map((item) => ({
          id: item.id,
          timestamp: item.timestamp,
          url: item.url,
          prompt: item.prompt,
          processedPrompt: item.processedPrompt,
          content: item.content,
          usage: item.usage
        }))
      }

      await localStorage.set("ai_chat_history", simpleHistory)
      // 验证保存是否成功
      const after = await localStorage.get<AiChatHistory | undefined>(
        "ai_chat_history"
      )
      debugLog("保存后的历史记录状态:", {
        exists: !!after,
        isObject: typeof after === "object",
        hasItems: after && "items" in after,
        itemCount: after?.items?.length || 0
      })
      debugLog("成功保存AI聊天历史记录")
    } catch (saveError) {
      debugLog("保存操作失败:", {
        name: saveError.name,
        message: saveError.message,
        stack: saveError.stack
      })
      throw saveError
    }
  } catch (error) {
    console.error("添加AI聊天历史记录失败:", error)
    debugLog("添加历史记录详细错误:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }
}

// 清空AI聊天历史记录
export async function clearAiChatHistory(): Promise<void> {
  try {
    debugLog("开始清空AI聊天历史记录")
    await localStorage.set("ai_chat_history", { items: [] })
    debugLog("成功清空AI聊天历史记录")
  } catch (error) {
    console.error("清空AI聊天历史记录失败:", error)
    debugLog("清空历史记录详细错误:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }
}

// 删除指定AI聊天历史记录
export async function deleteAiChatHistoryItem(id: string): Promise<void> {
  try {
    debugLog("开始删除AI聊天历史记录项, id:", id)
    const history = await getAiChatHistory()
    const beforeCount = history.items.length
    history.items = history.items.filter((item) => item.id !== id)
    const afterCount = history.items.length
    debugLog("过滤后的历史记录:", {
      beforeCount,
      afterCount,
      removed: beforeCount - afterCount
    })
    await localStorage.set("ai_chat_history", history)
    debugLog("成功删除AI聊天历史记录项")
  } catch (error) {
    console.error("删除AI聊天历史记录失败:", error)
    debugLog("删除历史记录详细错误:", {
      name: error.name,
      message: error.message,
      stack: error.stack
    })
  }
}
