import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"
import { countTokens } from "gpt-tokenizer"
import { useCallback, useEffect, useMemo, useState } from "react"

import { useI18n } from "~utils/i18n"

import ContentDisplay from "./ContentDisplay"
import TokenizationDisplay from "./TokenizationDisplay"
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
  const { t } = useI18n()
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showCleanedContent, setShowCleanedContent] = useState(false)
  // 复制功能
  const { copy, copied: copySuccess } = useClipboard({ timeout: 2000 })
  // 添加编辑状态
  const [isEditing, setIsEditing] = useState(false)
  // 本地维护内容状态，使编辑即时生效
  const [localArticleContent, setLocalArticleContent] = useState(articleContent)
  const [localCleanedContent, setLocalCleanedContent] = useState(cleanedContent)
  // 添加分词显示状态
  const [showTokenization, setShowTokenization] = useState(false)
  // 添加全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false)

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
    copy(currentContent)
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

  // 切换全屏模式（模拟全屏，适用于弹窗环境）
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  // 监听ESC键和自定义事件退出全屏
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }

    const handleExitFullscreen = () => {
      setIsFullscreen(false)
    }

    if (isFullscreen) {
      document.addEventListener("keydown", handleKeyDown)
      document.addEventListener("exitFullscreen", handleExitFullscreen)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("exitFullscreen", handleExitFullscreen)
    }
  }, [isFullscreen])

  if (!articleContent) {
    return null
  }

  return (
    <div className="relative mb-4">
      <h2 className="absolute top-1 right-1 z-20 flex w-auto items-center justify-between font-semibold text-accent-blue text-lg">
        {currentContent?.length ? (
          <div className="flex w-auto items-center gap-1.5 rounded-full border border-line-1 bg-content-alt px-3 py-1 font-medium text-accent-blue text-xs shadow-sm transition-opacity hover:opacity-80">
            <span className="flex items-center">
              {t("content.characters", { count: currentContent.length })}
            </span>
            <span className="mx-0.5 text-text-4">•</span>
            <span>{t("content.tokens", { count: tokenCount })}</span>
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
          isFullscreen={isFullscreen}
          onContentChange={handleContentUpdate}
        />
      </Card>
      <div className="relative mt-3 flex flex-wrap justify-end gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={toggleContentVersion}
          disabled={isEditing}>
          {showCleanedContent
            ? t("content.format.original")
            : t("content.format.compact")}
        </Button>

        {isMarkdown && (
          <Button
            variant="secondary"
            size="sm"
            onClick={togglePreview}
            disabled={isEditing}>
            {isPreviewMode
              ? t("content.preview.source")
              : t("content.preview.markdown")}
          </Button>
        )}

        {isMarkdown && isPreviewMode && (
          <Button
            variant="default"
            size="sm"
            onClick={toggleFullscreen}
            disabled={isEditing}
            className="flex items-center">
            <Icon
              icon="line-md:arrows-diagonal-rotated"
              className="mr-2 inline-block size-4 flex-shrink-0"
            />
            {isFullscreen
              ? t("content.fullscreen.exit")
              : t("content.fullscreen.enter")}
          </Button>
        )}

        <Button
          variant={isEditing ? "outline" : "secondary"}
          size="sm"
          onClick={toggleEditMode}>
          {isEditing ? t("content.edit.done") : t("content.edit.start")}
        </Button>

        <Button
          variant={showTokenization ? "outline" : "default"}
          size="sm"
          onClick={() => setShowTokenization(!showTokenization)}>
          {showTokenization
            ? t("content.tokenization.hide")
            : t("content.tokenization.show")}
        </Button>

        <Button
          variant={copySuccess ? "success" : "default"}
          size="sm"
          onClick={handleCopy}>
          {copySuccess ? t("common.copied") : t("common.copy")}
        </Button>
      </div>
      <TokenizationDisplay
        className="mt-4"
        content={currentContent}
        isVisible={showTokenization}
      />
    </div>
  )
}

export default ContentSection
