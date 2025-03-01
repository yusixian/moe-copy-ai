import { useState } from "react"

import ContentDisplay from "./ContentDisplay"
import type { ContentSectionProps } from "./types"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

/**
 * 文章内容区域组件
 */
export const ContentSection: React.FC<ContentSectionProps> = ({
  articleContent,
  cleanedContent,
  isMarkdown
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showCleanedContent, setShowCleanedContent] = useState(false)
  // 添加动画状态
  const [copySuccess, setCopySuccess] = useState(false)

  if (!articleContent) {
    return null
  }

  // 获取当前要显示的内容
  const getCurrentContent = () => {
    return showCleanedContent ? cleanedContent : articleContent
  }

  // 切换预览模式
  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // 切换内容版本
  const toggleContentVersion = () => {
    setShowCleanedContent(!showCleanedContent)
  }

  // 复制内容
  const handleCopy = () => {
    navigator.clipboard
      .writeText(getCurrentContent())
      .then(() => {
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      })
      .catch((err) => console.error("复制失败:", err))
  }

  return (
    <div className="mb-4">
      <h2 className="mb-2 flex items-center text-lg font-semibold text-sky-600">
        <span className="mr-2">📝</span>文章内容
      </h2>
      <Card
        variant="content"
        padding="sm"
        className="max-h-[200px] overflow-y-auto">
        <ContentDisplay
          content={getCurrentContent()}
          isMarkdown={isMarkdown}
          isPreviewMode={isPreviewMode}
        />
      </Card>
      <div className="relative mt-3 flex flex-wrap justify-end gap-3">
        <Button
          variant="default"
          size="md"
          icon={showCleanedContent ? "✨" : "✂️"}
          onClick={toggleContentVersion}>
          {showCleanedContent ? "显示原始格式" : "显示紧凑版"}
        </Button>

        {isMarkdown && (
          <Button
            variant="secondary"
            size="md"
            icon={isPreviewMode ? "📄" : "✨"}
            onClick={togglePreview}>
            {isPreviewMode ? "查看原文" : "预览 Markdown"}
          </Button>
        )}

        <Button
          variant={copySuccess ? "success" : "copy"}
          size="md"
          icon={copySuccess ? "✓" : "📋"}
          onClick={handleCopy}>
          {copySuccess ? "复制成功!" : "复制全文"}
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
