import { countTokens } from "gpt-tokenizer"
import { useMemo, useState } from "react"

import ContentDisplay from "./ContentDisplay"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

interface ContentSectionProps {
  articleContent: string
  cleanedContent: string
  isMarkdown: boolean
  onContentChange?: (newContent: string, isCleanVersion: boolean) => void
}
/**
 * 文章内容区域组件
 */
export const ContentSection: React.FC<ContentSectionProps> = ({
  articleContent,
  cleanedContent,
  isMarkdown,
  onContentChange
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showCleanedContent, setShowCleanedContent] = useState(false)
  // 添加动画状态
  const [copySuccess, setCopySuccess] = useState(false)
  // 添加编辑状态
  const [isEditing, setIsEditing] = useState(false)
  // 本地维护内容状态，使编辑即时生效
  const [localArticleContent, setLocalArticleContent] = useState(articleContent)
  const [localCleanedContent, setLocalCleanedContent] = useState(cleanedContent)

  if (!articleContent) {
    return null
  }

  // 获取当前要显示的内容
  const currentContent = useMemo(() => {
    const content = showCleanedContent
      ? localCleanedContent || cleanedContent
      : localArticleContent || articleContent
    return content
  }, [
    showCleanedContent,
    localCleanedContent,
    cleanedContent,
    localArticleContent,
    articleContent
  ])

  // 使用 gpt-tokenizer ，最快的 JavaScript BPE 分词编码解码器，适用于 OpenAI 的 GPT-2 / GPT-3 / GPT-4 / GPT-4o / GPT-o1。OpenAI 的 tiktoken 的移植版，并增加了额外功能。

  const tokenCount = useMemo(() => {
    if (!currentContent) return 0
    try {
      return countTokens(currentContent)
    } catch (error) {
      console.error("计算token数量失败:", error)
      return 0
    }
  }, [currentContent])

  // 切换预览模式
  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
    // 退出编辑模式
    if (isEditing) setIsEditing(false)
  }

  // 切换内容版本
  const toggleContentVersion = () => {
    setShowCleanedContent(!showCleanedContent)
    // 退出编辑模式
    if (isEditing) setIsEditing(false)
  }

  // 复制内容
  const handleCopy = () => {
    navigator.clipboard
      .writeText(currentContent)
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch((err) => console.error("复制失败:", err))
  }

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditing(!isEditing)
    // 如果开启编辑，则关闭预览
    if (!isEditing && isPreviewMode) {
      setIsPreviewMode(false)
    }

    // 结束编辑时，将更改提交给父组件
    if (isEditing && onContentChange) {
      onContentChange(
        showCleanedContent ? localCleanedContent : localArticleContent,
        showCleanedContent
      )
    }
  }

  // 处理内容更新
  const handleContentUpdate = (newContent: string) => {
    // 更新本地状态，实现即时更新字符统计
    if (showCleanedContent) {
      setLocalCleanedContent(newContent)
    } else {
      setLocalArticleContent(newContent)
    }

    // 实时通知父组件
    if (onContentChange) {
      onContentChange(newContent, showCleanedContent)
    }
  }

  return (
    <div className="relative mb-4">
      <h2 className="absolute right-1 top-1 z-20 flex w-auto items-center justify-between text-lg font-semibold text-sky-600">
        {currentContent?.length ? (
          <div className="flex w-auto items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-50 to-indigo-50 px-3 py-1 text-xs font-medium text-sky-600 shadow-sm ring-1 ring-sky-100 transition-opacity hover:opacity-80">
            <span className="flex items-center">
              {currentContent.length} 字符
            </span>
            <span className="mx-0.5 text-sky-300">•</span>
            <span>约 {tokenCount} token</span>
          </div>
        ) : null}
      </h2>
      <Card
        variant="content"
        padding="sm"
        className={`relative overflow-y-auto ${isEditing ? "max-h-[400px]" : "max-h-[200px]"}`}>
        <ContentDisplay
          content={currentContent}
          isMarkdown={isMarkdown}
          isPreviewMode={isPreviewMode}
          isEditable={isEditing}
          onContentChange={handleContentUpdate}
        />
      </Card>
      <div className="relative mt-3 flex flex-wrap justify-end gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={toggleContentVersion}
          disabled={isEditing}>
          {showCleanedContent ? "显示原始格式" : "显示紧凑版"}
        </Button>

        {isMarkdown && (
          <Button
            variant="secondary"
            size="sm"
            onClick={togglePreview}
            disabled={isEditing}>
            {isPreviewMode ? "查看原文" : "预览 Markdown"}
          </Button>
        )}

        <Button
          variant={isEditing ? "outline" : "secondary"}
          size="sm"
          onClick={toggleEditMode}>
          {isEditing ? "完成编辑" : "编辑内容"}
        </Button>

        <Button
          variant={copySuccess ? "success" : "copy"}
          size="sm"
          onClick={handleCopy}>
          {copySuccess ? "成功" : "复制"}
        </Button>

        {/* 复制成功动画 */}
        {copySuccess && (
          <div className="absolute -top-12 right-0 -translate-y-1 transform rounded-full border border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-2 text-xs text-green-600 shadow-md">
            <div className="flex items-center">
              <span className="mr-1">(っ◔◡◔)っ</span>
              内容已复制到剪贴板!
              <span className="ml-1 inline-block animate-pulse">♥</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentSection
