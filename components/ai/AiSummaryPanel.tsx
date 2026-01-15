import { Icon } from "@iconify/react"
import { countTokens } from "gpt-tokenizer"
import { memo, useCallback, useMemo, useState } from "react"

import type { ScrapedContent } from "~constants/types"
import { useAiSummary } from "~hooks/useAiSummary"
import { useI18n } from "~utils/i18n"
import { processTemplate } from "~utils/template"

import { AccordionSection } from "../AccordionSection"
import AiHistoryDrawer from "./AiHistoryDrawer"
import CompactPromptInput from "./CompactPromptInput"
import SummaryResultDisplay from "./SummaryResultDisplay"

interface PlaceholderInfo {
  placeholder: string
  description: string
}

interface AiSummaryPanelProps {
  // 内容相关
  content: string
  scrapedData: ScrapedContent

  // 可选配置
  placeholders?: PlaceholderInfo[]
  defaultOpen?: boolean
  showHistory?: boolean
  showTokenEstimate?: boolean
  title?: string

  // 回调
  onSummaryGenerated?: (summary: string) => void
}

// 默认占位符生成函数
const getDefaultPlaceholders = (
  t: (key: string) => string
): PlaceholderInfo[] => [
  { placeholder: "{{content}}", description: t("scrape.placeholders.content") },
  { placeholder: "{{title}}", description: t("scrape.placeholders.title") },
  { placeholder: "{{url}}", description: t("scrape.placeholders.url") },
  {
    placeholder: "{{cleanedContent}}",
    description: t("scrape.placeholders.cleanedContent")
  }
]

const AiSummaryPanel = memo(function AiSummaryPanel({
  content,
  scrapedData,
  placeholders,
  defaultOpen = false,
  showHistory = false,
  showTokenEstimate = true,
  title,
  onSummaryGenerated
}: AiSummaryPanelProps) {
  const { t } = useI18n()
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)

  const finalPlaceholders = placeholders || getDefaultPlaceholders(t)
  const finalTitle = title || t("ai.panel.title")

  const {
    summary,
    streamingText,
    isLoading,
    error,
    customPrompt,
    setCustomPrompt,
    systemPrompt,
    generateSummaryText,
    saveAsDefaultPrompt,
    usage,
    modelId
  } = useAiSummary(content, onSummaryGenerated, scrapedData)

  // 预估 token 数量 - 基于模板替换后的完整提示词
  const processedPrompt = useMemo(
    () =>
      customPrompt && scrapedData
        ? processTemplate(customPrompt, scrapedData)
        : "",
    [customPrompt, scrapedData]
  )
  const tokenCount = useMemo(
    () => countTokens(processedPrompt),
    [processedPrompt]
  )

  const displayText = summary || streamingText || ""

  const toggleHistoryDrawer = useCallback(
    () => setIsHistoryDrawerOpen((prev) => !prev),
    []
  )

  return (
    <div className="space-y-2">
      {/* Token 预估信息 */}
      {showTokenEstimate && (
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 text-xs">
          <Icon icon="mdi:counter" width={16} className="text-amber-500" />
          <span className="text-gray-600">
            {t("content.tokenization.stats", {
              chars: processedPrompt.length,
              tokens: tokenCount
            })}
          </span>
        </div>
      )}

      <AccordionSection
        title={finalTitle}
        icon="line-md:chat-round-dots-twotone"
        defaultOpen={defaultOpen}
        contentBorder={false}>
        <div className="space-y-3">
          {/* 提示词输入 */}
          <CompactPromptInput
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            systemPrompt={systemPrompt}
            supportedPlaceholders={finalPlaceholders}
            scrapedData={scrapedData}
            onSaveAsDefault={saveAsDefaultPrompt}
            disabled={isLoading}
          />

          {/* 操作行：模型 + 历史 + 生成按钮 */}
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-xs ${modelId ? "text-gray-500" : "text-amber-500"}`}>
              {modelId || t("ai.model.select")}
            </span>

            {showHistory && (
              <button
                type="button"
                onClick={toggleHistoryDrawer}
                className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs hover:bg-gray-200">
                <Icon icon="mdi:history" width={12} />
                {t("ai.panel.history")}
              </button>
            )}

            <button
              type="button"
              onClick={generateSummaryText}
              disabled={isLoading || !content}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 py-2 font-medium text-white text-xs shadow-sm transition-all hover:from-sky-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? (
                <>
                  <Icon
                    icon="mdi:loading"
                    width={14}
                    className="animate-spin"
                  />
                  {t("ai.panel.generating")}
                </>
              ) : (
                <>
                  <Icon icon="line-md:lightbulb-twotone" width={14} />
                  {t("ai.panel.generate")}
                </>
              )}
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-1 rounded bg-red-50 px-2 py-1.5 text-red-600 text-xs">
              <Icon icon="mdi:alert-circle" width={14} />
              {error}
            </div>
          )}

          {/* 摘要结果 */}
          {displayText && (
            <SummaryResultDisplay
              content={displayText}
              isStreaming={isLoading && !summary}
              className="pt-2"
            />
          )}

          {/* Token 统计 */}
          {usage?.total_tokens && (
            <div className="flex items-center gap-3 border-gray-100 border-t pt-2 text-gray-500 text-xs">
              <span className="flex items-center gap-1">
                <Icon icon="mdi:counter" width={12} />
                {t("ai.history.detail.metadata.tokens")}:{" "}
                <b className="text-gray-700">{usage.total_tokens}</b>
              </span>
              <span className="text-gray-300">|</span>
              <span>
                {t("batch.stats.prompt")}:{" "}
                <b className="text-sky-600">{usage.prompt_tokens}</b>
              </span>
              <span className="text-gray-300">|</span>
              <span>
                {t("batch.stats.completion")}:
                <b className="text-emerald-600">{usage.completion_tokens}</b>
              </span>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* 历史记录抽屉 */}
      {showHistory && (
        <AiHistoryDrawer
          isOpen={isHistoryDrawerOpen}
          onClose={toggleHistoryDrawer}
        />
      )}
    </div>
  )
})

export default AiSummaryPanel
