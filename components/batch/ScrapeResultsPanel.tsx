import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"
import { memo, useCallback, useMemo, useState } from "react"

import { Button } from "~/components/ui/button"
import type { BatchScrapeResult } from "~constants/types"
import { useSelectionSet } from "~hooks/useSelectionSet"
import { cn } from "~utils"
import { aggregateToSingleMarkdown } from "~utils/content-aggregator"
import { downloadFile } from "~utils/download"
import { exportAsZip } from "~utils/zip-exporter"

import BatchAiSummary from "./BatchAiSummary"

interface ScrapeResultsPanelProps {
  results: BatchScrapeResult[]
  onReset: () => void
}

const ScrapeResultsPanel = memo(function ScrapeResultsPanel({
  results,
  onReset
}: ScrapeResultsPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [fullContentItems, setFullContentItems] = useState<Set<number>>(
    new Set()
  )
  const [copiedItemIndex, setCopiedItemIndex] = useState<number | null>(null)
  const { copy, copied } = useClipboard({ timeout: 2000 })

  // 使用 useSelectionSet 管理选中状态
  const canSelectResult = useCallback((r: BatchScrapeResult) => r.success, [])
  const getResultKey = useCallback((r: BatchScrapeResult) => r.url, [])

  const {
    selectedItems: selectedResults,
    isSelected,
    selectAll,
    deselectAll,
    toggle: toggleSelect
  } = useSelectionSet({
    items: results,
    getKey: getResultKey,
    canSelect: canSelectResult
  })

  // 统计
  const stats = useMemo(() => {
    const success = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)
    const totalChars = success.reduce((sum, r) => sum + r.content.length, 0)
    return {
      total: results.length,
      successCount: success.length,
      failedCount: failed.length,
      totalChars
    }
  }, [results])

  // 选中结果的统计
  const selectedStats = useMemo(() => {
    const success = selectedResults.filter((r) => r.success)
    return {
      count: selectedResults.length,
      successCount: success.length,
      totalChars: success.reduce((sum, r) => sum + r.content.length, 0)
    }
  }, [selectedResults])

  // 复制选中内容
  const handleCopyAll = () => {
    const { content } = aggregateToSingleMarkdown(selectedResults)
    copy(content)
  }

  // 导出为 Markdown
  const handleExportMarkdown = async () => {
    setIsExporting(true)
    try {
      const { content } = aggregateToSingleMarkdown(selectedResults)
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
      const date = new Date().toISOString().split("T")[0]
      downloadFile(blob, `batch-scrape-${date}.md`)
    } catch (error) {
      console.error("导出 Markdown 失败:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导出为 ZIP
  const handleExportZip = async () => {
    setIsExporting(true)
    try {
      const blob = await exportAsZip(selectedResults, {
        includeIndex: true,
        filenameFormat: "title",
        maxFilenameLength: 50
      })
      const date = new Date().toISOString().split("T")[0]
      downloadFile(blob, `batch-scrape-${date}.zip`)
    } catch (error) {
      console.error("导出 ZIP 失败:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // 切换展开
  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }

  // 切换完整内容显示
  const toggleFullContent = (index: number) => {
    setFullContentItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // 复制单项 JSON（使用与 markdown 相同的 foxact hook）
  const handleCopyItemJson = (result: BatchScrapeResult, index: number) => {
    const json = JSON.stringify(result, null, 2)
    copy(json)
    setCopiedItemIndex(index)
    // 使用与 useClipboard 相同的 2000ms 超时
    setTimeout(() => setCopiedItemIndex(null), 2000)
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <Icon icon="mdi:check-bold" className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">抓取完成</h3>
          <p className="text-gray-500 text-sm">
            成功 {stats.successCount} / {stats.total} 页面
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 text-center">
          <div className="font-bold text-emerald-600 text-xl">
            {stats.successCount}
          </div>
          <div className="text-emerald-700 text-xs">成功</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3 text-center">
          <div className="font-bold text-red-600 text-xl">
            {stats.failedCount}
          </div>
          <div className="text-red-700 text-xs">失败</div>
        </div>
        <div className="rounded-lg bg-sky-50 p-3 text-center">
          <div className="font-bold text-sky-600 text-xl">
            {stats.totalChars > 1000
              ? `${(stats.totalChars / 1000).toFixed(1)}k`
              : stats.totalChars}
          </div>
          <div className="text-sky-700 text-xs">字符</div>
        </div>
      </div>

      {/* 选择操作栏 */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="xs" onClick={selectAll}>
            <Icon
              icon="mdi:checkbox-multiple-marked"
              className="mr-1 h-3.5 w-3.5"
            />
            全选
          </Button>
          <Button variant="ghost" size="xs" onClick={deselectAll}>
            <Icon
              icon="mdi:checkbox-multiple-blank-outline"
              className="mr-1 h-3.5 w-3.5"
            />
            取消
          </Button>
        </div>
        <span className="text-gray-500 text-xs">
          已选 <b className="text-blue-600">{selectedStats.count}</b> /{" "}
          {stats.successCount}
        </span>
      </div>

      {/* 结果列表 */}
      <div className="max-h-64 min-h-32 flex-shrink-0 overflow-y-auto rounded-lg border border-gray-200">
        {results.map((result, index) => (
          <div
            key={result.url}
            className={cn(
              "border-gray-100 border-b last:border-b-0",
              expandedIndex === index && "bg-gray-50"
            )}>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50"
              onClick={() => toggleExpand(index)}>
              {/* Checkbox - 仅成功项可勾选 */}
              {result.success ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSelect(result.url)
                  }}
                  className="flex-shrink-0">
                  <Icon
                    icon={
                      isSelected(result.url)
                        ? "mdi:checkbox-marked"
                        : "mdi:checkbox-blank-outline"
                    }
                    className={cn(
                      "h-4 w-4",
                      isSelected(result.url) ? "text-sky-500" : "text-gray-400"
                    )}
                  />
                </button>
              ) : (
                <Icon
                  icon="mdi:checkbox-blank-off-outline"
                  className="h-4 w-4 flex-shrink-0 text-gray-300"
                />
              )}
              {result.success ? (
                <Icon
                  icon="mdi:check-circle"
                  className="h-4 w-4 flex-shrink-0 text-emerald-500"
                />
              ) : (
                <Icon
                  icon="mdi:close-circle"
                  className="h-4 w-4 flex-shrink-0 text-red-500"
                />
              )}
              <span
                className={cn(
                  "flex-1 truncate text-sm",
                  result.success ? "text-gray-700" : "text-gray-400"
                )}>
                {result.title}
              </span>
              <Icon
                icon="mdi:chevron-down"
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform",
                  expandedIndex === index && "rotate-180"
                )}
              />
            </button>
            {expandedIndex === index && (
              <div className="border-gray-100 border-t bg-white px-3 py-2">
                {/* URL + Copy JSON button */}
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="flex-1 truncate text-gray-500 text-xs">
                    {result.url}
                  </span>
                  <Button
                    variant={
                      copiedItemIndex === index ? "success" : "secondary"
                    }
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyItemJson(result, index)
                    }}>
                    <Icon
                      icon={
                        copiedItemIndex === index
                          ? "mdi:check"
                          : "mdi:code-json"
                      }
                      className="mr-1 h-3.5 w-3.5"
                    />
                    {copiedItemIndex === index ? "已复制" : "JSON"}
                  </Button>
                </div>
                {/* Content */}
                {result.success ? (
                  <div className="rounded bg-gray-50 p-2">
                    <div
                      className={cn(
                        "overflow-y-auto whitespace-pre-wrap break-words text-gray-600 text-xs",
                        fullContentItems.has(index) ? "max-h-96" : "max-h-24"
                      )}>
                      {fullContentItems.has(index)
                        ? result.content
                        : result.content.substring(0, 500)}
                      {result.content.length > 500 &&
                        !fullContentItems.has(index) &&
                        "..."}
                    </div>
                    {result.content.length > 500 && (
                      <Button
                        variant="outline"
                        size="xs"
                        fullWidth
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFullContent(index)
                        }}>
                        <Icon
                          icon={
                            fullContentItems.has(index)
                              ? "mdi:chevron-up"
                              : "mdi:chevron-down"
                          }
                          className="mr-1 h-4 w-4"
                        />
                        {fullContentItems.has(index) ? "收起" : "展开全部"}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-red-500 text-xs">{result.error}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 复制按钮 */}
      <Button
        variant={copied ? "success" : "default"}
        size="lg"
        fullWidth
        onClick={handleCopyAll}
        disabled={selectedStats.count === 0}>
        <Icon
          icon={copied ? "mdi:check" : "mdi:content-copy"}
          className="mr-1 h-4 w-4"
        />
        {copied ? "已复制" : `复制选中 (${selectedStats.count})`}
      </Button>

      {/* 导出按钮 */}
      <div className="flex gap-3">
        <Button
          variant="default"
          size="md"
          fullWidth
          onClick={handleExportMarkdown}
          disabled={isExporting || selectedStats.count === 0}>
          <Icon icon="mdi:file-document-outline" className="mr-1 h-4 w-4" />
          导出 MD
        </Button>
        <Button
          variant="success"
          size="md"
          fullWidth
          onClick={handleExportZip}
          disabled={isExporting || selectedStats.count === 0}>
          <Icon icon="mdi:folder-zip-outline" className="mr-1 h-4 w-4" />
          导出 ZIP
        </Button>
      </div>

      {/* AI 总结 */}
      {selectedStats.count > 0 && <BatchAiSummary results={selectedResults} />}

      {/* 重新开始 */}
      <Button variant="outline" size="md" fullWidth onClick={onReset}>
        <Icon icon="mdi:refresh" className="mr-1 h-4 w-4" />
        重新开始
      </Button>
    </div>
  )
})

export default ScrapeResultsPanel
