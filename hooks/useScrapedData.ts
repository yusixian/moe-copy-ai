import { sendToBackground } from "@plasmohq/messaging"
import { useCallback, useLayoutEffect, useState } from "react"

import type {
  ScrapedContent,
  ScrapeResponse,
  SelectorType
} from "~constants/types"
import { detectMarkdown } from "~utils"
import { formatContent } from "~utils/formatter"

import useDebugLog from "./useDebugLog"
import useSelectors from "./useSelectors"

/**
 * Hook for scraping page content with selector management
 */
export const useScrapedData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null)
  const [isMarkdown, setIsMarkdown] = useState(false)

  const { debugInfo, addDebugInfo } = useDebugLog()

  const {
    selectorsMap,
    selectedSelectorIndices,
    selectorResults,
    updateSelectorResults,
    createSelectorChangeHandler,
    createSelectContentHandler
  } = useSelectors({ onDebug: addDebugInfo })

  // Fetch scraped content from background
  const fetchScrapedContent = useCallback(
    async (overrideSelectors?: Partial<Record<SelectorType, string>>) => {
      try {
        setIsLoading(true)
        setError(null)
        addDebugInfo("开始请求抓取内容...")

        if (overrideSelectors) {
          addDebugInfo(`使用自定义选择器: ${JSON.stringify(overrideSelectors)}`)
        }

        const response = await sendToBackground<
          { selectors?: Partial<Record<SelectorType, string>> },
          ScrapeResponse
        >({
          name: "getScrapedContent",
          body: {
            selectors: overrideSelectors
          }
        })

        addDebugInfo(
          `收到响应: ${JSON.stringify(response).substring(0, 100)}...`
        )

        if (response?.success && response?.data) {
          addDebugInfo(`抓取成功, 标题: ${response.data.title}`)

          if (response.data.selectorResults) {
            updateSelectorResults(response.data.selectorResults)
          }

          const processedData = { ...response.data }
          if (processedData.articleContent) {
            processedData.articleContent = formatContent(
              processedData.articleContent
            )
            setIsMarkdown(detectMarkdown(processedData.articleContent))
          }

          setScrapedData(processedData)
        } else {
          const errorMsg = response?.error || "获取内容失败"
          addDebugInfo(`抓取失败: ${errorMsg}`)
          setError(errorMsg)
        }
      } catch (err) {
        console.error("抓取内容时出错:", err)
        addDebugInfo(`抓取异常: ${JSON.stringify(err)}`)
        setError(`抓取内容时出错: ${(err as Error).message || "未知错误"}`)
      } finally {
        setIsLoading(false)
      }
    },
    [addDebugInfo, updateSelectorResults]
  )

  // Update scraped data based on selector type
  const updateScrapedDataField = useCallback(
    (type: SelectorType, content: string, isInvalid?: boolean) => {
      if (!scrapedData && !isInvalid) return

      setScrapedData((prev) => {
        if (!prev) return prev
        const updatedData = { ...prev }

        switch (type) {
          case "content":
            updatedData.articleContent = content
            updatedData.cleanedContent = isInvalid
              ? content
              : formatContent(content)
            break
          case "author":
            updatedData.author = content
            break
          case "date":
            updatedData.publishDate = content
            break
          case "title":
            updatedData.title = content
            break
        }

        return updatedData
      })
    },
    [scrapedData]
  )

  // Create handlers using the selectors hook
  const handleSelectorChange = useCallback(
    (type: SelectorType, index: number) => {
      const handler = createSelectorChangeHandler(
        updateScrapedDataField,
        fetchScrapedContent
      )
      handler(type, index)
    },
    [createSelectorChangeHandler, updateScrapedDataField, fetchScrapedContent]
  )

  const handleSelectContent = useCallback(
    (type: SelectorType, selector: string, contentIndex: number) => {
      const handler = createSelectContentHandler(updateScrapedDataField)
      handler(type, selector, contentIndex)
    },
    [createSelectContentHandler, updateScrapedDataField]
  )

  // Fetch content on mount
  useLayoutEffect(() => {
    fetchScrapedContent()
  }, [fetchScrapedContent])

  return {
    isLoading,
    error,
    scrapedData,
    debugInfo,
    isMarkdown,
    handleRefresh: fetchScrapedContent,
    contentSelectors: selectorsMap.content,
    authorSelectors: selectorsMap.author,
    dateSelectors: selectorsMap.date,
    titleSelectors: selectorsMap.title,
    selectedSelectorIndices,
    handleSelectorChange,
    handleSelectContent,
    getSelectorsForType: (type: SelectorType) => selectorsMap[type] || []
  }
}

export default useScrapedData
