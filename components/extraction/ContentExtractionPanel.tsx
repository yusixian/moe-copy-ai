import { Icon } from "@iconify/react"
import { memo } from "react"

import type {
  ContentExtractionMode,
  ExtractedContent,
  SelectedElementInfo
} from "~constants/types"
import { useI18n } from "~utils/i18n"

import ContentFormatTabs from "./ContentFormatTabs"
import ExtractionAiSummary from "./ExtractionAiSummary"

interface ContentExtractionPanelProps {
  mode: ContentExtractionMode
  content: ExtractedContent | null
  elementInfo: SelectedElementInfo | null
  error: string | null
  tabInfo: { url: string; title: string } | null
  onStartSelection: () => void
  onCancel: () => void
  onReset: () => void
}

const ContentExtractionPanel = memo(function ContentExtractionPanel({
  mode,
  content,
  elementInfo,
  error,
  tabInfo,
  onStartSelection,
  onCancel,
  onReset
}: ContentExtractionPanelProps) {
  const { t } = useI18n()

  // 根据模式渲染不同内容
  const renderContent = () => {
    switch (mode) {
      case "idle":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-purple-ghost-active">
              <Icon
                icon="mdi:text-box-search-outline"
                className="h-8 w-8 text-accent-purple"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-semibold text-base text-text-1">
                {t("extraction.idle.title")}
              </h3>
              <p className="text-sm text-text-2">
                {t("extraction.idle.subtitle")}
                <br />
                {t("extraction.idle.formats")}
              </p>
            </div>
            <button
              type="button"
              onClick={onStartSelection}
              className="flex items-center gap-2 rounded-lg bg-accent-purple px-6 py-2.5 font-medium text-sm text-white shadow-md transition-all hover:bg-accent-purple-hover hover:shadow-lg">
              <Icon icon="mdi:cursor-default-click" className="h-5 w-5" />
              {t("extraction.idle.selectElement")}
            </button>
          </div>
        )

      case "selecting":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-accent-purple-ghost-active">
              <Icon
                icon="mdi:cursor-default-click-outline"
                className="h-8 w-8 text-accent-purple"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-semibold text-base text-text-1">
                {t("extraction.selecting.title")}
              </h3>
              <p className="text-sm text-text-2">
                {t("extraction.selecting.subtitle")}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 rounded-lg border border-line-1 bg-content px-4 py-2 font-medium text-sm text-text-1 transition-colors hover:bg-content-hover">
              <Icon icon="mdi:close" className="h-4 w-4" />
              {t("extraction.selecting.cancel")}
            </button>
          </div>
        )

      case "extracted":
        if (!content) return null

        return (
          <div className="flex flex-col gap-4">
            {/* 元素信息 */}
            {elementInfo && (
              <div className="flex items-center gap-2 rounded-lg bg-accent-purple-ghost px-3 py-2">
                <Icon
                  icon="mdi:tag-outline"
                  className="h-4 w-4 text-accent-purple"
                />
                <span className="text-text-2 text-xs">
                  <span className="rounded bg-accent-purple-ghost-active px-1.5 py-0.5 font-mono text-accent-purple">
                    {elementInfo.tagName}
                  </span>
                  {elementInfo.id && (
                    <span className="ml-1 text-text-2">#{elementInfo.id}</span>
                  )}
                  {elementInfo.className && (
                    <span className="ml-1 text-text-3">
                      .{elementInfo.className.split(" ")[0]}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* 内容格式切换和显示 */}
            <ContentFormatTabs content={content} defaultFormat="markdown" />

            {/* AI 总结 */}
            {tabInfo && (
              <ExtractionAiSummary content={content} tabInfo={tabInfo} />
            )}

            {/* 底部操作按钮 */}
            <button
              type="button"
              onClick={onReset}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-line-1 bg-content py-2 font-medium text-sm text-text-1 transition-colors hover:bg-content-hover">
              <Icon icon="mdi:refresh" className="h-4 w-4" />
              {t("extraction.extracted.reselect")}
            </button>
          </div>
        )

      case "error":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-ghost-active">
              <Icon icon="mdi:alert-circle" className="h-8 w-8 text-error" />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-semibold text-base text-text-1">
                {t("extraction.error.title")}
              </h3>
              <p className="text-error text-sm">
                {error || t("extraction.error.unknown")}
              </p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg bg-content px-4 py-2 font-medium text-sm text-text-1 transition-colors hover:bg-content-hover">
              <Icon icon="mdi:refresh" className="h-4 w-4" />
              {t("extraction.error.retry")}
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="card flex h-full flex-col overflow-auto p-4">
      {renderContent()}
    </div>
  )
})

export default ContentExtractionPanel
