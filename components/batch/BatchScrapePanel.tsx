import { Icon } from "@iconify/react"
import { memo } from "react"

import { useBatchScrapeContext } from "~contexts/BatchScrapeContext"
import { useI18n } from "~utils/i18n"

import { Collapsible } from "../ui/collapsible"
import { BatchScrapeSettings } from "./BatchScrapeSettings"
import LinkPreviewList from "./LinkPreviewList"
import ScrapeProgressPanel from "./ScrapeProgressPanel"
import ScrapeResultsPanel from "./ScrapeResultsPanel"

const BatchScrapePanel = memo(function BatchScrapePanel() {
  const { t } = useI18n()
  const {
    mode,
    elementInfo,
    links,
    progress,
    paginationProgress,
    results,
    error,
    nextPageButton,
    isSelectingNextPage,
    startScrape,
    pauseScrape,
    resumeScrape,
    handleCancel,
    handleReset,
    handleSelectElement,
    addLink,
    updateLink,
    removeLink,
    handleSelectNextPage,
    handleClearNextPage
  } = useBatchScrapeContext()

  // Render content based on mode
  const renderContent = () => {
    switch (mode) {
      case "idle":
        return (
          <div className="flex flex-col gap-4 py-4">
            {/* Top intro area */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-blue-ghost-active">
                <Icon
                  icon="line-md:document-list"
                  className="h-7 w-7 text-accent-blue"
                />
              </div>
              <div className="text-center">
                <h3 className="mb-1 font-semibold text-base text-text-1">
                  {t("batch.idle.title")}
                </h3>
                <p className="text-sm text-text-2">
                  {t("batch.idle.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSelectElement}
                className="flex items-center gap-2 rounded-lg bg-accent-blue px-6 py-2.5 font-medium text-sm text-white shadow-md transition-all hover:bg-accent-blue-hover hover:shadow-lg">
                <Icon icon="mdi:cursor-default-click" className="h-5 w-5" />
                {t("batch.idle.selectElement")}
              </button>
            </div>

            {/* Quick settings area */}
            <Collapsible
              title={t("batch.idle.settings")}
              icon={<Icon icon="mdi:cog-outline" width={16} />}
              defaultExpanded>
              <BatchScrapeSettings compact showToast={false} />
            </Collapsible>
          </div>
        )

      case "selecting":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-accent-blue-ghost-active">
              <Icon
                icon="mdi:cursor-default-click-outline"
                className="h-8 w-8 text-accent-blue"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-semibold text-base text-text-1">
                {t("batch.selecting.title")}
              </h3>
              <p className="text-sm text-text-2">{t("batch.selecting.hint")}</p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 rounded-lg border border-line-1 bg-content px-4 py-2 font-medium text-sm text-text-1 transition-colors hover:bg-content-hover">
              <Icon icon="mdi:close" className="h-4 w-4" />
              {t("batch.selecting.cancel")}
            </button>
          </div>
        )

      case "previewing":
        return (
          <div className="flex flex-col gap-4">
            <Collapsible
              title={t("batch.previewing.settings")}
              icon={<Icon icon="mdi:cog-outline" width={16} />}>
              <BatchScrapeSettings compact showToast={false} />
            </Collapsible>
            <LinkPreviewList
              elementInfo={elementInfo}
              links={links}
              nextPageButton={nextPageButton}
              isSelectingNextPage={isSelectingNextPage}
              onStartScrape={startScrape}
              onCancel={handleReset}
              onReselect={handleSelectElement}
              onAddLink={addLink}
              onUpdateLink={updateLink}
              onRemoveLink={removeLink}
              onSelectNextPage={handleSelectNextPage}
              onClearNextPage={handleClearNextPage}
            />
          </div>
        )

      case "scraping":
        return (
          <ScrapeProgressPanel
            progress={progress}
            paginationProgress={paginationProgress}
            onPause={pauseScrape}
            onResume={resumeScrape}
            onCancel={handleCancel}
          />
        )

      case "completed":
        return <ScrapeResultsPanel results={results} onReset={handleReset} />

      case "error":
        return (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-error-ghost-active">
              <Icon icon="mdi:alert-circle" className="h-8 w-8 text-error" />
            </div>
            <div className="text-center">
              <h3 className="mb-1 font-semibold text-base text-text-1">
                {t("batch.error.title")}
              </h3>
              <p className="text-error text-sm">
                {error || t("batch.error.unknown")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg bg-content px-4 py-2 font-medium text-sm text-text-1 transition-colors hover:bg-content-hover">
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
    <div className="card flex h-full flex-col overflow-auto p-4">
      {renderContent()}
    </div>
  )
})

export default BatchScrapePanel
