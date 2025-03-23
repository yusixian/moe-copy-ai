import { Icon } from "@iconify/react"
import { useCallback, useMemo, useState } from "react"

import type { ScrapedContent } from "~constants/types"
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
      <div className="mb-2 rounded-lg border border-indigo-100 bg-indigo-50 p-2">
        <p className="flex items-center text-xs text-indigo-700">
          <Icon
            icon="line-md:information"
            className="mr-1 flex-shrink-0 text-indigo-500"
            width="16"
            height="16"
          />
          <span>
            以下是系统默认提示词，您可以根据需要修改。自定义提示词将覆盖系统设置中的默认提示词。
          </span>
        </p>
      </div>
      <div className="relative">
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="输入自定义提示词（可选），例如：'总结这篇文章的主要观点，列出3-5个要点'"
          className="w-full rounded-xl border border-sky-200 bg-white p-3 text-sm shadow-sm transition-all hover:border-sky-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          rows={4}
        />

        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
          {supportedPlaceholders && supportedPlaceholders.length > 0 && (
            <div>
              <button
                onClick={() => setShowPlaceholders(!showPlaceholders)}
                className="flex items-center rounded-md bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-600 shadow-sm transition-all hover:bg-sky-200 hover:shadow">
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
                  ? "隐藏占位符 (。_。)"
                  : "查看可用占位符 (・ω・)"}
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            {canSaveAsDefault && (
              <button
                onClick={handleSaveAsDefault}
                className="flex items-center rounded-md bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-600 shadow-sm transition-all hover:bg-purple-200 hover:shadow">
                <Icon
                  icon="line-md:check-list-3"
                  className="mr-1.5"
                  width="18"
                  height="18"
                />
                保存为默认
              </button>
            )}
            {customPrompt !== systemPrompt && systemPrompt && (
              <button
                onClick={() => setCustomPrompt(systemPrompt)}
                className="flex items-center rounded-md bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-600 shadow-sm transition-all hover:bg-indigo-200 hover:shadow">
                <Icon
                  icon="line-md:restore"
                  className="mr-1.5"
                  width="18"
                  height="18"
                />
                还原默认
              </button>
            )}
            {hasPlaceholders && scrapedData && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center rounded-md bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-600 shadow-sm transition-all hover:bg-emerald-200 hover:shadow">
                <Icon
                  icon={showPreview ? "line-md:eye-off" : "line-md:eye"}
                  className="mr-1.5"
                  width="18"
                  height="18"
                />
                {showPreview ? "隐藏预览" : "预览模板"}
              </button>
            )}
          </div>
        </div>

        {showPlaceholders &&
          supportedPlaceholders &&
          supportedPlaceholders.length > 0 && (
            <div className="mt-1 rounded-md border border-sky-100 bg-sky-50 p-2">
              <p className="mb-1 text-xs text-sky-700">
                点击以下占位符插入到提示词中：
              </p>
              <div className="flex flex-wrap gap-2">
                {supportedPlaceholders.map((info) => (
                  <button
                    key={info.placeholder}
                    onClick={() => insertPlaceholder(info.placeholder)}
                    className="rounded-md bg-white px-2.5 py-1 text-sm text-sky-700 shadow-sm hover:bg-sky-100"
                    title={info.description}>
                    {info.placeholder} {info.description}
                  </button>
                ))}
              </div>
            </div>
          )}

        {showPreview && hasPlaceholders && scrapedData && (
          <div className="mt-2 rounded-md border border-emerald-100 bg-emerald-50 p-2">
            <p className="mb-1 flex items-center text-xs font-medium text-emerald-700">
              <Icon
                icon="line-md:document-code"
                className="mr-1 flex-shrink-0"
                width="16"
                height="16"
              />
              占位符替换后的预览：
            </p>
            <div className="max-h-40 overflow-y-auto rounded-md bg-white p-2 text-xs text-slate-700">
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
