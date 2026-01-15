import { Icon } from "@iconify/react"
import { useStorage } from "@plasmohq/storage/hook"
import type React from "react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import { Button } from "~/components/ui/button"
import { useI18n } from "~utils/i18n"
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

// 选择器类型映射到图标
const SELECTOR_TYPE_ICONS = {
  content: "mdi:text-box-outline",
  author: "mdi:account-outline",
  date: "mdi:calendar-outline",
  title: "mdi:format-title"
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
  const { t } = useI18n()
  // 从存储中获取自定义选择器，如果不存在则使用默认选择器
  const [selectors, setSelectors] = useStorage<string[]>(
    STORAGE_KEYS[type.toUpperCase()],
    DEFAULT_SELECTORS[type]
  )

  // 本地编辑状态
  const [editingSelectors, setEditingSelectors] = useState<string[]>([])
  const [newSelector, setNewSelector] = useState("")
  const [showRules, setShowRules] = useState(true)

  // 初始化编辑状态
  useEffect(() => {
    setEditingSelectors([...selectors])
  }, [selectors])

  // 添加新选择器
  const handleAddSelector = () => {
    if (!newSelector.trim()) {
      toast.error(t("option.selector.emptyError"))
      return
    }

    if (editingSelectors.includes(newSelector)) {
      toast.error(t("option.selector.duplicateError"))
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
    toast.success(t("option.selector.saved"))
    onClose()
  }

  // 恢复默认选择器
  const handleResetToDefault = () => {
    setEditingSelectors([...DEFAULT_SELECTORS[type]])
    toast.info(t("option.selector.resetInfo"))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-sky-600 text-xl">
            <Icon icon={SELECTOR_TYPE_ICONS[type]} className="mr-2 inline" />
            {t("option.selector.edit", {
              type: t(`option.selector.type.${type}`)
            })}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon icon="mdi:close" width={24} />
          </Button>
        </div>

        <p className="mb-4 text-gray-600 text-sm">
          {t(`option.selector.type.${type}.desc`)} (
          {t("option.selector.priority")})
        </p>

        {(type === "title" || type === "content") && (
          <div className="mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRules(!showRules)}>
              <Icon
                icon={showRules ? "mdi:chevron-up" : "mdi:chevron-down"}
                className="mr-1.5"
                width={16}
              />
              {showRules
                ? t("option.selector.collapseRules")
                : t("option.selector.expandRules")}
            </Button>

            {type === "title" && (
              <div
                className={`origin-top transform transition-all duration-300 ease-in-out ${
                  showRules
                    ? "mt-3 max-h-[500px] scale-100 opacity-100"
                    : "mt-0 max-h-0 scale-98 overflow-hidden opacity-0"
                }`}>
                <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
                  <strong className="mb-2 flex items-center text-sky-700">
                    <Icon
                      icon="mdi:information-outline"
                      className="mr-1"
                      width={16}
                    />
                    {t("option.selector.titleRulesTitle")}
                  </strong>
                  <ol className="ml-5 list-decimal space-y-1 text-gray-600">
                    <li>{t("option.selector.titleRule1")}</li>
                    <li>{t("option.selector.titleRule2")}</li>
                  </ol>
                </div>
              </div>
            )}

            {type === "content" && (
              <div
                className={`origin-top transform transition-all duration-300 ease-in-out ${
                  showRules
                    ? "mt-3 max-h-[500px] scale-100 opacity-100"
                    : "mt-0 max-h-0 scale-98 overflow-hidden opacity-0"
                }`}>
                <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
                  <strong className="mb-2 flex items-center text-sky-700">
                    <Icon
                      icon="mdi:information-outline"
                      className="mr-1"
                      width={16}
                    />
                    {t("option.selector.contentRulesTitle")}
                  </strong>
                  <ol className="ml-5 list-decimal space-y-1 text-gray-600">
                    <li>{t("option.selector.contentRule1")}</li>
                    <li>{t("option.selector.contentRule2")}</li>
                    <li>{t("option.selector.contentRule3")}</li>
                    <li>{t("option.selector.contentRule4")}</li>
                    <li>{t("option.selector.contentRule5")}</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 添加新选择器 */}
        <div className="mb-4 flex">
          <input
            type="text"
            value={newSelector}
            onChange={(e) => setNewSelector(e.target.value)}
            placeholder={t("option.selector.inputPlaceholder")}
            className="flex-1 rounded-l-lg border border-sky-200 bg-blue-50 p-2 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <Button onClick={handleAddSelector} className="rounded-l-none">
            {t("option.selector.add")}
          </Button>
        </div>

        {/* 选择器列表 */}
        <div className="mb-4 max-h-[40vh] overflow-auto rounded-lg border border-sky-100">
          {editingSelectors.length > 0 ? (
            <ul className="divide-y divide-sky-100">
              {editingSelectors.map((selector, index) => {
                // Selectors may be duplicated, so index is needed for uniqueness
                const itemKey = `selector-${index}-${selector.slice(0, 10)}`
                return (
                  <li
                    key={itemKey}
                    className="flex items-center justify-between bg-white p-3 hover:bg-blue-50">
                    <span className="flex-1 font-mono text-sm">{selector}</span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="h-7 w-7">
                        <Icon icon="mdi:arrow-up" width={20} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === editingSelectors.length - 1}
                        className="h-7 w-7">
                        <Icon icon="mdi:arrow-down" width={20} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSelector(index)}
                        className="h-7 w-7 text-red-500 hover:text-red-600">
                        <Icon icon="mdi:delete-outline" width={20} />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex h-24 items-center justify-center text-gray-500">
              {t("option.selector.emptyList")}
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleResetToDefault}>
            {t("option.selector.resetDefault")}
          </Button>
          <div className="space-x-2">
            <Button variant="secondary" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSave}>{t("common.save")}</Button>
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
  const { t } = useI18n()
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full cursor-pointer rounded-lg border-2 border-sky-100 bg-white p-4 text-left shadow-sm transition-all hover:border-sky-300 hover:shadow-md">
      <div className="mb-2 flex items-center text-sky-600">
        <Icon icon={SELECTOR_TYPE_ICONS[type]} className="mr-2" width={24} />
        <h3 className="font-medium text-lg">
          {t(`option.selector.type.${type}`)}
        </h3>
      </div>
      <p className="text-gray-600 text-sm">
        {t(`option.selector.type.${type}.desc`)}
      </p>
    </button>
  )
}

// 抓取规则说明组件
const ScrapeRulesExplanation = () => {
  const { t } = useI18n()
  return (
    <div className="rounded-lg border-2 border-sky-100 bg-white p-5 text-sm shadow-sm">
      <h4 className="mb-3 flex items-center font-semibold text-sky-600">
        <Icon icon="mdi:information-outline" className="mr-2" width={20} />
        {t("option.selector.rulesExplanationTitle")}
      </h4>
      <p className="mb-3 text-gray-600">{t("option.selector.rulesIntro")}</p>
      <ol className="mb-4 ml-5 list-decimal space-y-2 text-gray-600">
        <li>{t("option.selector.contentRule1")}</li>
        <li>{t("option.selector.contentRule2")}</li>
        <li>{t("option.selector.contentRule3")}</li>
        <li>{t("option.selector.contentRule4")}</li>
        <li>{t("option.selector.contentRule5")}</li>
      </ol>
      <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
        <p className="mb-2 font-medium text-sky-700">
          {t("option.selector.defaultListTitle")}
        </p>
        <div className="max-h-32 overflow-y-auto rounded border border-sky-100 bg-white p-2">
          <code className="font-mono text-gray-600 text-xs">
            {CONTENT_SELECTORS.join(", ")}
          </code>
        </div>
      </div>
    </div>
  )
}

// 主组件
export const SelectorSettingsSection: React.FC = () => {
  const { t } = useI18n()
  const [editingType, setEditingType] = useState<SelectorType | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  // 处理打开编辑器
  const handleOpenEditor = (type: SelectorType) => {
    setEditingType(type)
  }

  // 处理关闭编辑器
  const handleCloseEditor = () => {
    setEditingType(null)
  }

  return (
    <OptionSection
      title={t("option.selector.title")}
      icon="line-md:document-code">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-gray-600 text-sm">
          {t("option.selector.desc")}
        </span>
        <Button
          variant="outline"
          size="xs"
          onClick={() => setShowExplanation(!showExplanation)}>
          <Icon
            icon={showExplanation ? "mdi:eye-off-outline" : "mdi:eye-outline"}
            className="mr-1.5"
            width={18}
          />
          {showExplanation
            ? t("option.selector.hideRules")
            : t("option.selector.showRules")}
        </Button>
      </div>

      <div
        className={`origin-top transform transition-all duration-500 ease-in-out ${
          showExplanation
            ? "mb-6 max-h-[1000px] scale-100 opacity-100"
            : "mb-0 max-h-0 scale-98 overflow-hidden opacity-0"
        }`}
        style={{
          transitionDelay: showExplanation ? "0ms" : "100ms"
        }}>
        <ScrapeRulesExplanation />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 内容选择器卡片 */}
        <SelectorTypeCard
          type="content"
          onClick={() => handleOpenEditor("content")}
        />
        {/* 作者选择器卡片 */}
        <SelectorTypeCard
          type="author"
          onClick={() => handleOpenEditor("author")}
        />
        {/* 日期选择器卡片 */}
        <SelectorTypeCard
          type="date"
          onClick={() => handleOpenEditor("date")}
        />
        {/* 标题选择器卡片 */}
        <SelectorTypeCard
          type="title"
          onClick={() => handleOpenEditor("title")}
        />
      </div>

      {/* 选择器编辑器弹窗 */}
      {editingType && (
        <SelectorEditor type={editingType} onClose={handleCloseEditor} />
      )}
    </OptionSection>
  )
}

export default SelectorSettingsSection
