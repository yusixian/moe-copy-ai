import { Icon } from "@iconify/react"
import React, { useCallback, useState } from "react"
import { toast } from "react-toastify"

import { useStorage } from "@plasmohq/storage/hook"

import { useOpenOptionPage } from "~hooks/common/useOpenOptionPage"
import { cn } from "~utils"
import { generateSummary, getAiConfig } from "~utils/ai-service"
import { copyToClipboard } from "~utils/clipboard"

import ContentDisplay from "./ContentDisplay"

interface AiSummarySectionProps {
  content: string
  onSummaryGenerated?: (summary: string) => void
}

const AiSummarySection: React.FC<AiSummarySectionProps> = ({
  content,
  onSummaryGenerated
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState("")
  const [summary, setSummary] = useState("")
  const [showPromptInput, setShowPromptInput] = useState(false)
  const [apiKey] = useStorage<string>("ai_api_key", "")
  const [error, setError] = useState<string | null>(null)
  const [systemPrompt, setSystemPrompt] = useState("")
  // TODO: 流式生成
  // 处理摘要生成
  const handleGenerateSummary = useCallback(async () => {
    if (!content.trim()) {
      setError("内容为空，无法生成摘要")
      toast.warning("内容为空，无法生成摘要")
      return
    }

    if (!apiKey) {
      setError("请先在扩展设置中配置AI提供商信息")
      toast.error("请先在扩展设置中配置AI提供商信息")
      return
    }

    try {
      setIsLoading(true)
      setSummary("")

      // 使用流式生成API
      const res = await generateSummary(content, customPrompt || undefined)
      const summary = res?.text ?? ""
      setSummary(summary)
      if (onSummaryGenerated) {
        onSummaryGenerated(summary)
      }
      setError(null)
    } catch (error) {
      setError(error.message || "未知错误")
      console.error("摘要生成失败:", error)
    } finally {
      setIsLoading(false)
    }
  }, [content, customPrompt, apiKey, onSummaryGenerated])

  const togglePromptInput = async () => {
    const nextState = !showPromptInput
    setShowPromptInput(nextState)

    // 当打开提示词输入时，获取系统提示词并设置为默认值
    if (nextState && !customPrompt) {
      try {
        const config = await getAiConfig()
        setSystemPrompt(config.systemPrompt)
        setCustomPrompt(config.systemPrompt)
      } catch (error) {
        console.error("获取系统提示词失败:", error)
      }
    }
  }

  const handleOpenSettings = useOpenOptionPage()

  // 复制摘要到剪贴板
  const handleCopySummary = useCallback(() => {
    if (summary) {
      copyToClipboard(summary)
    }
  }, [summary])

  return (
    <div className="mb-4">
      <h2 className="mb-2 flex items-center gap-1 text-lg font-semibold text-sky-600">
        <Icon
          icon="line-md:chat-round-dots-twotone"
          className="inline"
          width="24"
          height="24"
        />
        AI 助手
      </h2>

      <div className="rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 shadow-md transition-all hover:shadow-lg">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 xs:flex-col">
          <div className="flex items-center">
            <Icon
              icon="line-md:robot"
              className="mr-2 text-indigo-500"
              width="20"
              height="20"
            />
            <p className="text-sm text-indigo-600">
              一键将文章内容变成精简摘要，阅读效率噌噌噌提升！(ﾉ≧∀≦)ﾉ ♪
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePromptInput}
              className={cn(
                "flex transform items-center rounded-full px-3 py-1 text-sm font-medium transition-all hover:scale-105",
                showPromptInput
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-blue-100 text-sky-600"
              )}
              title="自定义提示词">
              <Icon
                icon={
                  showPromptInput
                    ? "line-md:close-small"
                    : "line-md:edit-twotone"
                }
                className="mr-1"
                width="18"
                height="18"
              />
              {showPromptInput ? "收起提示词" : "自定义提示词"}
            </button>

            <button
              onClick={handleOpenSettings}
              className="flex transform items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-600 transition-all hover:scale-105"
              title="AI 提供商设置">
              <Icon
                icon="line-md:cog-filled"
                className="mr-1"
                width="18"
                height="18"
              />
              AI 提供商设置
            </button>
          </div>
        </div>

        {showPromptInput && (
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
              {customPrompt !== systemPrompt && systemPrompt && (
                <div className="mt-1.5 text-right">
                  <button
                    onClick={() => setCustomPrompt(systemPrompt)}
                    className="ml-auto flex items-center justify-end text-xs text-indigo-600 hover:text-indigo-800 hover:underline">
                    <Icon
                      icon="line-md:restore"
                      className="mr-0.5"
                      width="14"
                      height="14"
                    />
                    还原默认提示词
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col items-end gap-2">
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="flex transform items-center justify-center rounded-xl border border-indigo-300 bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:scale-105 hover:from-sky-600 hover:to-indigo-600 disabled:opacity-50">
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

          {error && (
            <div className="flex items-center">
              <Icon
                icon="line-md:alert"
                className="mr-1 text-red-500"
                width="16"
                height="16"
              />
              <p className="text-xs font-medium text-red-500">{error}</p>
            </div>
          )}
        </div>

        {summary && (
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center">
                <Icon
                  icon="line-md:document-text"
                  className="mr-2 text-sky-500"
                  width="18"
                  height="18"
                />
                <h3 className="text-sm font-medium text-sky-600">摘要结果</h3>
              </div>
              <button
                onClick={handleCopySummary}
                className="flex transform items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-600 transition-all hover:scale-105"
                title="复制摘要">
                <Icon
                  icon="line-md:clipboard-check"
                  className="mr-1"
                  width="18"
                  height="18"
                />
                复制摘要
              </button>
            </div>
            <ContentDisplay content={summary} isMarkdown isPreviewMode />
          </div>
        )}
      </div>
    </div>
  )
}

export default AiSummarySection
