import { Icon } from "@iconify/react"
import type React from "react"
import { memo, useCallback, useEffect, useRef, useState } from "react"
// Note: useCallback is still used in useSelectorState hook for stable callback references

import type { SelectorResultItem, SelectorType } from "~constants/types"
import { useI18n } from "~utils/i18n"

interface SelectorDropdownProps {
  type: SelectorType
  selectors: string[]
  selectedIndex: number
  results?: SelectorResultItem[]
  onChange: (index: number) => void
  onSelectContent?: (selector: string, contentIndex: number) => void
}

// 选择器列表项组件
interface SelectorItemProps {
  selector: string
  index: number
  isSelected: boolean
  hasContent: boolean
  onSelect: (index: number) => void
  onTogglePreview: (index: number) => void
  showPreview: boolean
  previewContent?: string
  allPreviewContents?: string[]
  onSelectContent?: (selector: string, contentIndex: number) => void
  closeDropdown?: () => void
}

// 使用 memo 优化 SelectorItem 组件减少不必要的重渲染
const SelectorItem = memo<SelectorItemProps>(
  ({
    selector,
    index,
    isSelected,
    hasContent,
    onSelect,
    onTogglePreview,
    showPreview,
    previewContent,
    allPreviewContents,
    onSelectContent,
    closeDropdown
  }) => {
    const { t } = useI18n()
    // 判断是否有多个内容
    const hasMultipleContents =
      allPreviewContents && allPreviewContents.length > 1

    // 添加内容预览区域的引用
    const previewRef = useRef<HTMLDivElement>(null)

    // 当预览显示状态变化时执行滚动
    useEffect(() => {
      // 如果预览显示并且预览元素存在
      if (showPreview && previewRef.current) {
        // 使用 requestAnimationFrame 代替 setTimeout 更高效
        const scrollTimer = requestAnimationFrame(() => {
          // 平滑滚动到预览区域
          previewRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          })
        })

        // 清理定时器
        return () => cancelAnimationFrame(scrollTimer)
      }
    }, [showPreview])

    const handleTogglePreview = (e: React.MouseEvent) => {
      e.stopPropagation()
      onTogglePreview(index)
    }

    const handleSelect = () => {
      onSelect(index)
    }

    const handleContentSelect = (contentIdx: number) => {
      if (onSelectContent) {
        onSelectContent(selector, contentIdx)
        if (closeDropdown) closeDropdown()
      }
    }

    return (
      <li
        className={`relative transition-colors duration-150 ${
          isSelected
            ? "bg-gradient-to-r from-sky-50 to-blue-50 font-medium text-sky-700"
            : "hover:bg-blue-50"
        }`}>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 p-3 text-left text-xs"
          onClick={handleSelect}>
          <div className="flex items-center">
            {isSelected ? (
              <Icon
                icon="mdi:check-circle"
                className="mr-1.5 text-sky-500 md:mr-2"
                width={16}
                height={16}
              />
            ) : (
              <Icon
                icon="mdi:selector"
                className="mr-1.5 text-gray-300 md:mr-2"
                width={16}
                height={16}
              />
            )}
            <span className="max-w-[18.75rem] truncate font-mono md:max-w-none">
              {selector}
            </span>
          </div>
          <div className="flex items-center">
            {hasContent ? (
              <span
                className={`inline-block max-w-[5rem] truncate whitespace-nowrap rounded-full px-2 py-0.5 font-medium text-xs ${hasMultipleContents ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                {hasMultipleContents
                  ? t("selector.count", {
                      count: allPreviewContents?.length
                    })
                  : t("batch.results")}
              </span>
            ) : (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-500 text-xs">
                {t("common.noData")}
              </span>
            )}
            {hasContent && (
              <button
                type="button"
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                  showPreview
                    ? "bg-sky-100 text-sky-600 hover:bg-sky-200"
                    : "text-sky-500 hover:bg-sky-50"
                }`}
                onClick={handleTogglePreview}
                title={
                  showPreview
                    ? `${t("common.hide")}${t("extraction.preview")}`
                    : `${t("common.show")}${t("extraction.preview")}`
                }>
                <Icon
                  icon={showPreview ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  width={18}
                  height={18}
                />
              </button>
            )}
          </div>
        </button>

        {/* 内容预览 */}
        {hasContent && showPreview && (
          <div
            ref={previewRef}
            className="border-sky-100 border-t bg-blue-50 p-2">
            <div className="mb-2 font-medium text-sky-600 text-xs">
              {t(
                hasMultipleContents ? "metadata.preview" : "extraction.preview"
              )}
            </div>
            {hasMultipleContents ? (
              <div className="space-y-3">
                {allPreviewContents?.map((content, idx) => (
                  <div
                    key={`preview-${idx}-${content.slice(0, 20)}`}
                    className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between border-sky-50 border-b bg-gradient-to-r from-sky-50 to-blue-50 px-2 py-2">
                      <span className="flex items-center font-medium text-sky-600 text-xs">
                        <Icon icon="mdi:numeric" className="mr-1" width={14} />
                        {t("batch.results")} {idx + 1}
                      </span>
                      {onSelectContent && (
                        <button
                          type="button"
                          className="flex min-h-[32px] items-center rounded-full border border-sky-200 bg-white px-3 py-1 font-medium text-sky-600 text-xs shadow-sm transition-all hover:bg-sky-100 hover:shadow"
                          onClick={() => handleContentSelect(idx)}
                          title={t("batch.results.selected")}>
                          <Icon
                            icon="mdi:check-circle-outline"
                            className="mr-1.5"
                            width={14}
                            height={14}
                          />
                          {t("batch.results.selected")}
                        </button>
                      )}
                    </div>
                    <div className="max-h-32 overflow-auto p-2 text-gray-700 text-xs md:max-h-40">
                      {content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <button
                type="button"
                className="max-h-32 w-full cursor-pointer overflow-auto rounded-lg border border-sky-100 bg-white p-2 text-left text-gray-700 shadow-sm md:max-h-40"
                onClick={() => handleContentSelect(0)}>
                {previewContent}
              </button>
            )}
          </div>
        )}
      </li>
    )
  }
)

SelectorItem.displayName = "SelectorItem"

// 标题组件
const SelectorHeader = memo<{
  type: SelectorType
  count: number
}>(({ type, count }) => {
  const { t } = useI18n()
  return (
    <div className="flex items-center gap-1 font-medium text-sky-600 text-xs">
      <span>{t(`selector.type.${type}`)}</span>
      <span className="whitespace-nowrap rounded-full bg-sky-100 px-1 py-0.5 font-medium text-sky-600 text-xs">
        {t("selector.count", { count })}
      </span>
    </div>
  )
})

SelectorHeader.displayName = "SelectorHeader"

// 下拉触发按钮
const DropdownToggle = memo<{
  isOpen: boolean
  toggleOpen: () => void
  selectedText: string
}>(({ isOpen, toggleOpen, selectedText }) => (
  <button
    type="button"
    onClick={toggleOpen}
    className="flex min-h-[36px] items-center rounded-lg border border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 px-3 py-1.5 font-medium text-sky-600 text-xs shadow-sm transition-all hover:shadow">
    <span className="mr-2 max-w-[12.5rem] truncate font-mono md:max-w-[9.375rem]">
      {selectedText}
    </span>
    <Icon
      icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
      className="text-sky-500 transition-transform duration-200"
      width={16}
      height={16}
    />
  </button>
))

DropdownToggle.displayName = "DropdownToggle"

// 自定义钩子，管理选择器的状态和操作
function useSelectorState(
  selectors: string[],
  results: SelectorResultItem[] = [],
  onChange: (index: number) => void,
  onSelectContent?: (selector: string, contentIndex: number) => void
) {
  const [isOpen, setIsOpen] = useState(false)
  const [showPreviewIndex, setShowPreviewIndex] = useState<number | null>(null)

  // 获取选择器的结果内容
  const getResultContent = useCallback(
    (selector: string): string => {
      const result = results.find((r) => r.selector === selector)
      return result?.content || ""
    },
    [results]
  )

  // 获取选择器的所有结果内容
  const getAllResultContents = useCallback(
    (selector: string): string[] => {
      // 首先检查是否有带有 allContent 的结果
      const result = results.find(
        (r) => r.selector === selector && r.allContent?.length
      )
      if (result?.allContent) {
        return result.allContent
      }

      // 如果没有 allContent，收集所有匹配该选择器的结果的 content
      const matchingResults = results
        .filter((r) => r.selector === selector && r.content)
        .map((r) => r.content)

      return matchingResults.length ? matchingResults : []
    },
    [results]
  )

  // 检查选择器是否有内容
  const hasContent = useCallback(
    (selector: string): boolean => {
      return results.some((r) => r.selector === selector && r.content)
    },
    [results]
  )

  // 处理选择器变化
  const handleSelectorChange = useCallback(
    (index: number) => {
      if (hasContent(selectors[index])) {
        onChange(index)
        setIsOpen(false)
      }
    },
    [selectors, hasContent, onChange]
  )

  // 切换预览状态
  const togglePreview = useCallback((index: number) => {
    setShowPreviewIndex((prevIndex) => (prevIndex === index ? null : index))
  }, [])

  // 关闭下拉菜单
  const closeDropdown = useCallback(() => {
    setIsOpen(false)
  }, [])

  // 切换下拉菜单开关状态
  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  // 自定义内容选择处理函数
  const handleSelectContent = useCallback(
    (selector: string, contentIndex: number) => {
      if (onSelectContent) {
        onSelectContent(selector, contentIndex)
        closeDropdown() // 选择内容后关闭下拉菜单
      }
    },
    [onSelectContent, closeDropdown]
  )

  return {
    isOpen,
    showPreviewIndex,
    getResultContent,
    getAllResultContents,
    hasContent,
    handleSelectorChange,
    togglePreview,
    closeDropdown,
    toggleDropdown,
    handleSelectContent
  }
}

const SelectorDropdown: React.FC<SelectorDropdownProps> = ({
  type,
  selectors,
  selectedIndex,
  results = [],
  onChange,
  onSelectContent
}) => {
  const { t } = useI18n()

  // 使用自定义钩子管理状态
  const {
    isOpen,
    showPreviewIndex,
    getResultContent,
    getAllResultContents,
    hasContent,
    handleSelectorChange,
    togglePreview,
    closeDropdown,
    toggleDropdown,
    handleSelectContent
  } = useSelectorState(selectors, results, onChange, onSelectContent)

  // 如果没有选择器，不显示下拉菜单
  if (!selectors?.length) return null

  return (
    <div className="relative ml-auto flex h-9 flex-wrap items-center justify-end gap-1">
      <SelectorHeader type={type} count={selectors.length} />
      <DropdownToggle
        isOpen={isOpen}
        toggleOpen={toggleDropdown}
        selectedText={selectors[selectedIndex] || t("common.none")}
      />

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 max-h-[60vh] w-auto max-w-[80vw] overflow-auto rounded-lg border border-sky-200 bg-white shadow-lg">
          <div className="border-sky-100 border-b bg-gradient-to-r from-sky-50 to-indigo-50 p-2.5 text-sky-600 text-xs">
            <div className="flex items-center">
              <Icon
                icon="mdi:information-outline"
                className="mr-1.5 text-indigo-500 md:mr-2"
                width={14}
                height={14}
              />
              <span>{t("selector.info")}</span>
            </div>
          </div>
          <ul className="max-h-[calc(60vh-3rem)] divide-y divide-sky-50 overflow-auto">
            {selectors.map((selector, index) => {
              const selectorHasContent = hasContent(selector)
              const allContents = getAllResultContents(selector)

              return (
                <SelectorItem
                  key={selector}
                  selector={selector}
                  index={index}
                  isSelected={index === selectedIndex}
                  hasContent={selectorHasContent}
                  onSelect={handleSelectorChange}
                  onTogglePreview={togglePreview}
                  showPreview={showPreviewIndex === index}
                  previewContent={getResultContent(selector)}
                  allPreviewContents={allContents}
                  onSelectContent={handleSelectContent}
                  closeDropdown={closeDropdown}
                />
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SelectorDropdown
