import { Storage } from "@plasmohq/storage"
import { useCallback, useLayoutEffect, useState } from "react"

import type { SelectorResultsMap, SelectorType } from "~constants/types"

import {
  AUTHOR_SELECTORS,
  CONTENT_SELECTORS,
  DATE_SELECTORS,
  TITLE_SELECTORS
} from "../constants/config"

const storage = new Storage({ area: "sync" })

const STORAGE_KEYS = {
  CONTENT: "custom_content_selectors",
  AUTHOR: "custom_author_selectors",
  DATE: "custom_date_selectors",
  TITLE: "custom_title_selectors"
}

const DEFAULT_SELECTORS_MAP: Record<SelectorType, string[]> = {
  content: CONTENT_SELECTORS,
  author: AUTHOR_SELECTORS,
  date: DATE_SELECTORS,
  title: TITLE_SELECTORS
}

interface UseSelectorsOptions {
  onDebug?: (info: string) => void
}

type UpdateDataFn = (
  type: SelectorType,
  content: string,
  isInvalid?: boolean
) => void

/**
 * Hook for managing selector state
 */
export function useSelectors(options: UseSelectorsOptions = {}) {
  const { onDebug } = options

  const addDebugInfo = useCallback(
    (info: string) => {
      onDebug?.(info)
    },
    [onDebug]
  )

  const [selectorsMap, setSelectorsMap] = useState<
    Record<SelectorType, string[]>
  >(DEFAULT_SELECTORS_MAP)

  const [selectedSelectorIndices, setSelectedSelectorIndices] = useState<
    Record<SelectorType, number>
  >({
    content: 0,
    author: 0,
    date: 0,
    title: 0
  })

  const [selectorResults, setSelectorResults] = useState<SelectorResultsMap>({
    content: [],
    author: [],
    date: [],
    title: []
  })

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
          `获取自定义选择器失败，使用默认选择器: ${(storageError as Error).message}`
        )
      }
    } catch (error) {
      addDebugInfo(`选择器初始化失败: ${(error as Error).message}`)
    }
  }, [addDebugInfo, getSelectorTypeName])

  useLayoutEffect(() => {
    initLoadSelectors()
  }, [initLoadSelectors])

  const isValidSelector = useCallback(
    (selector: string): boolean => {
      if (!selector || selector.trim() === "") {
        return false
      }

      try {
        document.querySelector(selector)
        return true
      } catch (e) {
        addDebugInfo(`选择器不合法: ${selector}, 错误: ${(e as Error).message}`)
        return false
      }
    },
    [addDebugInfo]
  )

  const updateSelectorResults = useCallback(
    (results: SelectorResultsMap) => {
      setSelectorResults(results)
      addDebugInfo(`收到选择器结果: ${Object.keys(results).length} 种类型`)
    },
    [addDebugInfo]
  )

  /**
   * Create a handler for selector changes
   * Returns a function that handles selector changes with data update capability
   */
  const createSelectorChangeHandler = useCallback(
    (
      updateData: UpdateDataFn,
      fetchContent: (
        overrideSelectors: Partial<Record<SelectorType, string>>
      ) => void
    ) => {
      return (type: SelectorType, index: number) => {
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

        if (!isValidSelector(selector)) {
          addDebugInfo(`选择器 ${selector} 不是有效的CSS选择器`)
          updateData(type, "无效的选择器", true)
          return
        }

        addDebugInfo(`使用 ${type} 选择器: ${selector}`)

        const existingResults = selectorResults[type] || []
        const existingResult = existingResults.find(
          (r) => r.selector === selector
        )

        if (existingResult?.content && existingResult.content.trim() !== "") {
          addDebugInfo(
            `使用现有的 ${type} 选择器结果: ${existingResult.content.substring(0, 30)}...`
          )
          updateData(type, existingResult.content)
        } else {
          addDebugInfo(`选择器 ${selector} 没有抓取到内容`)
          updateData(type, "")
          fetchContent({ [type]: selector })
        }
      }
    },
    [selectorsMap, selectorResults, addDebugInfo, isValidSelector]
  )

  /**
   * Create a handler for selecting specific content from results
   */
  const createSelectContentHandler = useCallback(
    (updateData: UpdateDataFn) => {
      return (type: SelectorType, selector: string, contentIndex: number) => {
        addDebugInfo(
          `选择 ${type} 选择器 ${selector} 的第 ${contentIndex + 1} 个结果`
        )

        const existingResults = selectorResults[type] || []
        const existingResult = existingResults.find(
          (r) => r.selector === selector
        )

        if (!existingResult) {
          addDebugInfo(`未找到 ${selector} 选择器的结果`)
          return
        }

        if (
          !existingResult.allContent ||
          existingResult.allContent.length <= contentIndex
        ) {
          addDebugInfo(`选择器 ${selector} 没有第 ${contentIndex + 1} 个结果`)
          return
        }

        const selectedContent = existingResult.allContent[contentIndex]
        updateData(type, selectedContent)

        // Update selector results with the selected content
        const updatedResults = { ...selectorResults }
        updatedResults[type] = existingResults.map((result) => {
          if (result.selector === selector) {
            return { ...result, content: selectedContent }
          }
          return result
        })
        setSelectorResults(updatedResults)

        addDebugInfo(
          `已将 ${type} 选择器 ${selector} 的第 ${contentIndex + 1} 个结果设置为当前内容`
        )
      }
    },
    [selectorResults, addDebugInfo]
  )

  return {
    selectorsMap,
    selectedSelectorIndices,
    selectorResults,
    updateSelectorResults,
    initLoadSelectors,
    isValidSelector,
    createSelectorChangeHandler,
    createSelectContentHandler
  }
}

export default useSelectors
