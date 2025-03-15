import { Icon } from "@iconify/react"
import React, { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { useStorage } from "@plasmohq/storage/hook"

import {
  AUTHOR_SELECTORS,
  CONTENT_SELECTORS,
  DATE_SELECTORS,
  TITLE_SELECTORS
} from "../../constants/config"
import OptionSection from "./OptionSection"

// 存储键
const STORAGE_KEYS = {
  CONTENT: "custom_content_selectors",
  AUTHOR: "custom_author_selectors",
  DATE: "custom_date_selectors",
  TITLE: "custom_title_selectors"
}

// 选择器类型
type SelectorType = "content" | "author" | "date" | "title"

// 选择器类型映射到显示名称
const SELECTOR_TYPE_NAMES = {
  content: "内容选择器",
  author: "作者选择器",
  date: "日期选择器",
  title: "标题选择器"
}

// 选择器类型映射到图标
const SELECTOR_TYPE_ICONS = {
  content: "mdi:text-box-outline",
  author: "mdi:account-outline",
  date: "mdi:calendar-outline",
  title: "mdi:format-title"
}

// 选择器类型映射到描述
const SELECTOR_TYPE_DESCRIPTIONS = {
  content: "用于提取页面主要内容的CSS选择器",
  author: "用于提取作者信息的CSS选择器",
  date: "用于提取发布日期的CSS选择器",
  title: "用于提取文章标题的CSS选择器，系统会严格按照选择器列表顺序尝试匹配"
}

// 选择器类型映射到默认选择器
const DEFAULT_SELECTORS = {
  content: CONTENT_SELECTORS,
  author: AUTHOR_SELECTORS,
  date: DATE_SELECTORS,
  title: TITLE_SELECTORS
}

// 选择器编辑器组件
const SelectorEditor: React.FC<{
  type: SelectorType
  onClose: () => void
}> = ({ type, onClose }) => {
  // 从存储中获取自定义选择器，如果不存在则使用默认选择器
  const [selectors, setSelectors] = useStorage<string[]>(
    STORAGE_KEYS[type.toUpperCase()],
    DEFAULT_SELECTORS[type]
  )

  // 本地编辑状态
  const [editingSelectors, setEditingSelectors] = useState<string[]>([])
  const [newSelector, setNewSelector] = useState("")

  // 初始化编辑状态
  useEffect(() => {
    setEditingSelectors([...selectors])
  }, [selectors])

  // 添加新选择器
  const handleAddSelector = () => {
    if (!newSelector.trim()) {
      toast.error("选择器不能为空！")
      return
    }

    if (editingSelectors.includes(newSelector)) {
      toast.error("该选择器已存在！")
      return
    }

    setEditingSelectors([...editingSelectors, newSelector])
    setNewSelector("")
  }

  // 删除选择器
  const handleDeleteSelector = (index: number) => {
    const updatedSelectors = [...editingSelectors]
    updatedSelectors.splice(index, 1)
    setEditingSelectors(updatedSelectors)
  }

  // 上移选择器（提高优先级）
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const updatedSelectors = [...editingSelectors]
    const temp = updatedSelectors[index]
    updatedSelectors[index] = updatedSelectors[index - 1]
    updatedSelectors[index - 1] = temp
    setEditingSelectors(updatedSelectors)
  }

  // 下移选择器（降低优先级）
  const handleMoveDown = (index: number) => {
    if (index === editingSelectors.length - 1) return
    const updatedSelectors = [...editingSelectors]
    const temp = updatedSelectors[index]
    updatedSelectors[index] = updatedSelectors[index + 1]
    updatedSelectors[index + 1] = temp
    setEditingSelectors(updatedSelectors)
  }

  // 保存选择器
  const handleSave = () => {
    setSelectors(editingSelectors)
    toast.success("选择器已保存！(๑•̀ㅂ•́)و✧")
    onClose()
  }

  // 恢复默认选择器
  const handleResetToDefault = () => {
    setEditingSelectors([...DEFAULT_SELECTORS[type]])
    toast.info("已恢复默认选择器，点击保存后生效")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-sky-600">
            <Icon icon={SELECTOR_TYPE_ICONS[type]} className="mr-2 inline" />
            编辑{SELECTOR_TYPE_NAMES[type]}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100">
            <Icon icon="mdi:close" width={24} />
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-600">
          {SELECTOR_TYPE_DESCRIPTIONS[type]} (按优先级排序，从上到下)
          {type === "title" && (
            <>
              <br />
              <br />
              <strong>标题抓取规则说明：</strong>
              <ol className="mt-2 list-decimal pl-5">
                <li>系统会严格按照选择器列表的顺序从上到下依次尝试匹配</li>
                <li>
                  建议将最常用、最可靠的选择器放在列表前面，以提高抓取效率和准确性
                </li>
              </ol>
            </>
          )}
        </p>

        {/* 添加新选择器 */}
        <div className="mb-4 flex">
          <input
            type="text"
            value={newSelector}
            onChange={(e) => setNewSelector(e.target.value)}
            placeholder="输入新的CSS选择器..."
            className="flex-1 rounded-l-lg border border-sky-200 bg-blue-50 p-2 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <button
            onClick={handleAddSelector}
            className="rounded-r-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600">
            添加
          </button>
        </div>

        {/* 选择器列表 */}
        <div className="mb-4 max-h-[40vh] overflow-auto rounded-lg border border-sky-100">
          {editingSelectors.length > 0 ? (
            <ul className="divide-y divide-sky-100">
              {editingSelectors.map((selector, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-white p-3 hover:bg-blue-50">
                  <span className="flex-1 font-mono text-sm">{selector}</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="rounded p-1 text-sky-600 hover:bg-sky-100 disabled:text-gray-300">
                      <Icon icon="mdi:arrow-up" width={20} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === editingSelectors.length - 1}
                      className="rounded p-1 text-sky-600 hover:bg-sky-100 disabled:text-gray-300">
                      <Icon icon="mdi:arrow-down" width={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteSelector(index)}
                      className="rounded p-1 text-red-500 hover:bg-red-50">
                      <Icon icon="mdi:delete-outline" width={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-24 items-center justify-center text-gray-500">
              没有选择器，请添加或恢复默认值
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex justify-between">
          <button
            onClick={handleResetToDefault}
            className="rounded-lg border border-sky-300 bg-white px-4 py-2 text-sky-600 hover:bg-sky-50">
            恢复默认值
          </button>
          <div className="space-x-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">
              取消
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600">
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// 选择器类型卡片组件
const SelectorTypeCard: React.FC<{
  type: SelectorType
  onClick: () => void
}> = ({ type, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border-2 border-sky-100 bg-white p-4 shadow-sm transition-all hover:border-sky-300 hover:shadow-md">
      <div className="mb-2 flex items-center text-sky-600">
        <Icon icon={SELECTOR_TYPE_ICONS[type]} className="mr-2" width={24} />
        <h3 className="text-lg font-medium">{SELECTOR_TYPE_NAMES[type]}</h3>
      </div>
      <p className="text-sm text-gray-600">
        {SELECTOR_TYPE_DESCRIPTIONS[type]}
      </p>
    </div>
  )
}

// 主组件
export const SelectorSettingsSection: React.FC = () => {
  const [editingType, setEditingType] = useState<SelectorType | null>(null)

  // 处理打开编辑器
  const handleOpenEditor = (type: SelectorType) => {
    setEditingType(type)
  }

  // 处理关闭编辑器
  const handleCloseEditor = () => {
    setEditingType(null)
  }

  return (
    <OptionSection title="选择器设置" icon="line-md:document-code">
      <p className="mb-4 text-sm text-gray-600">
        自定义网页内容抓取时使用的CSS选择器。这些选择器按优先级排序，抓取器会依次尝试每个选择器直到找到匹配元素。
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectorTypeCard
          type="content"
          onClick={() => handleOpenEditor("content")}
        />
        <SelectorTypeCard
          type="author"
          onClick={() => handleOpenEditor("author")}
        />
        <SelectorTypeCard
          type="date"
          onClick={() => handleOpenEditor("date")}
        />
        <SelectorTypeCard
          type="title"
          onClick={() => handleOpenEditor("title")}
        />
      </div>

      {editingType && (
        <SelectorEditor type={editingType} onClose={handleCloseEditor} />
      )}
    </OptionSection>
  )
}

export default SelectorSettingsSection
