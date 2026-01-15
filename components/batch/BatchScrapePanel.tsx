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
import type { LinkFilterConfig } from "~hooks/useBatchScrape"
import { useI18n } from "~utils/i18n"

import { AccordionSection } from "../AccordionSection"
import { BatchScrapeSettings } from "./BatchScrapeSettings"
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
  onStartScrape: (
    selectedLinks: ExtractedLink[],
    nextPageXPath?: string,
    linkContainerSelector?: string,
    filterConfig?: LinkFilterConfig
  ) => void
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
  onClearNextPage
}: BatchScrapePanelProps) {
  const { t } = useI18n()

  // 根据模式渲染不同内容
  const renderContent = () => {
    switch (mode) {
      case "idle":
        return (
          <div className="flex flex-col gap-4 py-4">
            {/* 顶部介绍区域 */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-indigo-100">
                <Icon
                  icon="line-md:document-list"
                  className="h-7 w-7 text-sky-500"
                />
              </div>
              <div className="text-center">
                <h3 className="mb-1 font-semibold text-base text-gray-800">
                  {t("batch.idle.title")}
                </h3>
                <p className="text-gray-500 text-sm">
                  {t("batch.idle.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={onSelectElement}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-2.5 font-medium text-sm text-white shadow-md transition-all hover:from-sky-600 hover:to-indigo-600 hover:shadow-lg">
                <Icon icon="mdi:cursor-default-click" className="h-5 w-5" />
                {t("batch.idle.selectElement")}
              </button>
            </div>

            {/* 快捷设置区域 */}
            <AccordionSection
              title={t("batch.idle.settings")}
              icon="mdi:cog-outline"
              defaultOpen>
              <BatchScrapeSettings compact showToast={false} />
            </AccordionSection>
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
              <h3 className="mb-1 font-semibold text-base text-gray-800">
                {t("batch.selecting.title")}
              </h3>
              <p className="text-gray-500 text-sm">
                {t("batch.selecting.hint")}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50">
              <Icon icon="mdi:close" className="h-4 w-4" />
              {t("batch.selecting.cancel")}
            </button>
          </div>
        )

      case "previewing":
        return (
          <div className="flex flex-col gap-4">
            <AccordionSection
              title={t("batch.previewing.settings")}
              icon="mdi:cog-outline">
              <BatchScrapeSettings compact showToast={false} />
            </AccordionSection>
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
          </div>
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
              <h3 className="mb-1 font-semibold text-base text-gray-800">
                {t("batch.error.title")}
              </h3>
              <p className="text-red-500 text-sm">
                {error || t("batch.error.unknown")}
              </p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-200">
              <Icon icon="mdi:refresh" className="h-4 w-4" />
              {t("batch.error.retry")}
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
