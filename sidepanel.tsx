import "./styles/global.css"

import { useCallback, useEffect, useState } from "react"

import BatchScrapePanel from "~components/batch/BatchScrapePanel"
import type { BatchScrapeMode, ExtractedLink, SelectedElementInfo } from "~constants/types"
import useBatchScrape from "~hooks/useBatchScrape"
import useElementSelector from "~hooks/useElementSelector"

function SidePanel() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gray-800">批量抓取文档</h1>
        <p className="text-sm text-gray-500">选择页面区域，批量抓取链接中的所有文档</p>
      </div>

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
    </div>
  )
}

export default SidePanel
