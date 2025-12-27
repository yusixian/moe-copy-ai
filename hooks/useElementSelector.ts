import { useCallback, useEffect, useState } from 'react'

import type { ExtractedLink, SelectedElementInfo } from '~constants/types'

interface UseElementSelectorReturn {
  isSelecting: boolean
  elementInfo: SelectedElementInfo | null
  extractedLinks: ExtractedLink[]
  activateSelector: () => Promise<void>
  deactivateSelector: () => void
  clearSelection: () => void
}

/**
 * 元素选择器 hook
 * 用于在 popup 中管理元素选择状态
 */
export function useElementSelector(): UseElementSelectorReturn {
  const [isSelecting, setIsSelecting] = useState(false)
  const [elementInfo, setElementInfo] = useState<SelectedElementInfo | null>(null)
  const [extractedLinks, setExtractedLinks] = useState<ExtractedLink[]>([])

  // 激活选择器
  const activateSelector = useCallback(async () => {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) {
        console.error('无法获取当前标签页')
        return
      }

      // 向内容脚本发送激活消息
      await chrome.tabs.sendMessage(tab.id, { action: 'activateSelector' })
      setIsSelecting(true)
      setElementInfo(null)
      setExtractedLinks([])
    } catch (error) {
      console.error('激活选择器失败:', error)
    }
  }, [])

  // 停用选择器
  const deactivateSelector = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, { action: 'deactivateSelector' })
      }
    } catch (error) {
      console.error('停用选择器失败:', error)
    }

    setIsSelecting(false)
    setElementInfo(null)
    setExtractedLinks([])
  }, [])

  // 清除选择（保留链接数据）
  const clearSelection = useCallback(() => {
    setIsSelecting(false)
  }, [])

  // 监听来自内容脚本的消息
  useEffect(() => {
    const handleMessage = (message: {
      action: string
      elementInfo?: SelectedElementInfo
      links?: ExtractedLink[]
    }) => {
      if (message.action === 'elementSelected') {
        setIsSelecting(false)
        if (message.elementInfo) {
          setElementInfo(message.elementInfo)
        }
        if (message.links) {
          setExtractedLinks(message.links)
        }
      } else if (message.action === 'selectionCancelled') {
        setIsSelecting(false)
        setElementInfo(null)
        setExtractedLinks([])
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [])

  return {
    isSelecting,
    elementInfo,
    extractedLinks,
    activateSelector,
    deactivateSelector,
    clearSelection,
  }
}

export default useElementSelector
