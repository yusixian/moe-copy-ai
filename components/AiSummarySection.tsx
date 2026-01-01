import { Icon } from "@iconify/react"
import type React from "react"
import { useCallback, useMemo, useState } from "react"

import { Button } from "~/components/ui/button"
import type { ScrapedContent } from "~constants/types"
import { useOpenOptionPage } from "~hooks/common/useOpenOptionPage"
import { useAiSummary } from "~hooks/useAiSummary"

import AiHistoryDrawer from "./ai/AiHistoryDrawer"
import PromptInput from "./ai/PromptInput"
import { SummaryResult } from "./ai/SummaryResult"

interface AiSummarySectionProps {
  content: string
  onSummaryGenerated?: (summary: string) => void
  scrapedData: ScrapedContent
}

// 错误提示组件
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex items-center gap-1">
    <Icon icon="line-md:alert" className="text-red-500" width="16" height="16" />
    <p className="font-medium text-red-500 text-xs">{message}</p>
  </div>
)

// 生成按钮组件
const GenerateButton = ({
  onClick,
  isLoading
}: {
  onClick: () => void
  isLoading: boolean
}) => (
  <Button onClick={onClick} disabled={isLoading} size="md">
    {isLoading ? (
      <>
        <Icon icon="line-md:loading-loop" className="mr-1 h-4 w-4" />
        生成中...
      </>
    ) : (
      "生成摘要"
    )}
  </Button>
)

const AiSummarySection: React.FC<AiSummarySectionProps> = ({
  content,
  onSummaryGenerated,
  scrapedData
}) => {
  const [showCustomPromptInput, setShowCustomPromptInput] = useState(true)
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

  const handleOpenSettings = useOpenOptionPage()

  const togglePromptInput = useCallback(
    () => setShowCustomPromptInput(!showCustomPromptInput),
    [showCustomPromptInput]
  )

  const toggleHistoryDrawer = useCallback(
    () => setIsHistoryDrawerOpen(!isHistoryDrawerOpen),
    [isHistoryDrawerOpen]
  )

  // 使用直接从useAiSummary返回的usage
  const { totalTokens, promptTokens, completionTokens } = useMemo(() => {
    return {
      totalTokens: usage?.total_tokens,
      promptTokens: usage?.prompt_tokens,
      completionTokens: usage?.completion_tokens
    }
  }, [usage])

  return (
    <div className="mb-4">
      <h2 className="mb-2 flex items-center gap-1 font-semibold text-lg text-sky-600">
        <Icon
          icon="line-md:chat-round-dots-twotone"
          className="inline"
          width="24"
          height="24"
        />
        AI 助手
      </h2>

      <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-md transition-all hover:shadow-lg">
        <div className="mb-2 flex xs:flex-col flex-wrap items-center justify-between gap-2">
          <div className="flex items-center">
            <Icon
              icon="line-md:robot"
              className="mr-2 text-blue-500"
              width="20"
              height="20"
            />
            <p className="text-blue-600 text-sm">
              用文章内容生成摘要，提升阅读效率
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showCustomPromptInput ? "secondary" : "outline"}
              size="xs"
              onClick={togglePromptInput}>
              <Icon
                icon={showCustomPromptInput ? "line-md:close-small" : "line-md:edit-twotone"}
                className="mr-1"
                width="14"
                height="14"
              />
              {showCustomPromptInput ? "收起提示词" : "自定义提示词"}
            </Button>

            <Button variant="outline" size="xs" onClick={toggleHistoryDrawer}>
              <Icon icon="mdi:history" className="mr-1" width="14" height="14" />
              历史记录
            </Button>

            <Button variant="outline" size="xs" onClick={handleOpenSettings}>
              <Icon icon="line-md:cog-filled" className="mr-1" width="14" height="14" />
              设置
            </Button>
          </div>
        </div>

        {showCustomPromptInput && (
          <PromptInput
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            systemPrompt={systemPrompt}
            scrapedData={scrapedData}
            onSaveAsDefault={saveAsDefaultPrompt}
            supportedPlaceholders={[
              { placeholder: "{{content}}", description: "文章内容" },
              { placeholder: "{{title}}", description: "文章标题" },
              { placeholder: "{{url}}", description: "文章URL" },
              { placeholder: "{{author}}", description: "作者" },
              { placeholder: "{{publishDate}}", description: "发布日期" },
              {
                placeholder: "{{cleanedContent}}",
                description: "清理后的内容"
              },
              { placeholder: "{{meta.xxx}}", description: "元数据中的字段" }
            ]}
          />
        )}

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1 text-xs ${modelId ? "text-gray-500" : "text-amber-500"}`}>
              {modelId || "未选择模型"}
            </span>
            <GenerateButton
              onClick={generateSummaryText}
              isLoading={isLoading}
            />
          </div>
          {error && <ErrorMessage message={error} />}
        </div>
        {(summary || streamingText) && (
          <>
            <SummaryResult summary={summary} streamingText={streamingText} />
            {totalTokens && (
              <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-indigo-700 text-xs">
                    <Icon
                      icon="line-md:document-code"
                      className="mr-1"
                      width="14"
                      height="14"
                    />
                    <span>Token 消耗统计</span>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center text-indigo-700 text-xs">
                      totalTokens: <b>{totalTokens}</b>
                    </div>
                    <div className="flex items-center text-sky-600 text-xs">
                      promptTokens: <b>{promptTokens}</b>
                    </div>
                    <div className="flex items-center text-green-600 text-xs">
                      completionTokens: <b>{completionTokens}</b>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 历史记录抽屉组件 */}
      <AiHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={toggleHistoryDrawer}
      />
    </div>
  )
}

export default AiSummarySection
