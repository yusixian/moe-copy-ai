import "./styles/global.css"
import "react-toastify/dist/ReactToastify.css"

import { Icon } from "@iconify/react"
import { useCallback, useEffect, useState } from "react"
import { ToastContainer } from "react-toastify"

import BatchScrapePanel from "~components/batch/BatchScrapePanel"
import SidePanelSettings from "~components/sidepanel/SidePanelSettings"
import type { BatchScrapeMode } from "~constants/types"
import useBatchScrape from "~hooks/useBatchScrape"
import useElementSelector from "~hooks/useElementSelector"

type SidePanelView = "batch" | "settings"

function SidePanel() {
  const [currentView, setCurrentView] = useState<SidePanelView>("batch")

  const {
    isSelecting,
    elementInfo,
    extractedLinks,
    activateSelector,
    deactivateSelector,
    clearSelection,
  } = useElementSelector()

  const {
    mode,
    elementInfo: scrapeElementInfo,
    links,
    progress,
    results,
    error,
    setLinks,
    startScrape,
    pauseScrape,
    resumeScrape,
    cancelScrape,
    reset,
  } = useBatchScrape()

  // 当选择器选中元素时，更新批量抓取的链接
  useEffect(() => {
    if (elementInfo && extractedLinks.length > 0) {
      setLinks(elementInfo, extractedLinks)
    }
  }, [elementInfo, extractedLinks, setLinks])

  // 计算当前模式
  const currentMode: BatchScrapeMode = isSelecting ? 'selecting' : mode

  // 处理选择元素
  const handleSelectElement = useCallback(() => {
    activateSelector()
  }, [activateSelector])

  // 处理取消选择
  const handleCancel = useCallback(() => {
    if (isSelecting) {
      deactivateSelector()
    } else {
      cancelScrape()
    }
  }, [isSelecting, deactivateSelector, cancelScrape])

  // 处理重置
  const handleReset = useCallback(() => {
    clearSelection()
    reset()
  }, [clearSelection, reset])

  const toggleView = () => {
    setCurrentView((v) => (v === "batch" ? "settings" : "batch"))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">
            {currentView === "batch" ? "批量抓取文档" : "设置"}
          </h1>
          <p className="text-sm text-gray-500">
            {currentView === "batch"
              ? "选择页面区域，批量抓取链接中的所有文档"
              : "配置扩展设置"}
          </p>
        </div>
        <button
          onClick={toggleView}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          title={currentView === "batch" ? "打开设置" : "返回"}
        >
          <Icon
            icon={currentView === "batch" ? "mdi:cog" : "mdi:arrow-left"}
            width={20}
          />
        </button>
      </div>

      {currentView === "batch" ? (
        <BatchScrapePanel
          mode={currentMode}
          elementInfo={elementInfo || scrapeElementInfo}
          links={links}
          progress={progress}
          results={results}
          error={error}
          onStartScrape={startScrape}
          onPause={pauseScrape}
          onResume={resumeScrape}
          onCancel={handleCancel}
          onReset={handleReset}
          onSelectElement={handleSelectElement}
        />
      ) : (
        <SidePanelSettings />
      )}

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
