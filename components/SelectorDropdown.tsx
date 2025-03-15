import { Icon } from "@iconify/react"
import React, { useState } from "react"

import type { SelectorResultItem, SelectorType } from "~constants/types"

// 选择器类型映射到图标
const SELECTOR_TYPE_ICONS: Record<SelectorType, string> = {
  content: "mdi:text-box-outline",
  author: "mdi:account-outline",
  date: "mdi:calendar-outline",
  title: "mdi:format-title"
}

// 选择器类型映射到显示名称
const SELECTOR_TYPE_NAMES: Record<SelectorType, string> = {
  content: "内容选择器",
  author: "作者选择器",
  date: "日期选择器",
  title: "标题选择器"
}

interface SelectorDropdownProps {
  type: SelectorType
  selectors: string[]
  selectedIndex: number
  results?: SelectorResultItem[]
  onChange: (index: number) => void
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
}

const SelectorItem: React.FC<SelectorItemProps> = ({
  selector,
  index,
  isSelected,
  hasContent,
  onSelect,
  onTogglePreview,
  showPreview,
  previewContent
}) => (
  <li
    className={`relative border-t border-sky-100 ${
      isSelected ? "bg-sky-50 font-medium text-sky-700" : "hover:bg-blue-50"
    }`}>
    <button
      className="flex w-full items-center justify-between p-2 text-left text-xs"
      onClick={() => onSelect(index)}>
      <div className="flex items-center">
        {isSelected && (
          <Icon icon="mdi:check" className="mr-1 text-sky-500" width={14} />
        )}
        <span className="font-mono">{selector}</span>
      </div>
      <div className="flex items-center">
        {hasContent ? (
          <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] text-green-600">
            有结果
          </span>
        ) : (
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
            无结果
          </span>
        )}
        {hasContent && (
          <button
            className="ml-1 rounded-full p-1 text-sky-500 hover:bg-sky-100"
            onClick={(e) => {
              e.stopPropagation()
              onTogglePreview(index)
            }}>
            <Icon
              icon={showPreview ? "mdi:eye-off-outline" : "mdi:eye-outline"}
              width={14}
            />
          </button>
        )}
      </div>
    </button>

    {/* 内容预览 */}
    {hasContent && showPreview && (
      <div className="border-t border-sky-100 bg-blue-50 p-2">
        <div className="mb-1 text-xs font-medium text-sky-600">内容预览:</div>
        <div className="max-h-20 overflow-auto rounded bg-white p-1.5 text-xs text-gray-700">
          {previewContent}
        </div>
      </div>
    )}
  </li>
)

// 标题组件
const SelectorHeader: React.FC<{
  type: SelectorType
  count: number
}> = ({ type, count }) => (
  <div className="flex items-center text-xs text-sky-600">
    <Icon icon={SELECTOR_TYPE_ICONS[type]} className="mr-1" width={14} />
    <span>{SELECTOR_TYPE_NAMES[type]}</span>
    <span className="ml-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px]">
      {count}个
    </span>
  </div>
)

// 下拉触发按钮
const DropdownToggle: React.FC<{
  isOpen: boolean
  toggleOpen: () => void
  selectedText: string
}> = ({ isOpen, toggleOpen, selectedText }) => (
  <button
    onClick={toggleOpen}
    className="flex items-center rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-600 hover:bg-sky-100">
    <span className="mr-1 max-w-[150px] truncate font-mono">
      {selectedText}
    </span>
    <Icon icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"} width={14} />
  </button>
)

const SelectorDropdown: React.FC<SelectorDropdownProps> = ({
  type,
  selectors,
  selectedIndex,
  results = [],
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showPreviewIndex, setShowPreviewIndex] = useState<number | null>(null)

  // 如果没有选择器，不显示下拉菜单
  if (!selectors?.length) return null

  // 获取选择器的结果内容
  const getResultContent = (selector: string): string => {
    const result = results.find((r) => r.selector === selector)
    return result?.content || ""
  }

  // 处理选择器变化
  const handleSelectorChange = (index: number) => {
    onChange(index)
    setIsOpen(false)
  }

  // 切换预览状态
  const togglePreview = (index: number) => {
    setShowPreviewIndex(showPreviewIndex === index ? null : index)
  }

  return (
    <div className="relative mb-2">
      <div className="flex items-center justify-between">
        <SelectorHeader type={type} count={selectors.length} />
        <DropdownToggle
          isOpen={isOpen}
          toggleOpen={() => setIsOpen(!isOpen)}
          selectedText={selectors[selectedIndex] || "默认"}
        />
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-sky-200 bg-white shadow-lg">
          <div className="p-2 text-xs text-sky-500">
            选择不同的{SELECTOR_TYPE_NAMES[type]}查看抓取结果
          </div>
          <ul className="max-h-48 overflow-auto">
            {selectors.map((selector, index) => {
              const hasContent = results.some(
                (r) => r.selector === selector && r.content
              )
              return (
                <SelectorItem
                  key={index}
                  selector={selector}
                  index={index}
                  isSelected={index === selectedIndex}
                  hasContent={hasContent}
                  onSelect={handleSelectorChange}
                  onTogglePreview={togglePreview}
                  showPreview={showPreviewIndex === index}
                  previewContent={getResultContent(selector)}
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
