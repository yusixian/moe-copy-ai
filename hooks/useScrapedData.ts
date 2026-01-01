import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useCallback, useLayoutEffect, useState } from "react"

import type {
  ScrapedContent,
  ScrapeResponse,
  SelectorResultsMap,
  SelectorType
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

// 选择器配置映射
const DEFAULT_SELECTORS_MAP: Record<SelectorType, string[]> = {
  content: CONTENT_SELECTORS,
  author: AUTHOR_SELECTORS,
  date: DATE_SELECTORS,
  title: TITLE_SELECTORS
}

/**
 * 抓取数据钩子
 */
export const useScrapedData = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrapedData, setScrapedData] = useState<ScrapedContent | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [isMarkdown, setIsMarkdown] = useState(false)

  // 选择器列表状态
  const [selectorsMap, setSelectorsMap] = useState<
    Record<SelectorType, string[]>
  >(DEFAULT_SELECTORS_MAP)

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
  const [selectorResults, setSelectorResults] = useState<SelectorResultsMap>({
    content: [],
    author: [],
    date: [],
    title: []
  })

  // 添加调试信息
  const addDebugInfo = useCallback((info: string) => {
    logger.debug(info)
    setDebugInfo((prev) => prev + (prev ? "\n" : "") + info)
  }, [])

  // 选择器类型名称映射 (moved before usage)
  const getSelectorTypeName = useCallback((type: SelectorType): string => {
    const nameMap: Record<SelectorType, string> = {
      content: "内容",
      author: "作者",
      date: "日期",
      title: "标题"
    }
    return nameMap[type]
  }, [])

  const initLoadSelectors = useCallback(async () => {
    try {
      const selectorCounts = Object.entries(DEFAULT_SELECTORS_MAP)
        .map(([key, selectors]) => `${key}(${selectors.length})`)
        .join(", ")

      addDebugInfo(`已加载默认选择器: ${selectorCounts}`)

      // 尝试加载自定义选择器
      try {
        const customSelectorsPromises = Object.entries(STORAGE_KEYS).map(
          async ([type, key]) => {
            const selectorType = type.toLowerCase() as SelectorType
            const customSelectors = await storage.get<string[]>(key)

            if (customSelectors?.length) {
              addDebugInfo(
                `使用自定义 ${getSelectorTypeName(selectorType)} 选择器 (${customSelectors.length})`
              )
              return [selectorType, customSelectors] as [SelectorType, string[]]
            }
            return null
          }
        )

        const customSelectorsResults = await Promise.all(
          customSelectorsPromises
        )

        // 更新选择器列表
        const updatedSelectorsMap = { ...DEFAULT_SELECTORS_MAP }
        customSelectorsResults.forEach((result) => {
          if (result) {
            const [type, selectors] = result
            updatedSelectorsMap[type] = selectors
          }
        })

        setSelectorsMap(updatedSelectorsMap)
      } catch (storageError) {
        addDebugInfo(
          `获取自定义选择器失败，使用默认选择器: ${storageError.message}`
        )
      }
    } catch (error) {
      addDebugInfo(`选择器初始化失败: ${error.message}`)
    }
  }, [addDebugInfo, getSelectorTypeName])

  // 加载选择器
  useLayoutEffect(() => {
    initLoadSelectors()
  }, [initLoadSelectors])

  // 获取抓取数据
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

          // 保存选择器结果
          if (response.data.selectorResults) {
            setSelectorResults(response.data.selectorResults)
            addDebugInfo(
              "收到选择器结果: " +
                Object.keys(response.data.selectorResults).length +
                " 种类型"
            )
          }

          // 处理内容格式
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
        setError(`抓取内容时出错: ${err.message || "未知错误"}`)
      } finally {
        setIsLoading(false)
      }
    },
    [addDebugInfo]
  )

  // 检查选择器有效性
  const isValidSelector = useCallback(
    (selector: string): boolean => {
      // 检查是否为空
      if (!selector || selector.trim() === "") {
        return false
      }

      // 简单检查是否是合法的CSS选择器
      try {
        // 尝试解析选择器
        document.querySelector(selector)
        return true
      } catch (e) {
        // 如果选择器语法错误，解析会抛出异常
        addDebugInfo(`选择器不合法: ${selector}, 错误: ${e.message}`)
        return false
      }
    },
    [addDebugInfo]
  )

  // 处理选择器变化
  const handleSelectorChange = useCallback(
    (type: SelectorType, index: number) => {
      setSelectedSelectorIndices((prev) => ({
        ...prev,
        [type]: index
      }))

      const selectors = selectorsMap[type]
      if (!selectors?.[index]) {
        addDebugInfo(`选择器索引无效: ${type} 类型，索引 ${index}`)
        return
      }

      const selector = selectors[index]

      // 检查选择器合法性
      if (!isValidSelector(selector)) {
        addDebugInfo(`选择器 ${selector} 不是有效的CSS选择器`)

        // 更新数据为无效选择器
        if (scrapedData) {
          const updatedData = { ...scrapedData }

          switch (type) {
            case "content":
              updatedData.articleContent = "无效的选择器"
              updatedData.cleanedContent = "无效的选择器"
              break
            case "author":
              updatedData.author = "无效的选择器"
              break
            case "date":
              updatedData.publishDate = "无效的选择器"
              break
            case "title":
              updatedData.title = "无效的选择器"
              break
          }

          setScrapedData(updatedData)
        }
        return
      }

      addDebugInfo(`使用 ${type} 选择器: ${selector}`)

      // 检查是否有该选择器的已有结果
      const existingResults = selectorResults[type] || []
      const existingResult = existingResults.find(
        (r) => r.selector === selector
      )

      if (scrapedData) {
        // 创建更新后的数据副本
        const updatedData = { ...scrapedData }

        // 检查选择器结果是否存在且有实际内容
        if (existingResult?.content && existingResult.content.trim() !== "") {
          // 如果已有结果，直接更新数据而不重新抓取
          addDebugInfo(
            `使用现有的 ${type} 选择器结果: ${existingResult.content.substring(0, 30)}...`
          )

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
        } else {
          // 没有已存在的结果或内容为空
          addDebugInfo(`选择器 ${selector} 没有抓取到内容`)

          switch (type) {
            case "content":
              updatedData.articleContent = ""
              updatedData.cleanedContent = ""
              break
            case "author":
              updatedData.author = ""
              break
            case "date":
              updatedData.publishDate = ""
              break
            case "title":
              updatedData.title = ""
              break
          }
          setScrapedData(updatedData)

          // 同时尝试重新抓取
          fetchScrapedContent({ [type]: selector })
        }
        return
      }

      // 如果没有scrapedData，尝试重新抓取
      fetchScrapedContent({ [type]: selector })
    },
    [
      selectorsMap,
      selectorResults,
      scrapedData,
      addDebugInfo,
      fetchScrapedContent,
      isValidSelector
    ]
  )

  // 处理选择特定内容项
  const handleSelectContent = useCallback(
    (type: SelectorType, selector: string, contentIndex: number) => {
      addDebugInfo(
        `选择 ${type} 选择器 ${selector} 的第 ${contentIndex + 1} 个结果`
      )

      // 确保有抓取数据
      if (!scrapedData) {
        addDebugInfo("没有抓取数据，无法选择内容")
        return
      }

      // 查找该选择器的结果
      const existingResults = selectorResults[type] || []
      const existingResult = existingResults.find(
        (r) => r.selector === selector
      )

      if (!existingResult) {
        addDebugInfo(`未找到 ${selector} 选择器的结果`)
        return
      }

      // 检查是否有多个内容
      if (
        !existingResult.allContent ||
        existingResult.allContent.length <= contentIndex
      ) {
        addDebugInfo(`选择器 ${selector} 没有第 ${contentIndex + 1} 个结果`)
        return
      }

      // 获取指定索引的内容
      const selectedContent = existingResult.allContent[contentIndex]

      // 创建更新后的数据副本
      const updatedData = { ...scrapedData }

      // 更新数据
      switch (type) {
        case "content":
          updatedData.articleContent = selectedContent
          updatedData.cleanedContent = formatContent(selectedContent)
          break
        case "author":
          updatedData.author = selectedContent
          break
        case "date":
          updatedData.publishDate = selectedContent
          break
        case "title":
          updatedData.title = selectedContent
          break
      }

      // 更新选择器结果中的 content 字段
      const updatedResults = { ...selectorResults }
      updatedResults[type] = existingResults.map((result) => {
        if (result.selector === selector) {
          return { ...result, content: selectedContent }
        }
        return result
      })

      // 更新状态
      setSelectorResults(updatedResults)
      setScrapedData(updatedData)

      addDebugInfo(
        `已将 ${type} 选择器 ${selector} 的第 ${contentIndex + 1} 个结果设置为当前内容`
      )
    },
    [scrapedData, selectorResults, addDebugInfo]
  )

  // 在组件挂载时抓取当前页面内容
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
