import { Icon } from "@iconify/react"
import { useMemo, useState } from "react"

import type { ScrapedContent } from "~constants/types"
import { hasAnyPlaceholder, processTemplate } from "~utils/template"

import TokenizationDisplay from "../TokenizationDisplay"

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
}

const CompactPromptInput = ({
  customPrompt,
  setCustomPrompt,
  systemPrompt,
  supportedPlaceholders,
  scrapedData,
  onSaveAsDefault,
  disabled = false
}: CompactPromptInputProps) => {
  const [showPlaceholders, setShowPlaceholders] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

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
        <label className="text-xs font-medium text-gray-600">提示词</label>
        {supportedPlaceholders && supportedPlaceholders.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPlaceholders(!showPlaceholders)}
            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700"
          >
            <Icon icon="mdi:code-braces" width={14} />
            {showPlaceholders ? "隐藏占位符" : "占位符"}
          </button>
        )}
      </div>

      {/* 输入框 */}
      <textarea
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        disabled={disabled}
        placeholder="输入提示词..."
        className="w-full rounded border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs focus:border-sky-400 focus:outline-none disabled:opacity-50"
        rows={2}
      />

      {/* 占位符列表 */}
      {showPlaceholders && supportedPlaceholders && supportedPlaceholders.length > 0 && (
        <div className="rounded border border-sky-100 bg-sky-50/50 p-2">
          <p className="mb-1.5 text-xs text-gray-500">点击插入：</p>
          <div className="flex flex-wrap gap-1">
            {supportedPlaceholders.map((info) => (
              <button
                key={info.placeholder}
                type="button"
                onClick={() => insertPlaceholder(info.placeholder)}
                disabled={disabled}
                className="rounded bg-white px-1.5 py-0.5 text-xs text-sky-700 shadow-sm hover:bg-sky-100 disabled:opacity-50"
                title={info.description}
              >
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
            className="flex items-center gap-1 rounded bg-purple-100 px-2 py-1 text-xs text-purple-600 hover:bg-purple-200 disabled:opacity-50"
          >
            <Icon icon="mdi:content-save" width={12} />
            保存默认
          </button>
        )}
        {customPrompt !== systemPrompt && systemPrompt && (
          <button
            type="button"
            onClick={() => setCustomPrompt(systemPrompt)}
            disabled={disabled}
            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            <Icon icon="mdi:restore" width={12} />
            还原
          </button>
        )}
        {hasPlaceholders && scrapedData && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            disabled={disabled}
            className="flex items-center gap-1 rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-200 disabled:opacity-50"
          >
            <Icon icon={showPreview ? "mdi:eye-off" : "mdi:eye"} width={12} />
            {showPreview ? "隐藏" : "预览"}
          </button>
        )}
      </div>

      {/* 预览区域 */}
      {showPreview && hasPlaceholders && scrapedData && (
        <div className="rounded border border-emerald-100 bg-emerald-50/50 p-2">
          <p className="mb-1 flex items-center gap-1 text-xs text-emerald-700">
            <Icon icon="mdi:file-document-outline" width={12} />
            替换后预览：
          </p>
          <div className="max-h-24 overflow-y-auto rounded bg-white p-1.5 text-xs text-gray-600">
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
