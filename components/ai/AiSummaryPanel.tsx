import { Icon } from "@iconify/react"
import { countTokens } from "gpt-tokenizer"
import { memo, useCallback, useMemo, useState } from "react"

import type { PromptTemplate, ScrapedContent } from "~constants/types"
import { useAiSummary } from "~hooks/useAiSummary"
import { usePromptTemplates } from "~hooks/usePromptTemplates"
import { useI18n } from "~utils/i18n"
import { processTemplate } from "~utils/template"

import { Collapsible } from "../ui/collapsible"
import AiHistoryDrawer from "./AiHistoryDrawer"
import { AiSendButton } from "./AiSendButton"
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
  enablePortal?: boolean
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
  onSummaryGenerated,
  enablePortal
}: AiSummaryPanelProps) {
  const { t } = useI18n()
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)
  const { templates, createTemplate } = usePromptTemplates()

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

  const handleSelectTemplate = useCallback(
    (tpl: PromptTemplate) => setCustomPrompt(tpl.content),
    [setCustomPrompt]
  )

  return (
    <div className="space-y-2">
      {/* Token 预估信息 */}
      {showTokenEstimate && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-ghost px-3 py-2 text-xs">
          <Icon icon="mdi:counter" width={16} className="text-warning" />
          <span className="text-text-2">
            {t("content.tokenization.stats", {
              chars: processedPrompt.length,
              tokens: tokenCount
            })}
          </span>
        </div>
      )}

      <Collapsible
        title={finalTitle}
        icon={<Icon icon="line-md:chat-round-dots-twotone" width={16} />}
        defaultExpanded={defaultOpen}>
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
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            createTemplate={createTemplate}
            enablePortal={enablePortal}
          />

          {/* 操作行：模型 + 历史 + 生成按钮 */}
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-xs ${modelId ? "text-text-3" : "text-warning"}`}>
              {modelId || t("ai.model.select")}
            </span>

            {showHistory && (
              <button
                type="button"
                onClick={toggleHistoryDrawer}
                className="flex items-center gap-1 rounded bg-fill-1 px-2 py-1 text-text-2 text-xs hover:bg-fill-2">
                <Icon icon="mdi:history" width={12} />
                {t("ai.panel.history")}
              </button>
            )}

            <AiSendButton
              onClick={generateSummaryText}
              disabled={!content}
              isLoading={isLoading}
              className="flex-1"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-1 rounded bg-error-ghost px-2 py-1.5 text-error text-xs">
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
            <div className="flex items-center gap-3 border-line-1 border-t pt-2 text-text-3 text-xs">
              <span className="flex items-center gap-1">
                <Icon icon="mdi:counter" width={12} />
                {t("ai.history.detail.metadata.tokens")}:{" "}
                <b className="text-text-1">{usage.total_tokens}</b>
              </span>
              <span className="text-text-4">|</span>
              <span>
                {t("ai.tokens.input")}:{" "}
                <b className="text-info">{usage.prompt_tokens}</b>
              </span>
              <span className="text-text-4">|</span>
              <span>
                {t("ai.tokens.output")}:
                <b className="text-success">{usage.completion_tokens}</b>
              </span>
            </div>
          )}
        </div>
      </Collapsible>

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
