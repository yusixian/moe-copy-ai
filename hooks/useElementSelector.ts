import { useCallback, useEffect, useState } from 'react'

import type { ElementSelectorPurpose, ExtractedContent, ExtractedLink, SelectedElementInfo } from '~constants/types'

interface UseElementSelectorReturn {
  isSelecting: boolean
  elementInfo: SelectedElementInfo | null
  extractedLinks: ExtractedLink[]
  extractedContent: ExtractedContent | null
  activateSelector: (purpose?: ElementSelectorPurpose) => Promise<void>
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
  const [extractedContent, setExtractedContent] = useState<ExtractedContent | null>(null)

  // 激活选择器
  const activateSelector = useCallback(async (purpose: ElementSelectorPurpose = 'link-extraction') => {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tab?.id) {
        console.error('无法获取当前标签页')
        return
      }

      // 向内容脚本发送激活消息（包含 purpose）
      await chrome.tabs.sendMessage(tab.id, { action: 'activateSelector', purpose })
      setIsSelecting(true)
      setElementInfo(null)
      setExtractedLinks([])
      setExtractedContent(null)
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
    setExtractedContent(null)
  }, [])

  // 清除选择（保留数据）
  const clearSelection = useCallback(() => {
    setIsSelecting(false)
  }, [])

  // 监听来自内容脚本的消息
  useEffect(() => {
    const handleMessage = (message: {
      action: string
      elementInfo?: SelectedElementInfo
      links?: ExtractedLink[]
      content?: ExtractedContent
      purpose?: ElementSelectorPurpose
    }) => {
      if (message.action === 'elementSelected') {
        setIsSelecting(false)
        if (message.elementInfo) {
          setElementInfo(message.elementInfo)
        }
        if (message.links) {
          setExtractedLinks(message.links)
        }
        if (message.content) {
          setExtractedContent(message.content)
        }
      } else if (message.action === 'selectionCancelled') {
        setIsSelecting(false)
        setElementInfo(null)
        setExtractedLinks([])
        setExtractedContent(null)
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
    extractedContent,
    activateSelector,
    deactivateSelector,
    clearSelection,
  }
}

export default useElementSelector
