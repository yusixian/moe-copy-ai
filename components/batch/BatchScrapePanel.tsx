import { Icon } from "@iconify/react"
import { memo } from "react"

import type {
  BatchProgress,
  BatchScrapeMode,
  BatchScrapeResult,
  ExtractedLink,
  NextPageButtonInfo,
  SelectedElementInfo
} from "~constants/types"
import { cn } from "~utils"

import LinkPreviewList from "./LinkPreviewList"
import ScrapeProgressPanel from "./ScrapeProgressPanel"
import ScrapeResultsPanel from "./ScrapeResultsPanel"

interface PaginationProgress {
  currentPage: number
  maxPages: number
  isLoadingNextPage: boolean
}

interface BatchScrapePanelProps {
  mode: BatchScrapeMode
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  progress: BatchProgress | null
  paginationProgress?: PaginationProgress | null
  results: BatchScrapeResult[]
  error: string | null
  nextPageButton: NextPageButtonInfo | null
  isSelectingNextPage: boolean
  onStartScrape: (selectedLinks: ExtractedLink[], nextPageXPath?: string, linkContainerSelector?: string) => void
  onPause: () => void
  onResume: () => void
  onCancel: () => void
  onReset: () => void
  onSelectElement: () => void
  onAddLink: (url: string, text?: string) => void
  onUpdateLink: (index: number, url: string, text: string) => void
  onRemoveLink: (index: number) => void
  onSelectNextPage: () => void
  onClearNextPage: () => void
}

const BatchScrapePanel = memo(function BatchScrapePanel({
  mode,
  elementInfo,
  links,
  progress,
  paginationProgress,
  results,
  error,
  nextPageButton,
  isSelectingNextPage,
  onStartScrape,
  onPause,
  onResume,
  onCancel,
  onReset,
  onSelectElement,
  onAddLink,
  onUpdateLink,
  onRemoveLink,
  onSelectNextPage,
  onClearNextPage,
}: BatchScrapePanelProps) {
  // 根据模式渲染不同内容
  const renderContent = () => {
    switch (mode) {
      case "idle":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100">
              <Icon
                icon="line-md:document-list"
                className="h-8 w-8 text-sky-500"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-800">
                批量抓取文档
              </h3>
              <p className="text-sm text-gray-500">
                选择页面上包含链接的区域，批量抓取所有文档
              </p>
            </div>
            <button
              onClick={onSelectElement}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:from-sky-600 hover:to-indigo-600 hover:shadow-lg">
              <Icon icon="mdi:cursor-default-click" className="h-5 w-5" />
              选择元素区域
            </button>
          </div>
        )

      case "selecting":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-sky-100">
              <Icon
                icon="mdi:cursor-default-click-outline"
                className="h-8 w-8 text-sky-500"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-800">
                正在选择元素...
              </h3>
              <p className="text-sm text-gray-500">
                请在页面上点击包含链接的区域
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              <Icon icon="mdi:close" className="h-4 w-4" />
              取消
            </button>
          </div>
        )

      case "previewing":
        return (
          <LinkPreviewList
            elementInfo={elementInfo}
            links={links}
            nextPageButton={nextPageButton}
            isSelectingNextPage={isSelectingNextPage}
            onStartScrape={onStartScrape}
            onCancel={onReset}
            onReselect={onSelectElement}
            onAddLink={onAddLink}
            onUpdateLink={onUpdateLink}
            onRemoveLink={onRemoveLink}
            onSelectNextPage={onSelectNextPage}
            onClearNextPage={onClearNextPage}
          />
        )

      case "scraping":
        return (
          <ScrapeProgressPanel
            progress={progress}
            paginationProgress={paginationProgress}
            onPause={onPause}
            onResume={onResume}
            onCancel={onCancel}
          />
        )

      case "completed":
        return <ScrapeResultsPanel results={results} onReset={onReset} />

      case "error":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Icon icon="mdi:alert-circle" className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="mb-1 text-base font-semibold text-gray-800">
                抓取失败
              </h3>
              <p className="text-sm text-red-500">{error || "未知错误"}</p>
            </div>
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200">
              <Icon icon="mdi:refresh" className="h-4 w-4" />
              重新开始
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-full flex-col overflow-auto rounded-xl border-2 border-sky-200 bg-white p-4 shadow-md">
      {renderContent()}
    </div>
  )
})

export default BatchScrapePanel
