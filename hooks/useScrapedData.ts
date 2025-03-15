import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

import type {
  ScrapedContent,
  ScrapeResponse,
  SelectorType as SelectorTypeAlias
} from "~constants/types"
import { detectMarkdown } from "~utils"
import { formatContent } from "~utils/formatter"
import { logger } from "~utils/logger"

import {
  AUTHOR_SELECTORS,
  CONTENT_SELECTORS,
  DATE_SELECTORS,
  TITLE_SELECTORS
} from "../constants/config"

// 存储实例
const storage = new Storage({ area: "sync" })

// 存储键
const STORAGE_KEYS = {
  CONTENT: "custom_content_selectors",
  AUTHOR: "custom_author_selectors",
  DATE: "custom_date_selectors",
  TITLE: "custom_title_selectors"
}

// 选择器类型
export type SelectorType = "content" | "author" | "date" | "title"

/**
 * 抓取数据钩子
 */
export const useScrapedData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [isMarkdown, setIsMarkdown] = useState(false)

  // 不同类型的选择器列表
  const [contentSelectors, setContentSelectors] = useState<string[]>([])
  const [authorSelectors, setAuthorSelectors] = useState<string[]>([])
  const [dateSelectors, setDateSelectors] = useState<string[]>([])
  const [titleSelectors, setTitleSelectors] = useState<string[]>([])

  // 当前选择的选择器索引
  const [selectedSelectorIndices, setSelectedSelectorIndices] = useState<
    Record<SelectorType, number>
  >({
    content: 0,
    author: 0,
    date: 0,
    title: 0
  })

  // 每个选择器抓取到的内容
  const [selectorResults, setSelectorResults] = useState<
    Record<SelectorType, { selector: string; content: string }[]>
  >({
    content: [],
    author: [],
    date: [],
    title: []
  })

  // 添加调试信息
  const addDebugInfo = (info: string) => {
    logger.debug(info)
    setDebugInfo((prev) => prev + "\n" + info)
  }

  // 加载选择器
  useEffect(() => {
    const loadSelectors = async () => {
      try {
        // 首先初始化默认选择器
        setContentSelectors(CONTENT_SELECTORS)
        setAuthorSelectors(AUTHOR_SELECTORS)
        setDateSelectors(DATE_SELECTORS)
        setTitleSelectors(TITLE_SELECTORS)

        addDebugInfo(
          `已加载默认选择器: 内容(${CONTENT_SELECTORS.length}), 作者(${AUTHOR_SELECTORS.length}), 日期(${DATE_SELECTORS.length}), 标题(${TITLE_SELECTORS.length})`
        )

        // 然后尝试加载自定义选择器
        try {
          const customContentSelectors = await storage.get<string[]>(
            STORAGE_KEYS.CONTENT
          )
          const customAuthorSelectors = await storage.get<string[]>(
            STORAGE_KEYS.AUTHOR
          )
          const customDateSelectors = await storage.get<string[]>(
            STORAGE_KEYS.DATE
          )
          const customTitleSelectors = await storage.get<string[]>(
            STORAGE_KEYS.TITLE
          )

          // 如果有自定义选择器，则覆盖默认选择器
          if (customContentSelectors && customContentSelectors.length > 0) {
            setContentSelectors(customContentSelectors)
            addDebugInfo(
              `使用自定义内容选择器 (${customContentSelectors.length})`
            )
          }

          if (customAuthorSelectors && customAuthorSelectors.length > 0) {
            setAuthorSelectors(customAuthorSelectors)
            addDebugInfo(
              `使用自定义作者选择器 (${customAuthorSelectors.length})`
            )
          }

          if (customDateSelectors && customDateSelectors.length > 0) {
            setDateSelectors(customDateSelectors)
            addDebugInfo(`使用自定义日期选择器 (${customDateSelectors.length})`)
          }

          if (customTitleSelectors && customTitleSelectors.length > 0) {
            setTitleSelectors(customTitleSelectors)
            addDebugInfo(
              `使用自定义标题选择器 (${customTitleSelectors.length})`
            )
          }
        } catch (storageError) {
          addDebugInfo(
            "获取自定义选择器失败，使用默认选择器: " + storageError.message
          )
        }
      } catch (error) {
        addDebugInfo("选择器初始化失败: " + error.message)
      }
    }

    loadSelectors()
  }, [])

  // 获取抓取数据
  const fetchScrapedContent = async (
    overrideSelectors?: Partial<Record<SelectorType, string>>
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      addDebugInfo("开始请求抓取内容...")

      if (overrideSelectors) {
        addDebugInfo("使用自定义选择器: " + JSON.stringify(overrideSelectors))
      }

      const response = await sendToBackground<any, ScrapeResponse>({
        name: "getScrapedContent",
        body: {
          selectors: overrideSelectors
        }
      })

      addDebugInfo(
        "收到响应: " + JSON.stringify(response).substring(0, 100) + "..."
      )

      if (response && response.success && response.data) {
        addDebugInfo("抓取成功, 标题: " + response.data.title)

        // 如果有选择器结果，保存它们
        if (response.data.selectorResults) {
          setSelectorResults(response.data.selectorResults)
          addDebugInfo(
            "收到选择器结果: " +
              Object.keys(response.data.selectorResults).length +
              " 种类型"
          )
        }

        // 处理文章内容，保留必要的格式
        if (response.data.articleContent) {
          response.data.articleContent = formatContent(
            response.data.articleContent
          )
        }

        setScrapedData(response.data)
        // 检测是否为 Markdown 内容
        if (response.data.articleContent) {
          setIsMarkdown(detectMarkdown(response.data.articleContent))
        }
      } else {
        const errorMsg = response?.error || "获取内容失败"
        addDebugInfo("抓取失败: " + errorMsg)
        setError(errorMsg)
      }
    } catch (err) {
      console.error("抓取内容时出错:", err)
      addDebugInfo("抓取异常: " + JSON.stringify(err))
      setError("抓取内容时出错: " + (err.message || "未知错误"))
    } finally {
      setIsLoading(false)
    }
  }

  // 在组件挂载时抓取当前页面内容
  useEffect(() => {
    fetchScrapedContent()
  }, [])

  // 处理选择器变化
  const handleSelectorChange = (type: SelectorType, index: number) => {
    setSelectedSelectorIndices((prev) => ({
      ...prev,
      [type]: index
    }))

    // 获取当前类型的选择器列表
    const selectorsMap = {
      content: contentSelectors,
      author: authorSelectors,
      date: dateSelectors,
      title: titleSelectors
    }

    const selectors = selectorsMap[type]
    if (selectors && selectors[index]) {
      // 使用选定的选择器重新抓取内容
      const selector = selectors[index]
      addDebugInfo(`使用 ${type} 选择器: ${selector}`)

      // 检查是否有该选择器的已有结果
      const existingResults = selectorResults[type] || []
      const existingResult = existingResults.find(
        (r) => r.selector === selector
      )

      if (existingResult && existingResult.content) {
        // 如果已经有结果，则直接更新当前数据而不重新抓取
        addDebugInfo(
          `使用现有的 ${type} 选择器结果: ${existingResult.content.substring(0, 30)}...`
        )

        if (scrapedData) {
          const updatedData = { ...scrapedData }

          // 根据选择器类型更新相应的内容
          switch (type) {
            case "content":
              updatedData.articleContent = existingResult.content
              updatedData.cleanedContent = formatContent(existingResult.content)
              break
            case "author":
              updatedData.author = existingResult.content
              break
            case "date":
              updatedData.publishDate = existingResult.content
              break
            case "title":
              updatedData.title = existingResult.content
              break
          }

          setScrapedData(updatedData)
          return
        }
      }

      // 创建一个只包含当前类型的选择器的对象
      const overrideSelectors: Partial<Record<SelectorType, string>> = {
        [type]: selector
      }

      // 重新抓取内容
      fetchScrapedContent(overrideSelectors)
    }
  }

  // 处理手动刷新
  const handleRefresh = () => {
    fetchScrapedContent()
  }

  // 获取选择器列表
  const getSelectorsForType = (type: SelectorType): string[] => {
    switch (type) {
      case "content":
        return contentSelectors
      case "author":
        return authorSelectors
      case "date":
        return dateSelectors
      case "title":
        return titleSelectors
      default:
        return []
    }
  }

  return {
    isLoading,
    error,
    scrapedData,
    debugInfo,
    isMarkdown,
    handleRefresh,
    contentSelectors,
    authorSelectors,
    dateSelectors,
    titleSelectors,
    selectedSelectorIndices,
    selectorResults,
    handleSelectorChange,
    getSelectorsForType
  }
}

export default useScrapedData
