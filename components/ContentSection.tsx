import { useState } from "react"

import ContentDisplay from "./ContentDisplay"
import type { ContentSectionProps } from "./types"

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
      <h2 className="text-lg font-semibold mb-2 text-sky-600 flex items-center">
        <span className="mr-2">📝</span>文章内容
      </h2>
      <div className="p-2 bg-blue-50 rounded-xl border border-sky-200 max-h-[200px] overflow-y-auto shadow-sm">
        <ContentDisplay
          content={getCurrentContent()}
          isMarkdown={isMarkdown}
          isPreviewMode={isPreviewMode}
        />
      </div>
      <div className="mt-3 flex flex-wrap justify-end gap-3 relative">
        <button
          onClick={toggleContentVersion}
          className="text-xs font-medium px-4 py-2 bg-gradient-to-br from-indigo-400 to-sky-400 text-white rounded-full hover:from-indigo-500 hover:to-sky-500 transition-all duration-200 shadow-md hover:shadow-lg border border-indigo-200 flex items-center group">
          <span className="mr-1.5 transition-transform duration-200 group-hover:scale-110">
            {showCleanedContent ? "✨" : "✂️"}
          </span>
          <span className="relative">
            {showCleanedContent ? "显示原始格式" : "显示紧凑版"}
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full"></span>
          </span>
        </button>
        {isMarkdown && (
          <button
            onClick={togglePreview}
            className="text-xs font-medium px-4 py-2 bg-gradient-to-br from-blue-400 to-teal-400 text-white rounded-full hover:from-blue-500 hover:to-teal-500 transition-all duration-200 shadow-md hover:shadow-lg border border-teal-200 flex items-center group">
            <span className="mr-1.5 transition-transform duration-200 group-hover:scale-110">
              {isPreviewMode ? "📄" : "✨"}
            </span>
            <span className="relative">
              {isPreviewMode ? "查看原文" : "预览 Markdown"}
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full"></span>
            </span>
          </button>
        )}
        <button
          onClick={handleCopy}
          className={`text-xs font-medium px-4 py-2 ${
            copySuccess
              ? "bg-gradient-to-br from-green-400 to-emerald-400 text-white border-emerald-200"
              : "bg-gradient-to-br from-sky-300 to-blue-200 text-blue-800 hover:from-sky-400 hover:to-blue-300 border-sky-200"
          } rounded-full transition-all duration-200 shadow-md hover:shadow-lg border flex items-center group hover:scale-102`}>
          <span className="mr-1.5 transition-transform duration-200 group-hover:scale-110">
            {copySuccess ? "✓" : "📋"}
          </span>
          <span className="relative">
            {copySuccess ? "复制成功!" : "复制全文"}
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full"></span>
          </span>
        </button>

        {/* 复制成功动画 */}
        {copySuccess && (
          <div className="absolute -top-12 right-0 bg-gradient-to-br from-green-50 to-emerald-100 text-green-600 px-4 py-2 rounded-full text-xs border border-green-200 shadow-md transform -translate-y-1">
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
