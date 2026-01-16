import { Storage } from "@plasmohq/storage"
import { useEffect, useSyncExternalStore } from "react"

// 存储状态类型
export interface FloatButtonStorageState {
  showFloatButton: string
  tempHideButton: boolean
  isReady: boolean
}

// 同步缓存 - useSyncExternalStore 的 getSnapshot 必须是同步的
let storageCache: FloatButtonStorageState = {
  showFloatButton: "true",
  tempHideButton: false,
  isReady: false
}

// 订阅者集合
const listeners = new Set<() => void>()

// 通知所有订阅者
function emitChange() {
  for (const listener of listeners) {
    listener()
  }
}

// 更新缓存并通知订阅者
function updateCache(updates: Partial<FloatButtonStorageState>) {
  storageCache = { ...storageCache, ...updates }
  emitChange()
}

// 订阅函数 - 返回取消订阅的函数
function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

// 获取快照 - 必须是同步的，返回不可变引用
function getSnapshot(): FloatButtonStorageState {
  return storageCache
}

// 初始化标志，确保只初始化一次
let isInitialized = false

// 初始化存储监听
function initializeStorage() {
  if (isInitialized) return
  isInitialized = true

  const storage = new Storage()

  // 异步加载初始值
  const loadInitialValues = async () => {
    const [showValue] = await Promise.all([
      storage.get<string>("show_float_button"),
      storage.get<boolean>("temp_hide_button")
    ])

    // 页面加载时重置临时隐藏状态
    await storage.set("temp_hide_button", false)

    updateCache({
      showFloatButton: showValue ?? "true",
      tempHideButton: false,
      isReady: true
    })
  }

  loadInitialValues()

  // 监听存储变化
  storage.watch({
    show_float_button: (change) => {
      updateCache({
        showFloatButton: (change.newValue as string) ?? "true"
      })
    },
    temp_hide_button: (change) => {
      updateCache({
        tempHideButton: (change.newValue as boolean) ?? false
      })
    }
  })
}

/**
 * 使用 useSyncExternalStore 订阅悬浮球存储状态
 */
export function useFloatButtonStorage(): FloatButtonStorageState {
  // 确保存储已初始化
  useEffect(() => {
    initializeStorage()
  }, [])

  return useSyncExternalStore(subscribe, getSnapshot)
}
