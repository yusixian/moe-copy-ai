import { Icon } from "@iconify/react"
import { memo } from "react"

import type {
  ContentExtractionMode,
  ExtractedContent,
  SelectedElementInfo
} from "~constants/types"

import ContentFormatTabs from "./ContentFormatTabs"

interface ContentExtractionPanelProps {
  mode: ContentExtractionMode
  content: ExtractedContent | null
  elementInfo: SelectedElementInfo | null
  error: string | null
  onStartSelection: () => void
  onCancel: () => void
  onReset: () => void
}

const ContentExtractionPanel = memo(function ContentExtractionPanel({
  mode,
  content,
  elementInfo,
  error,
  onStartSelection,
  onCancel,
  onReset
}: ContentExtractionPanelProps) {
  // 根据模式渲染不同内容
  const renderContent = () => {
    switch (mode) {
      case "idle":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
              <Icon
                icon="mdi:text-box-search-outline"
                className="h-8 w-8 text-amber-500"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-semibold text-base text-gray-800">
                内容提取
              </h3>
              <p className="text-gray-500 text-sm">
                选择页面元素，提取其内容为
                <br />
                HTML / Markdown / 纯文本
              </p>
            </div>
            <button
              onClick={onStartSelection}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 font-medium text-sm text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-600 hover:shadow-lg">
              <Icon icon="mdi:cursor-default-click" className="h-5 w-5" />
              选择页面元素
            </button>
          </div>
        )

      case "selecting":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-amber-100">
              <Icon
                icon="mdi:cursor-default-click-outline"
                className="h-8 w-8 text-amber-500"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-semibold text-base text-gray-800">
                正在选择元素...
              </h3>
              <p className="text-gray-500 text-sm">
                请在页面上点击要提取内容的区域
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50">
              <Icon icon="mdi:close" className="h-4 w-4" />
              取消
            </button>
          </div>
        )

      case "extracted":
        if (!content) return null

        return (
          <div className="flex flex-col gap-4">
            {/* 元素信息 */}
            {elementInfo && (
              <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                <Icon
                  icon="mdi:tag-outline"
                  className="h-4 w-4 text-amber-600"
                />
                <span className="text-gray-600 text-xs">
                  <span className="rounded bg-amber-200 px-1.5 py-0.5 font-mono text-amber-800">
                    {elementInfo.tagName}
                  </span>
                  {elementInfo.id && (
                    <span className="ml-1 text-gray-500">
                      #{elementInfo.id}
                    </span>
                  )}
                  {elementInfo.className && (
                    <span className="ml-1 text-gray-400">
                      .{elementInfo.className.split(" ")[0]}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* 内容格式切换和显示 */}
            <ContentFormatTabs content={content} defaultFormat="markdown" />

            {/* 底部操作按钮 */}
            <button
              onClick={onReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50">
              <Icon icon="mdi:refresh" className="h-4 w-4" />
              重新选择
            </button>
          </div>
        )

      case "error":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Icon icon="mdi:alert-circle" className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-semibold text-base text-gray-800">
                提取失败
              </h3>
              <p className="text-red-500 text-sm">{error || "未知错误"}</p>
            </div>
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-200">
              <Icon icon="mdi:refresh" className="h-4 w-4" />
              重试
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border-2 border-amber-200 bg-white p-4 shadow-md">
      {renderContent()}
    </div>
  )
})

export default ContentExtractionPanel
