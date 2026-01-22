import { useCallback, useEffect, useMemo, useState } from "react"

import type {
  ContentExtractionMode,
  ExtractedContent,
  SelectedElementInfo
} from "~constants/types"
import useElementSelector from "./useElementSelector"

export interface TabInfo {
  url: string
  title: string
}

interface UseContentExtractionReturn {
  mode: ContentExtractionMode
  content: ExtractedContent | null
  elementInfo: SelectedElementInfo | null
  error: string | null
  tabInfo: TabInfo | null
  startSelection: () => Promise<void>
  cancelSelection: () => void
  reset: () => void
}

/**
 * 内容提取 hook
 * 用于管理内容提取功能的状态
 */
export function useContentExtraction(): UseContentExtractionReturn {
  const [errorState, setErrorState] = useState<{
    error: string | null
    hasError: boolean
  }>({ error: null, hasError: false })
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null)

  const {
    isSelecting,
    elementInfo,
    extractedContent,
    activateSelector,
    deactivateSelector,
    clearSelection
  } = useElementSelector()

  // Derive mode from state instead of using useEffect
  const mode = useMemo<ContentExtractionMode>(() => {
    if (errorState.hasError) return "error"
    if (isSelecting) return "selecting"
    if (extractedContent) return "extracted"
    return "idle"
  }, [isSelecting, extractedContent, errorState.hasError])

  // 当内容提取成功时，获取当前标签页信息
  useEffect(() => {
    if (extractedContent) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          console.error("获取标签页信息失败:", chrome.runtime.lastError)
          return
        }
        const tab = tabs[0]
        if (tab) {
          setTabInfo({
            url: tab.url || "",
            title: tab.title || ""
          })
        }
      })
    }
  }, [extractedContent])

  // 开始选择
  const startSelection = useCallback(async () => {
    try {
      setErrorState({ error: null, hasError: false })
      await activateSelector("content-extraction")
    } catch (err) {
      setErrorState({
        error: err instanceof Error ? err.message : "启动选择器失败",
        hasError: true
      })
    }
  }, [activateSelector])

  // 取消选择
  const cancelSelection = useCallback(() => {
    deactivateSelector()
    setErrorState({ error: null, hasError: false })
  }, [deactivateSelector])

  // 重置状态
  const reset = useCallback(() => {
    clearSelection()
    setErrorState({ error: null, hasError: false })
    setTabInfo(null)
  }, [clearSelection])

  return {
    mode,
    content: extractedContent,
    elementInfo,
    error: errorState.error,
    tabInfo,
    startSelection,
    cancelSelection,
    reset
  }
}

export default useContentExtraction
