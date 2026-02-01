import { Icon } from "@iconify/react"
import { useCallback, useMemo, useState } from "react"

import type { ScrapedContent } from "~constants/types"
import { useI18n } from "~utils/i18n"
import { hasAnyPlaceholder, processTemplate } from "~utils/template"

import TokenizationDisplay from "../TokenizationDisplay"

interface PlaceholderInfo {
  placeholder: string
  description: string
}

// 提示词输入组件
const PromptInput = ({
  customPrompt,
  setCustomPrompt,
  systemPrompt,
  supportedPlaceholders,
  scrapedData,
  onSaveAsDefault
}: {
  customPrompt: string
  setCustomPrompt: (prompt: string) => void
  systemPrompt: string
  supportedPlaceholders?: PlaceholderInfo[]
  scrapedData?: ScrapedContent
  onSaveAsDefault?: (prompt: string) => void
}) => {
  const { t } = useI18n()
  const [showPlaceholders, setShowPlaceholders] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  const canSaveAsDefault = useMemo(() => {
    return onSaveAsDefault && customPrompt && systemPrompt !== customPrompt
  }, [customPrompt, systemPrompt, onSaveAsDefault])

  // 判断当前提示词中是否包含占位符
  const hasPlaceholders = hasAnyPlaceholder(customPrompt)

  // 获取预览内容
  const getPreviewContent = () => {
    if (!scrapedData || !customPrompt) return ""
    return processTemplate(customPrompt, scrapedData)
  }

  // 插入占位符到提示词文本
  const insertPlaceholder = (placeholder: string) => {
    setCustomPrompt(customPrompt + placeholder)
  }

  // 保存当前提示词为系统默认
  const handleSaveAsDefault = useCallback(() => {
    if (canSaveAsDefault) {
      onSaveAsDefault(customPrompt)
    }
  }, [canSaveAsDefault, customPrompt, onSaveAsDefault])

  return (
    <div className="mb-3">
      <div className="mb-2 rounded-lg border border-accent-indigo/20 bg-accent-indigo-ghost p-2">
        <p className="flex items-center text-accent-indigo text-xs">
          <Icon
            icon="line-md:information"
            className="mr-1 flex-shrink-0 text-accent-indigo"
            width="16"
            height="16"
          />
          <span>{t("ai.panel.prompt.help")}</span>
        </p>
      </div>
      <div className="relative">
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder={t("ai.panel.prompt.placeholder")}
          className="w-full rounded-xl border border-line-1 bg-content-solid p-3 text-sm text-text-1 shadow-sm transition-all hover:border-accent-blue/50 focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
          rows={4}
        />

        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          {supportedPlaceholders && supportedPlaceholders.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowPlaceholders(!showPlaceholders)}
                className="flex items-center rounded-md bg-fill-1 px-3 py-1.5 font-medium text-accent-blue text-sm shadow-sm transition-all hover:bg-fill-2 hover:shadow">
                <Icon
                  icon={
                    showPlaceholders
                      ? "line-md:chevron-down"
                      : "line-md:chevron-right"
                  }
                  className="mr-1.5"
                  width="18"
                  height="18"
                />
                {showPlaceholders
                  ? t("ai.panel.placeholders.hide")
                  : t("ai.panel.placeholders.show")}
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            {canSaveAsDefault && (
              <button
                type="button"
                onClick={handleSaveAsDefault}
                className="flex items-center rounded-md bg-purple-500/10 px-3 py-1.5 font-medium text-purple-600 text-sm shadow-sm transition-all hover:bg-purple-500/20 hover:shadow">
                <Icon
                  icon="line-md:check-list-3"
                  className="mr-1.5"
                  width="18"
                  height="18"
                />
                {t("scrape.prompt.saveDefault")}
              </button>
            )}
            {customPrompt !== systemPrompt && systemPrompt && (
              <button
                type="button"
                onClick={() => setCustomPrompt(systemPrompt)}
                className="flex items-center rounded-md bg-accent-indigo/10 px-3 py-1.5 font-medium text-accent-indigo text-sm shadow-sm transition-all hover:bg-accent-indigo/20 hover:shadow">
                <Icon
                  icon="line-md:restore"
                  className="mr-1.5"
                  width="18"
                  height="18"
                />
                {t("scrape.prompt.resetDefault")}
              </button>
            )}
            {hasPlaceholders && scrapedData && (
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center rounded-md bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-600 text-sm shadow-sm transition-all hover:bg-emerald-500/20 hover:shadow">
                <Icon
                  icon={showPreview ? "line-md:eye-off" : "line-md:eye"}
                  className="mr-1.5"
                  width="18"
                  height="18"
                />
                {showPreview
                  ? t("scrape.prompt.hidePreview")
                  : t("scrape.prompt.showPreview")}
              </button>
            )}
          </div>
        </div>

        {showPlaceholders &&
          supportedPlaceholders &&
          supportedPlaceholders.length > 0 && (
            <div className="mt-1 rounded-md border border-accent-blue/20 bg-accent-blue-ghost p-2">
              <p className="mb-1 text-accent-blue text-xs">
                {t("scrape.prompt.placeholderHelp")}
              </p>
              <div className="flex flex-wrap gap-2">
                {supportedPlaceholders.map((info) => (
                  <button
                    type="button"
                    key={info.placeholder}
                    onClick={() => insertPlaceholder(info.placeholder)}
                    className="rounded-md bg-content-solid px-2.5 py-1 text-accent-blue text-sm shadow-sm hover:bg-accent-blue-ghost-hover"
                    title={info.description}>
                    {info.placeholder} {info.description}
                  </button>
                ))}
              </div>
            </div>
          )}

        {showPreview && hasPlaceholders && scrapedData && (
          <div className="mt-2 rounded-md border border-success/20 bg-success/10 p-2">
            <p className="mb-1 flex items-center font-medium text-success text-xs">
              <Icon
                icon="line-md:document-code"
                className="mr-1 flex-shrink-0"
                width="16"
                height="16"
              />
              {t("scrape.prompt.previewTitle")}
            </p>
            <div className="max-h-40 overflow-y-auto rounded-md bg-content-solid p-2 text-text-2 text-xs">
              {getPreviewContent()}
            </div>

            <TokenizationDisplay
              showOnlySummary
              content={getPreviewContent()}
              isVisible={true}
              className="mt-2"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptInput
