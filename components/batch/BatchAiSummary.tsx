import { Icon } from "@iconify/react"
import { countTokens } from "gpt-tokenizer"
import { memo, useMemo } from "react"

import type { BatchScrapeResult, ScrapedContent } from "~constants/types"
import { useAiSummary } from "~hooks/useAiSummary"
import { aggregateToSingleMarkdown } from "~utils/content-aggregator"
import { useI18n } from "~utils/i18n"
import { processTemplate } from "~utils/template"
import CompactPromptInput from "../ai/CompactPromptInput"
import SummaryResultDisplay from "../ai/SummaryResultDisplay"
import { Collapsible } from "../ui/collapsible"

interface BatchAiSummaryProps {
  results: BatchScrapeResult[]
  onSummaryGenerated?: (summary: string) => void
}

// 将批量抓取结果转换为 ScrapedContent 格式
function createBatchScrapedData(
  results: BatchScrapeResult[],
  t: (key: string, params?: Record<string, string | number>) => string
): ScrapedContent {
  const { content, toc, metadata } = aggregateToSingleMarkdown(results)
  const firstSuccess = results.find((r) => r.success)

  return {
    title: t("batch.ai.title", { count: metadata.successCount }),
    url: firstSuccess?.url || "batch-scrape",
    articleContent: content,
    cleanedContent: content,
    author: "",
    publishDate: metadata.scrapedAt,
    metadata: {
      "batch:totalPages": String(metadata.totalPages),
      "batch:successCount": String(metadata.successCount),
      "batch:failedCount": String(metadata.failedCount),
      "batch:totalChars": String(metadata.totalChars),
      "batch:toc": toc
    },
    images: []
  }
}

// 批量抓取专用占位符 - 将在组件内部使用 t 函数生成
const getBatchPlaceholders = (t: (key: string) => string) => [
  {
    placeholder: "{{content}}",
    description: t("batch.ai.placeholder.content")
  },
  {
    placeholder: "{{cleanedContent}}",
    description: t("batch.ai.placeholder.cleaned")
  },
  { placeholder: "{{title}}", description: t("batch.ai.placeholder.title") },
  { placeholder: "{{url}}", description: t("batch.ai.placeholder.url") },
  {
    placeholder: "{{meta.batch:totalPages}}",
    description: t("batch.ai.placeholder.totalPages")
  },
  {
    placeholder: "{{meta.batch:successCount}}",
    description: t("batch.ai.placeholder.successCount")
  },
  {
    placeholder: "{{meta.batch:toc}}",
    description: t("batch.ai.placeholder.toc")
  }
]

const BatchAiSummary = memo(function BatchAiSummary({
  results,
  onSummaryGenerated
}: BatchAiSummaryProps) {
  const { t } = useI18n()

  // 转换数据格式
  const scrapedData = useMemo(
    () => createBatchScrapedData(results, t),
    [results, t]
  )
  const aggregatedContent = useMemo(() => {
    const { content } = aggregateToSingleMarkdown(results)
    return content
  }, [results])

  // 使用 AI 摘要 hook
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
  } = useAiSummary(aggregatedContent, onSummaryGenerated, scrapedData)

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

  const successCount = results.filter((r) => r.success).length

  return (
    <div className="space-y-2">
      {/* Token 预估信息 - 醒目显示（基于模板替换后的完整提示词） */}
      <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 text-xs">
        <Icon icon="mdi:counter" width={16} className="text-amber-500" />
        <span className="text-gray-600">
          {t("batch.ai.tokenEstimate", {
            chars: processedPrompt.length,
            tokens: tokenCount
          })}
        </span>
      </div>

      <Collapsible
        title={t("batch.ai.sectionTitle")}
        icon={<Icon icon="line-md:chat-round-dots-twotone" width={16} />}
        defaultExpanded>
        <div className="space-y-3">
          {/* 提示词输入 */}
          <CompactPromptInput
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            systemPrompt={systemPrompt}
            supportedPlaceholders={getBatchPlaceholders(t)}
            scrapedData={scrapedData}
            onSaveAsDefault={saveAsDefaultPrompt}
            disabled={isLoading}
          />

          {/* 生成按钮 */}
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-xs ${modelId ? "text-gray-500" : "text-amber-500"}`}>
              {modelId || t("batch.ai.noModel")}
            </span>
            <button
              type="button"
              onClick={generateSummaryText}
              disabled={isLoading || successCount === 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 py-2 font-medium text-white text-xs shadow-sm transition-all hover:from-sky-600 hover:to-indigo-600 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading ? (
                <>
                  <Icon
                    icon="mdi:loading"
                    width={14}
                    className="animate-spin"
                  />
                  {t("batch.ai.generating")}
                </>
              ) : (
                <>
                  <Icon icon="line-md:lightbulb-twotone" width={14} />
                  {t("batch.ai.generate")}
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
            />
          )}

          {/* Token 统计 */}
          {usage?.total_tokens && (
            <div className="flex items-center gap-3 text-gray-500 text-xs">
              <span className="flex items-center gap-1">
                <Icon icon="mdi:counter" width={12} />
                {t("batch.ai.tokens")}{" "}
                <b className="text-gray-700">{usage.total_tokens}</b>
              </span>
              <span className="text-gray-300">|</span>
              <span>
                {t("batch.ai.input")}{" "}
                <b className="text-sky-600">{usage.prompt_tokens}</b>
              </span>
              <span className="text-gray-300">|</span>
              <span>
                {t("batch.ai.output")}
                <b className="text-emerald-600">{usage.completion_tokens}</b>
              </span>
            </div>
          )}
        </div>
      </Collapsible>
    </div>
  )
})

export default BatchAiSummary
