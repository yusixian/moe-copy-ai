import "./styles/global.css"
import "react-toastify/dist/ReactToastify.css"

import { Icon } from "@iconify/react"
import { useCallback, useEffect, useState } from "react"
import { ToastContainer } from "react-toastify"

import BatchScrapePanel from "~components/batch/BatchScrapePanel"
import ContentExtractionPanel from "~components/extraction/ContentExtractionPanel"
import SidePanelSettings from "~components/sidepanel/SidePanelSettings"
import type { BatchScrapeMode } from "~constants/types"
import { cn } from "~utils"
import useBatchScrape from "~hooks/useBatchScrape"
import useContentExtraction from "~hooks/useContentExtraction"
import useElementSelector from "~hooks/useElementSelector"

type SidePanelView = "batch" | "extraction" | "settings"

function SidePanel() {
  const [currentView, setCurrentView] = useState<SidePanelView>("batch")

  const [isSelectingNextPage, setIsSelectingNextPage] = useState(false)

  const {
    isSelecting,
    elementInfo,
    extractedLinks,
    nextPageButton,
    activateSelector,
    deactivateSelector,
    clearSelection,
    clearNextPageButton,
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
    reset,
  } = useBatchScrape()

  const {
    mode: extractionMode,
    content: extractedContent,
    elementInfo: extractionElementInfo,
    error: extractionError,
    startSelection: startContentSelection,
    cancelSelection: cancelContentSelection,
    reset: resetContentExtraction,
  } = useContentExtraction()

  // 当选择器选中元素时，更新批量抓取的链接
  // setLinks is stable (useCallback with []) so we don't include it in deps
  useEffect(() => {
    if (elementInfo && extractedLinks.length > 0) {
      setLinks(elementInfo, extractedLinks)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementInfo, extractedLinks])

  // 当选择完成时，重置 isSelectingNextPage 状态
  useEffect(() => {
    if (!isSelecting && isSelectingNextPage) {
      setIsSelectingNextPage(false)
    }
  }, [isSelecting, isSelectingNextPage])

  // 计算当前模式
  // 如果正在选择下一页按钮，保持在 previewing 模式
  const currentMode: BatchScrapeMode = (isSelecting && !isSelectingNextPage) ? 'selecting' : mode

  // 处理选择元素
  const handleSelectElement = useCallback(() => {
    setIsSelectingNextPage(false)
    activateSelector()
  }, [activateSelector])

  // 处理选择下一页按钮
  const handleSelectNextPage = useCallback(() => {
    setIsSelectingNextPage(true)
    activateSelector('next-page-button')
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
    batch: {
      title: "批量抓取",
      description: "选择页面区域，批量抓取链接中的所有文档",
    },
    extraction: {
      title: "内容提取",
      description: "选择页面元素，提取内容为多种格式",
    },
    settings: {
      title: "设置",
      description: "配置扩展设置",
    },
  }

  const currentConfig = viewConfig[currentView]

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4">
      {/* Header */}
      <div className="mb-4 flex-shrink-0">
        {/* Tab 导航 */}
        <div className="mb-3 flex items-center gap-1">
          <div className="flex flex-1 gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setCurrentView("batch")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                currentView === "batch"
                  ? "bg-white text-sky-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon icon="mdi:file-document-multiple-outline" width={14} />
              批量抓取
            </button>
            <button
              onClick={() => setCurrentView("extraction")}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                currentView === "extraction"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon icon="mdi:text-box-search-outline" width={14} />
              内容提取
            </button>
          </div>
          <button
            onClick={() => setCurrentView("settings")}
            className={cn(
              "rounded-lg p-2 transition-colors",
              currentView === "settings"
                ? "bg-white text-gray-700 shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            )}
            title="设置"
          >
            <Icon icon="mdi:cog" width={18} />
          </button>
        </div>

        {/* 标题 */}
        <div>
          <h1 className="text-lg font-bold text-gray-800">
            {currentConfig.title}
          </h1>
          <p className="text-sm text-gray-500">
            {currentConfig.description}
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1">
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
            onStartSelection={startContentSelection}
            onCancel={cancelContentSelection}
            onReset={resetContentExtraction}
          />
        )}
        {currentView === "settings" && <SidePanelSettings />}
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

export default SidePanel
