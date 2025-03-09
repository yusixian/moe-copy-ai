import { Icon } from "@iconify/react"
import React, { useState } from "react"

import type { SelectorResultItem, SelectorType } from "~constants/types"

// 选择器类型映射到图标
const SELECTOR_TYPE_ICONS = {
  content: "mdi:text-box-outline",
  author: "mdi:account-outline",
  date: "mdi:calendar-outline",
  title: "mdi:format-title"
}

// 选择器类型映射到显示名称
const SELECTOR_TYPE_NAMES = {
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

const SelectorDropdown: React.FC<SelectorDropdownProps> = ({
  type,
  selectors,
  selectedIndex,
  results = [],
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showPreview, setShowPreview] = useState<number | null>(null)

  // 处理选择器变化
  const handleSelectorChange = (index: number) => {
    onChange(index)
    setIsOpen(false)
  }

  // 获取选择器的结果内容
  const getResultContent = (selector: string): string => {
    const result = results.find((r) => r.selector === selector)
    return result?.content || "无内容"
  }

  // 获取选择器的结果预览
  const getResultPreview = (selector: string): string => {
    const content = getResultContent(selector)
    if (!content || content === "无内容") return "无内容"

    // 限制预览长度
    return content.length > 100 ? content.substring(0, 100) + "..." : content
  }

  // 如果没有选择器，不显示下拉菜单
  if (!selectors || selectors.length === 0) {
    return null
  }

  return (
    <div className="relative mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-xs text-sky-600">
          <Icon icon={SELECTOR_TYPE_ICONS[type]} className="mr-1" width={14} />
          <span>{SELECTOR_TYPE_NAMES[type]}</span>
          <span className="ml-1 rounded-full bg-sky-100 px-1.5 py-0.5 text-[10px]">
            {selectors.length}个
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-600 hover:bg-sky-100">
          <span className="mr-1 max-w-[150px] truncate font-mono">
            {selectors[selectedIndex] || "默认"}
          </span>
          <Icon
            icon={isOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
            width={14}
          />
        </button>
      </div>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-sky-200 bg-white shadow-lg">
          <div className="p-2 text-xs text-sky-500">
            选择不同的{SELECTOR_TYPE_NAMES[type]}查看抓取结果
          </div>
          <ul className="max-h-48 overflow-auto">
            {selectors.map((selector, index) => (
              <li
                key={index}
                className={`relative border-t border-sky-100 ${
                  index === selectedIndex
                    ? "bg-sky-50 font-medium text-sky-700"
                    : "hover:bg-blue-50"
                }`}>
                <button
                  className="flex w-full items-center justify-between p-2 text-left text-xs"
                  onClick={() => handleSelectorChange(index)}>
                  <div className="flex items-center">
                    {index === selectedIndex && (
                      <Icon
                        icon="mdi:check"
                        className="mr-1 text-sky-500"
                        width={14}
                      />
                    )}
                    <span className="font-mono">{selector}</span>
                  </div>
                  <div className="flex items-center">
                    {results.some((r) => r.selector === selector) ? (
                      <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] text-green-600">
                        有结果
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                        无结果
                      </span>
                    )}
                    <button
                      className="ml-1 rounded-full p-1 text-sky-500 hover:bg-sky-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowPreview(showPreview === index ? null : index)
                      }}>
                      <Icon
                        icon={
                          showPreview === index
                            ? "mdi:eye-off-outline"
                            : "mdi:eye-outline"
                        }
                        width={14}
                      />
                    </button>
                  </div>
                </button>

                {/* 内容预览 */}
                {showPreview === index && (
                  <div className="border-t border-sky-100 bg-blue-50 p-2">
                    <div className="mb-1 text-xs font-medium text-sky-600">
                      内容预览:
                    </div>
                    <div className="max-h-20 overflow-auto rounded bg-white p-1.5 text-xs text-gray-700">
                      {getResultPreview(selector)}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SelectorDropdown
