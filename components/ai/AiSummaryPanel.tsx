import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"
import { countTokens } from "gpt-tokenizer"
import { memo, useCallback, useMemo, useState } from "react"

import type { ScrapedContent } from "~constants/types"
import { useAiSummary } from "~hooks/useAiSummary"
import { processTemplate } from "~utils/template"

import { AccordionSection } from "../AccordionSection"
import ContentDisplay from "../ContentDisplay"
import AiHistoryDrawer from "./AiHistoryDrawer"
import CompactPromptInput from "./CompactPromptInput"

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

// 默认占位符
const defaultPlaceholders: PlaceholderInfo[] = [
  { placeholder: "{{content}}", description: "文章内容" },
  { placeholder: "{{title}}", description: "文章标题" },
  { placeholder: "{{url}}", description: "文章URL" },
  { placeholder: "{{cleanedContent}}", description: "清理后的内容" }
]

const AiSummaryPanel = memo(function AiSummaryPanel({
  content,
  scrapedData,
  placeholders = defaultPlaceholders,
  defaultOpen = false,
  showHistory = false,
  showTokenEstimate = true,
  title = "AI 总结",
  onSummaryGenerated
}: AiSummaryPanelProps) {
  const { copy, copied } = useClipboard({ timeout: 2000 })
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false)

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

  const handleCopy = useCallback(() => {
    if (!displayText) return
    copy(displayText)
  }, [copy, displayText])

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
            共 <b className="text-amber-600">{processedPrompt.length}</b>{" "}
            个字符， 预计消耗 <b className="text-orange-600">{tokenCount}</b> 个
            token
          </span>
        </div>
      )}

      <AccordionSection
        title={title}
        icon="line-md:chat-round-dots-twotone"
        defaultOpen={defaultOpen}
        contentBorder={false}>
        <div className="space-y-3">
          {/* 提示词输入 */}
          <CompactPromptInput
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            systemPrompt={systemPrompt}
            supportedPlaceholders={placeholders}
            scrapedData={scrapedData}
            onSaveAsDefault={saveAsDefaultPrompt}
            disabled={isLoading}
          />

          {/* 操作行：模型 + 历史 + 生成按钮 */}
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-xs ${modelId ? "text-gray-500" : "text-amber-500"}`}>
              {modelId || "未选择模型"}
            </span>

            {showHistory && (
              <button
                type="button"
                onClick={toggleHistoryDrawer}
                className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-gray-600 text-xs hover:bg-gray-200">
                <Icon icon="mdi:history" width={12} />
                历史
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
                  生成中...
                </>
              ) : (
                <>
                  <Icon icon="line-md:lightbulb-twotone" width={14} />
                  生成摘要
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

          {/* 摘要结果 - 简化样式，去除嵌套边框 */}
          {displayText && (
            <div className="pt-2">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium text-sky-700 text-xs">
                  <Icon
                    icon="line-md:lightbulb-twotone"
                    width={14}
                    className="text-amber-400"
                  />
                  摘要结果
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1 rounded bg-sky-100 px-2 py-0.5 text-sky-600 text-xs hover:bg-sky-200">
                  <Icon
                    icon={copied ? "mdi:check" : "mdi:content-copy"}
                    width={12}
                  />
                  {copied ? "已复制" : "复制"}
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto text-gray-700 text-sm">
                <ContentDisplay
                  content={displayText}
                  isMarkdown
                  isPreviewMode
                />
              </div>
            </div>
          )}

          {/* Token 统计 */}
          {usage?.total_tokens && (
            <div className="flex items-center gap-3 border-gray-100 border-t pt-2 text-gray-500 text-xs">
              <span className="flex items-center gap-1">
                <Icon icon="mdi:counter" width={12} />
                Tokens: <b className="text-gray-700">{usage.total_tokens}</b>
              </span>
              <span className="text-gray-300">|</span>
              <span>
                输入: <b className="text-sky-600">{usage.prompt_tokens}</b>
              </span>
              <span className="text-gray-300">|</span>
              <span>
                输出:
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
