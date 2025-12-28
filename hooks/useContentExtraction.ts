import { useCallback, useEffect, useState } from 'react'

import type { ContentExtractionMode, ExtractedContent, SelectedElementInfo } from '~constants/types'
import useElementSelector from './useElementSelector'

interface UseContentExtractionReturn {
  mode: ContentExtractionMode
  content: ExtractedContent | null
  elementInfo: SelectedElementInfo | null
  error: string | null
  startSelection: () => Promise<void>
  cancelSelection: () => void
  reset: () => void
}

/**
 * 内容提取 hook
 * 用于管理内容提取功能的状态
 */
export function useContentExtraction(): UseContentExtractionReturn {
  const [mode, setMode] = useState<ContentExtractionMode>('idle')
  const [error, setError] = useState<string | null>(null)

  const {
    isSelecting,
    elementInfo,
    extractedContent,
    activateSelector,
    deactivateSelector,
    clearSelection,
  } = useElementSelector()

  // 同步选择状态到 mode
  useEffect(() => {
    if (isSelecting) {
      setMode('selecting')
      setError(null)
    } else if (extractedContent) {
      setMode('extracted')
    }
  }, [isSelecting, extractedContent])

  // 开始选择
  const startSelection = useCallback(async () => {
    try {
      setError(null)
      await activateSelector('content-extraction')
    } catch (err) {
      setError(err instanceof Error ? err.message : '启动选择器失败')
      setMode('error')
    }
  }, [activateSelector])

  // 取消选择
  const cancelSelection = useCallback(() => {
    deactivateSelector()
    setMode('idle')
    setError(null)
  }, [deactivateSelector])

  // 重置状态
  const reset = useCallback(() => {
    clearSelection()
    setMode('idle')
    setError(null)
  }, [clearSelection])

  return {
    mode,
    content: extractedContent,
    elementInfo,
    error,
    startSelection,
    cancelSelection,
    reset,
  }
}

export default useContentExtraction
