import { Icon } from "@iconify/react"
import { useCallback, useMemo, useState } from "react"

import type { PromptTemplate, ScrapedContent } from "~constants/types"
import { useI18n } from "~utils/i18n"
import { hasAnyPlaceholder, processTemplate } from "~utils/template"

import TokenizationDisplay from "../TokenizationDisplay"
import { PromptTemplateSelector } from "./PromptTemplateSelector"

interface PlaceholderInfo {
  placeholder: string
  description: string
}

interface CompactPromptInputProps {
  customPrompt: string
  setCustomPrompt: (prompt: string) => void
  systemPrompt: string
  supportedPlaceholders?: PlaceholderInfo[]
  scrapedData?: ScrapedContent
  onSaveAsDefault?: (prompt: string) => void
  disabled?: boolean
  templates?: PromptTemplate[]
  onSelectTemplate?: (template: PromptTemplate) => void
  createTemplate?: (name: string, content: string) => Promise<boolean>
  enablePortal?: boolean
}

const CompactPromptInput = ({
  customPrompt,
  setCustomPrompt,
  systemPrompt,
  supportedPlaceholders,
  scrapedData,
  onSaveAsDefault,
  disabled = false,
  templates,
  onSelectTemplate,
  createTemplate,
  enablePortal
}: CompactPromptInputProps) => {
  const { t } = useI18n()
  const [showPlaceholders, setShowPlaceholders] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState("")

  const handleSaveAsCurrent = useCallback(() => {
    setShowSaveDialog(true)
    setNewTemplateName("")
  }, [])

  const handleConfirmSave = useCallback(async () => {
    if (newTemplateName.trim() && customPrompt.trim() && createTemplate) {
      const ok = await createTemplate(newTemplateName, customPrompt)
      if (ok) setShowSaveDialog(false)
    }
  }, [newTemplateName, customPrompt, createTemplate])

  const canSaveAsDefault = useMemo(() => {
    return onSaveAsDefault && customPrompt && systemPrompt !== customPrompt
  }, [customPrompt, systemPrompt, onSaveAsDefault])

  const hasPlaceholders = hasAnyPlaceholder(customPrompt)

  const getPreviewContent = () => {
    if (!scrapedData || !customPrompt) return ""
    return processTemplate(customPrompt, scrapedData)
  }

  const insertPlaceholder = (placeholder: string) => {
    setCustomPrompt(customPrompt + placeholder)
  }

  const handleSaveAsDefault = () => {
    if (canSaveAsDefault) {
      onSaveAsDefault(customPrompt)
    }
  }

  return (
    <div className="space-y-2">
      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="compact-prompt-input"
          className="font-medium text-text-2 text-xs">
          {t("ai.panel.prompt.label")}
        </label>
        <div className="flex items-center gap-2">
          {templates && onSelectTemplate && (
            <PromptTemplateSelector
              templates={templates}
              onSelect={onSelectTemplate}
              onSaveAsCurrent={createTemplate ? handleSaveAsCurrent : undefined}
              disabled={disabled}
              enablePortal={enablePortal}
            />
          )}
          {supportedPlaceholders && supportedPlaceholders.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPlaceholders(!showPlaceholders)}
              className="flex items-center gap-1 text-sky-600 text-xs hover:text-sky-700">
              <Icon icon="mdi:code-braces" width={14} />
              {showPlaceholders
                ? t("ai.panel.placeholders.hide")
                : t("ai.panel.placeholders.title")}
            </button>
          )}
        </div>
      </div>

      {/* 输入框 */}
      <textarea
        id="compact-prompt-input"
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        disabled={disabled}
        placeholder={t("ai.prompt.placeholder")}
        className="w-full rounded border border-line-1 bg-content px-2 py-1.5 text-text-1 text-xs focus:border-accent-blue focus:outline-none disabled:opacity-50"
        rows={4}
      />

      {/* Save as template dialog */}
      {showSaveDialog && (
        <div className="flex items-center gap-2 rounded border border-accent-blue/20 bg-accent-blue-ghost p-2">
          <input
            type="text"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder={t("promptTemplate.selector.namePlaceholder")}
            className="flex-1 rounded border border-line-1 bg-content px-2 py-1 text-xs focus:border-accent-blue focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirmSave()
              if (e.key === "Escape") setShowSaveDialog(false)
            }}
          />
          <button
            type="button"
            onClick={handleConfirmSave}
            className="rounded bg-accent-blue px-2 py-1 text-white text-xs hover:bg-accent-blue-hover">
            {t("common.save")}
          </button>
          <button
            type="button"
            onClick={() => setShowSaveDialog(false)}
            className="rounded bg-content-alt px-2 py-1 text-text-2 text-xs hover:bg-content-alt/80">
            {t("common.cancel")}
          </button>
        </div>
      )}

      {/* 占位符列表 */}
      {showPlaceholders &&
        supportedPlaceholders &&
        supportedPlaceholders.length > 0 && (
          <div className="rounded border border-accent-blue/20 bg-accent-blue-ghost p-2">
            <p className="mb-1.5 text-text-3 text-xs">
              {t("scrape.prompt.placeholderHelp")}
            </p>
            <div className="flex flex-wrap gap-1">
              {supportedPlaceholders.map((info) => (
                <button
                  key={info.placeholder}
                  type="button"
                  onClick={() => insertPlaceholder(info.placeholder)}
                  disabled={disabled}
                  className="rounded bg-content-solid px-1.5 py-0.5 text-accent-blue text-xs shadow-sm hover:bg-accent-blue-ghost-hover disabled:opacity-50"
                  title={info.description}>
                  {info.placeholder}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* 操作按钮 */}
      <div className="flex flex-wrap items-center gap-1.5">
        {canSaveAsDefault && (
          <button
            type="button"
            onClick={handleSaveAsDefault}
            disabled={disabled}
            className="flex items-center gap-1 rounded bg-purple-100 px-2 py-1 text-purple-600 text-xs hover:bg-purple-200 disabled:opacity-50">
            <Icon icon="mdi:content-save" width={12} />
            {t("scrape.prompt.saveDefault")}
          </button>
        )}
        {customPrompt !== systemPrompt && systemPrompt && (
          <button
            type="button"
            onClick={() => setCustomPrompt(systemPrompt)}
            disabled={disabled}
            className="flex items-center gap-1 rounded bg-content-alt px-2 py-1 text-text-2 text-xs hover:bg-content-alt/80 disabled:opacity-50">
            <Icon icon="mdi:restore" width={12} />
            {t("scrape.prompt.resetDefault")}
          </button>
        )}
        {hasPlaceholders && scrapedData && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            disabled={disabled}
            className="flex items-center gap-1 rounded bg-success-ghost px-2 py-1 text-success text-xs hover:bg-success-ghost-hover disabled:opacity-50">
            <Icon icon={showPreview ? "mdi:eye-off" : "mdi:eye"} width={12} />
            {showPreview
              ? t("scrape.prompt.hidePreview")
              : t("scrape.prompt.showPreview")}
          </button>
        )}
      </div>

      {/* 预览区域 */}
      {showPreview && hasPlaceholders && scrapedData && (
        <div className="rounded border border-success/20 bg-success/10 p-2">
          <p className="mb-1 flex items-center gap-1 text-success text-xs">
            <Icon icon="mdi:file-document-outline" width={12} />
            {t("scrape.prompt.previewTitle")}
          </p>
          <div className="max-h-24 overflow-y-auto rounded bg-content-solid p-1.5 text-text-2 text-xs">
            {getPreviewContent()}
          </div>
          <TokenizationDisplay
            showOnlySummary
            content={getPreviewContent()}
            isVisible={true}
            className="mt-1.5"
          />
        </div>
      )}
    </div>
  )
}

export default CompactPromptInput
