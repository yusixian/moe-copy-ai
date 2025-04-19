import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { Storage } from "@plasmohq/storage"

import type { AiChatHistory, AiChatHistoryItem } from "~constants/types"
import { debugLog } from "~utils/logger"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 检测内容是否为 Markdown
 */
export const detectMarkdown = (content: string): boolean => {
  if (!content) return false

  // 常见的 Markdown 标记
  const markdownPatterns = [
    /^#+ .+$/m, // 标题
    /\[.+\]\(.+\)/, // 链接
    /!\[.+\]\(.+\)/, // 图片
    /^- .+$/m, // 无序列表
    /^[0-9]+\. .+$/m, // 有序列表
    /^>.+$/m, // 引用
    /`{1,3}[^`]+`{1,3}/, // 代码块或行内代码
    /^\s*```[\s\S]+?```\s*$/m, // 代码块
    /^\|(.+\|)+$/m, // 表格
    /^-{3,}$/m, // 水平线
    /\*\*.+\*\*/, // 粗体
    /\*.+\*/, // 斜体
    /~~.+~~/ // 删除线
  ]

  // 如果匹配到任意一个 Markdown 标记，则认为是 Markdown 内容
  return markdownPatterns.some((pattern) => pattern.test(content))
}

// UUID生成函数
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// 创建存储实例
const storage = new Storage({ area: "local" })

// Storage对象是否已准备好
let isStorageReady = false

// 初始化存储系统
async function initStorage(): Promise<void> {
  try {
    debugLog("初始化本地存储...")
    // 尝试读写一个测试值来确认本地存储可用
    await storage.set("storage_test", { test: "ready" })
    const test = await storage.get<{ test: string } | undefined>("storage_test")
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

    const history = await storage.get<AiChatHistory>("ai_chat_history")
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
      type: typeof storage,
      area: (storage as any).area,
      isReady: isStorageReady,
      methods: Object.keys(storage)
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
    const before = await storage.get<AiChatHistory | undefined>(
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

      await storage.set("ai_chat_history", simpleHistory)
      // 验证保存是否成功
      const after = await storage.get<AiChatHistory | undefined>(
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
    await storage.set("ai_chat_history", { items: [] })
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
    await storage.set("ai_chat_history", history)
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
