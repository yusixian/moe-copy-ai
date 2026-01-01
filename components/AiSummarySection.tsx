import { Icon } from "@iconify/react"
import type React from "react"
import { useCallback, useMemo, useState } from "react"

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
  <div className="flex items-center">
    <Icon
      icon="line-md:alert"
      className="mr-1 text-red-500"
      width="16"
      height="16"
    />
    <p className="font-medium text-red-500 text-xs">
      {message} (ノಠ益ಠ)ノ彡┻━┻
    </p>
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
  <button
    onClick={onClick}
    disabled={isLoading}
    className="flex transform items-center justify-center rounded-xl border border-indigo-300 bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:scale-105 hover:from-sky-600 hover:to-indigo-600 disabled:opacity-50 disabled:hover:scale-100">
    {isLoading ? (
      <>
        <span className="mr-2 animate-bounce">♪</span>
        生成中...
        <span className="ml-2 animate-bounce delay-100">♪</span>
      </>
    ) : (
      <>
        生成摘要 <span className="ml-2">✨</span>
      </>
    )}
  </button>
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
              className="mr-2 text-indigo-500"
              width="20"
              height="20"
            />
            <p className="text-indigo-600 text-sm">
              可以用文章内容生成摘要，阅读效率噌噌噌提升！(｡•̀ᴗ-)✧
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePromptInput}
              className={`flex items-center rounded-md px-3 py-1.5 font-medium text-xs shadow-sm transition-all hover:shadow ${
                showCustomPromptInput
                  ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                  : "bg-blue-100 text-sky-600 hover:bg-blue-200"
              }`}>
              <Icon
                icon={
                  showCustomPromptInput
                    ? "line-md:close-small"
                    : "line-md:edit-twotone"
                }
                className="mr-1.5"
                width="16"
                height="16"
              />
              {showCustomPromptInput ? "收起提示词" : "自定义提示词"}
            </button>

            <button
              onClick={toggleHistoryDrawer}
              className="flex items-center rounded-md bg-purple-100 px-3 py-1.5 font-medium text-purple-600 text-xs shadow-sm transition-all hover:bg-purple-200 hover:shadow">
              <Icon
                icon="mdi:history"
                className="mr-1.5"
                width="16"
                height="16"
              />
              历史记录
            </button>

            <button
              onClick={handleOpenSettings}
              className="flex items-center rounded-md bg-amber-100 px-3 py-1.5 font-medium text-amber-600 text-xs shadow-sm transition-all hover:bg-amber-200 hover:shadow">
              <Icon
                icon="line-md:cog-filled"
                className="mr-1.5"
                width="16"
                height="16"
              />
              AI 提供商设置
            </button>
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
