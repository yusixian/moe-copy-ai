import "./styles/global.css"
import "react-toastify/dist/ReactToastify.css"

import { Icon } from "@iconify/react"
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import { ToastContainer } from "react-toastify"

import type { SingleScrapePanelHandle } from "~components/singlescrape"
import { Button } from "~components/ui/button"
import { ErrorBoundary } from "~components/ui/ErrorBoundary"
import Segmented, { type SegmentedOption } from "~components/ui/segmented"
import type { BatchScrapeMode } from "~constants/types"
import useBatchScrape from "~hooks/useBatchScrape"
import useContentExtraction from "~hooks/useContentExtraction"
import useElementSelector from "~hooks/useElementSelector"
import { I18nProvider, useI18n } from "~utils/i18n"

// Lazy load heavy tab components
const SingleScrapePanel = lazy(
  () => import("~components/singlescrape/SingleScrapePanel")
)
const BatchScrapePanel = lazy(
  () => import("~components/batch/BatchScrapePanel")
)
const ContentExtractionPanel = lazy(
  () => import("~components/extraction/ContentExtractionPanel")
)
const SidePanelSettings = lazy(
  () => import("~components/sidepanel/SidePanelSettings")
)

// Loading fallback for lazy components
function TabSkeleton() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Icon icon="line-md:loading-loop" className="h-8 w-8 text-sky-500" />
    </div>
  )
}

type SidePanelView = "batch" | "extraction" | "singlescrape" | "settings"

function SidePanel() {
  const { t } = useI18n()

  // Tab 选项 - 使用翻译
  const tabOptions: SegmentedOption<"batch" | "extraction" | "singlescrape">[] =
    [
      {
        value: "singlescrape",
        label: t("sidepanel.title.singlescrape"),
        icon: <Icon icon="mdi:file-document-outline" width={14} />
      },
      {
        value: "batch",
        label: t("sidepanel.title.batch"),
        icon: <Icon icon="mdi:file-document-multiple-outline" width={14} />
      },
      {
        value: "extraction",
        label: t("sidepanel.title.extraction"),
        icon: <Icon icon="mdi:text-box-search-outline" width={14} />
      }
    ]

  const [currentView, setCurrentView] = useState<SidePanelView>("singlescrape")
  const [isSingleScrapeLoading, setIsSingleScrapeLoading] = useState(false)
  const singleScrapePanelRef = useRef<SingleScrapePanelHandle>(null)

  const [isSelectingNextPage, setIsSelectingNextPage] = useState(false)

  const {
    isSelecting,
    elementInfo,
    extractedLinks,
    nextPageButton,
    activateSelector,
    deactivateSelector,
    clearSelection,
    clearNextPageButton
  } = useElementSelector()

  const {
    mode,
    elementInfo: scrapeElementInfo,
    links,
    progress,
    results,
    error,
    paginationProgress,
    setLinks,
    addLink,
    updateLink,
    removeLink,
    startScrape,
    pauseScrape,
    resumeScrape,
    cancelScrape,
    reset
  } = useBatchScrape()

  const {
    mode: extractionMode,
    content: extractedContent,
    elementInfo: extractionElementInfo,
    error: extractionError,
    tabInfo: extractionTabInfo,
    startSelection: startContentSelection,
    cancelSelection: cancelContentSelection,
    reset: resetContentExtraction
  } = useContentExtraction()

  // 当选择器选中元素时，更新批量抓取的链接
  // setLinks is stable (useCallback with []) so we don't include it in deps
  useEffect(() => {
    if (elementInfo && extractedLinks.length > 0) {
      setLinks(elementInfo, extractedLinks)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementInfo, extractedLinks, setLinks])

  // 当选择完成时，重置 isSelectingNextPage 状态
  useEffect(() => {
    if (!isSelecting && isSelectingNextPage) {
      setIsSelectingNextPage(false)
    }
  }, [isSelecting, isSelectingNextPage])

  // 计算当前模式
  // 如果正在选择下一页按钮，保持在 previewing 模式
  const currentMode: BatchScrapeMode =
    isSelecting && !isSelectingNextPage ? "selecting" : mode

  // 处理选择元素
  const handleSelectElement = useCallback(() => {
    setIsSelectingNextPage(false)
    activateSelector()
  }, [activateSelector])

  // 处理选择下一页按钮
  const handleSelectNextPage = useCallback(() => {
    setIsSelectingNextPage(true)
    activateSelector("next-page-button")
  }, [activateSelector])

  // 处理清除下一页按钮选择
  const handleClearNextPage = useCallback(() => {
    clearNextPageButton()
  }, [clearNextPageButton])

  // 处理取消选择
  const handleCancel = useCallback(() => {
    if (isSelecting) {
      deactivateSelector()
      setIsSelectingNextPage(false)
    } else {
      cancelScrape()
    }
  }, [isSelecting, deactivateSelector, cancelScrape])

  // 处理重置
  const handleReset = useCallback(() => {
    clearSelection()
    clearNextPageButton()
    reset()
  }, [clearSelection, clearNextPageButton, reset])

  // 视图标题和描述
  const viewConfig = {
    singlescrape: {
      title: t("sidepanel.title.singlescrape"),
      description: t("sidepanel.desc.singlescrape")
    },
    batch: {
      title: t("sidepanel.title.batch"),
      description: t("sidepanel.desc.batch")
    },
    extraction: {
      title: t("sidepanel.title.extraction"),
      description: t("sidepanel.desc.extraction")
    },
    settings: {
      title: t("sidepanel.title.settings"),
      description: t("sidepanel.desc.settings")
    }
  }

  const currentConfig = viewConfig[currentView]

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        {/* Tab 导航 */}
        <div className="mb-3 flex items-center gap-1">
          <Segmented
            id="sidepanel-tabs"
            options={tabOptions}
            value={currentView === "settings" ? undefined : currentView}
            onChange={(value) => setCurrentView(value)}
            className="flex-1"
          />
          <Button
            variant={currentView === "settings" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setCurrentView("settings")}
            title={t("sidepanel.title.settings")}>
            <Icon icon="mdi:cog" width={18} />
          </Button>
        </div>

        {/* 标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-gray-800 text-lg">
              {currentConfig.title}
            </h1>
            <p className="text-gray-500 text-sm">{currentConfig.description}</p>
          </div>
          {currentView === "singlescrape" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => singleScrapePanelRef.current?.refresh()}
              disabled={isSingleScrapeLoading}
              title={t("common.refresh")}>
              <Icon
                icon={
                  isSingleScrapeLoading
                    ? "line-md:loading-alt-loop"
                    : "line-md:refresh-twotone"
                }
                className={isSingleScrapeLoading ? "mr-1 animate-spin" : "mr-1"}
                width="16"
                height="16"
              />
              {isSingleScrapeLoading
                ? t("sidepanel.fetching")
                : t("common.refresh")}
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Suspense fallback={<TabSkeleton />}>
          {currentView === "singlescrape" && (
            <SingleScrapePanel
              ref={singleScrapePanelRef}
              onLoadingChange={setIsSingleScrapeLoading}
            />
          )}
          {currentView === "batch" && (
            <BatchScrapePanel
              mode={currentMode}
              elementInfo={elementInfo || scrapeElementInfo}
              links={links}
              progress={progress}
              paginationProgress={paginationProgress}
              results={results}
              error={error}
              nextPageButton={nextPageButton}
              isSelectingNextPage={isSelectingNextPage && isSelecting}
              onStartScrape={startScrape}
              onPause={pauseScrape}
              onResume={resumeScrape}
              onCancel={handleCancel}
              onReset={handleReset}
              onSelectElement={handleSelectElement}
              onAddLink={addLink}
              onUpdateLink={updateLink}
              onRemoveLink={removeLink}
              onSelectNextPage={handleSelectNextPage}
              onClearNextPage={handleClearNextPage}
            />
          )}
          {currentView === "extraction" && (
            <ContentExtractionPanel
              mode={extractionMode}
              content={extractedContent}
              elementInfo={extractionElementInfo}
              error={extractionError}
              tabInfo={extractionTabInfo}
              onStartSelection={startContentSelection}
              onCancel={cancelContentSelection}
              onReset={resetContentExtraction}
            />
          )}
          {currentView === "settings" && <SidePanelSettings />}
        </Suspense>
      </div>

      {/* 底部链接 */}
      <div className="flex flex-shrink-0 items-center justify-between gap-4 border-gray-100 border-t px-1 pt-2">
        <span className="text-gray-400 text-xs">{t("app.name")}</span>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 p-0"
            onClick={() =>
              window.open("https://github.com/yusixian/moe-copy-ai", "_blank")
            }
            title={t("sidepanel.github")}>
            <Icon icon="mdi:github" className="size-full" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 p-0"
            onClick={() => window.open("https://moe.cosine.ren/docs", "_blank")}
            title={t("sidepanel.docs")}>
            <Icon icon="mdi:book-open-outline" className="size-full" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 p-0"
            onClick={() =>
              window.open("https://discord.gg/XzvrvNMcSe", "_blank")
            }
            title={t("sidepanel.discord")}>
            <Icon icon="mdi:discord" className="size-full" />
          </Button>
        </div>
        <span className="text-gray-400 text-xs">
          v{chrome.runtime.getManifest().version}
        </span>
      </div>

      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        pauseOnHover={false}
        theme="light"
        toastClassName="!bg-white !shadow-lg !rounded-lg !text-sm"
      />
    </div>
  )
}

// 包装 I18nProvider
function SidePanelWithI18n() {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <SidePanel />
      </ErrorBoundary>
    </I18nProvider>
  )
}

export default SidePanelWithI18n
