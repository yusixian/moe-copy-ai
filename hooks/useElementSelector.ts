import { useCallback, useEffect, useState } from "react"

import type {
  ElementSelectorPurpose,
  ExtractedContent,
  ExtractedLink,
  NextPageButtonInfo,
  SelectedElementInfo
} from "~constants/types"

interface UseElementSelectorReturn {
  isSelecting: boolean
  elementInfo: SelectedElementInfo | null
  extractedLinks: ExtractedLink[]
  extractedContent: ExtractedContent | null
  nextPageButton: NextPageButtonInfo | null
  activateSelector: (purpose?: ElementSelectorPurpose) => Promise<void>
  deactivateSelector: () => void
  clearSelection: () => void
  clearNextPageButton: () => void
}

/**
 * 元素选择器 hook
 * 用于在 popup 中管理元素选择状态
 */
export function useElementSelector(): UseElementSelectorReturn {
  const [isSelecting, setIsSelecting] = useState(false)
  const [elementInfo, setElementInfo] = useState<SelectedElementInfo | null>(
    null
  )
  const [extractedLinks, setExtractedLinks] = useState<ExtractedLink[]>([])
  const [extractedContent, setExtractedContent] =
    useState<ExtractedContent | null>(null)
  const [nextPageButton, setNextPageButton] =
    useState<NextPageButtonInfo | null>(null)

  // 激活选择器
  const activateSelector = useCallback(
    async (purpose: ElementSelectorPurpose = "link-extraction") => {
      try {
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true
        })
        if (!tab?.id) {
          console.error("无法获取当前标签页")
          return
        }

        // 向内容脚本发送激活消息（包含 purpose）
        await chrome.tabs.sendMessage(tab.id, {
          action: "activateSelector",
          purpose
        })
        setIsSelecting(true)
        setElementInfo(null)
        setExtractedLinks([])
        setExtractedContent(null)
      } catch (error) {
        console.error("激活选择器失败:", error)
      }
    },
    []
  )

  // 停用选择器
  const deactivateSelector = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (tab?.id) {
        await chrome.tabs.sendMessage(tab.id, { action: "deactivateSelector" })
      }
    } catch (error) {
      console.error("停用选择器失败:", error)
    }

    setIsSelecting(false)
    setElementInfo(null)
    setExtractedLinks([])
    setExtractedContent(null)
    // Note: We don't reset nextPageButton here as it might be needed even after deactivating
  }, [])

  // 清除下一页按钮选择
  const clearNextPageButton = useCallback(() => {
    setNextPageButton(null)
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
      nextPageButton?: NextPageButtonInfo
    }) => {
      if (message.action === "elementSelected") {
        setIsSelecting(false)
        // 只有非下一页按钮选择时才更新 elementInfo，避免覆盖链接容器信息
        if (message.purpose !== "next-page-button") {
          if (message.elementInfo) {
            setElementInfo(message.elementInfo)
          }
          if (message.links) {
            setExtractedLinks(message.links)
          }
          if (message.content) {
            setExtractedContent(message.content)
          }
        }
        if (message.nextPageButton) {
          setNextPageButton(message.nextPageButton)
        }
      } else if (message.action === "selectionCancelled") {
        setIsSelecting(false)
        setElementInfo(null)
        setExtractedLinks([])
        setExtractedContent(null)
        // Note: We don't reset nextPageButton here as the user might have cancelled a different selection
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
    nextPageButton,
    activateSelector,
    deactivateSelector,
    clearSelection,
    clearNextPageButton
  }
}

export default useElementSelector
