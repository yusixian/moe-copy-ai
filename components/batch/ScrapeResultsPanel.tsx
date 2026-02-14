import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "~/components/ui/button"
import type { BatchScrapeResult } from "~constants/types"
import { useSelectionSet } from "~hooks/useSelectionSet"
import { cn } from "~utils"
import { aggregateToSingleMarkdown } from "~utils/content-aggregator"
import { downloadFile } from "~utils/download"
import { useI18n } from "~utils/i18n"
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
  const { t } = useI18n()
  const [isExporting, setIsExporting] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [fullContentItems, setFullContentItems] = useState<Set<number>>(
    new Set()
  )
  const [copiedItemIndex, setCopiedItemIndex] = useState<number | null>(null)
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const { copy, copied } = useClipboard({ timeout: 2000 })

  // Clean up timer on unmount
  useEffect(() => () => clearTimeout(copiedTimerRef.current), [])

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
      console.error(t("batch.results.export.markdownError"), error)
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
      console.error(t("batch.results.export.zipError"), error)
    } finally {
      setIsExporting(false)
    }
  }

  // 切换展开
  const toggleExpand = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }, [])

  // 切换完整内容显示
  const toggleFullContent = useCallback((index: number) => {
    setFullContentItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  // 复制单项 JSON（使用与 markdown 相同的 foxact hook）
  const handleCopyItemJson = useCallback(
    (result: BatchScrapeResult, index: number) => {
      const json = JSON.stringify(result, null, 2)
      copy(json)
      setCopiedItemIndex(index)
      clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = setTimeout(() => setCopiedItemIndex(null), 2000)
    },
    [copy]
  )

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
          <Icon icon="mdi:check-bold" className="h-5 w-5 text-success" />
        </div>
        <div>
          <h3 className="font-semibold text-text-1">
            {t("batch.results.title")}
          </h3>
          <p className="text-sm text-text-3">
            {t("batch.results.summary", {
              success: stats.successCount,
              total: stats.total
            })}
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-success/10 p-3 text-center">
          <div className="font-bold text-success text-xl">
            {stats.successCount}
          </div>
          <div className="text-success text-xs">
            {t("batch.results.stats.success")}
          </div>
        </div>
        <div className="rounded-lg bg-error/10 p-3 text-center">
          <div className="font-bold text-error text-xl">
            {stats.failedCount}
          </div>
          <div className="text-error text-xs">
            {t("batch.results.stats.failed")}
          </div>
        </div>
        <div className="rounded-lg bg-accent-blue-ghost p-3 text-center">
          <div className="font-bold text-accent-blue text-xl">
            {stats.totalChars > 1000
              ? `${(stats.totalChars / 1000).toFixed(1)}k`
              : stats.totalChars}
          </div>
          <div className="text-accent-blue text-xs">
            {t("batch.results.stats.chars")}
          </div>
        </div>
      </div>

      {/* 选择操作栏 */}
      <div className="flex items-center justify-between rounded-lg border border-line-1 bg-content-alt px-3 py-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="xs" onClick={selectAll}>
            <Icon
              icon="mdi:checkbox-multiple-marked"
              className="mr-1 h-3.5 w-3.5"
            />
            {t("batch.results.selectAll")}
          </Button>
          <Button variant="ghost" size="xs" onClick={deselectAll}>
            <Icon
              icon="mdi:checkbox-multiple-blank-outline"
              className="mr-1 h-3.5 w-3.5"
            />
            {t("batch.results.deselectAll")}
          </Button>
        </div>
        <span className="text-text-3 text-xs">
          {t("batch.results.selected")}{" "}
          <b className="text-accent-blue">{selectedStats.count}</b> /{" "}
          {stats.successCount}
        </span>
      </div>

      {/* 结果列表 */}
      <div className="max-h-64 min-h-32 flex-shrink-0 overflow-y-auto rounded-lg border border-line-1">
        {results.map((result, index) => (
          <ScrapeResultItem
            key={result.url}
            result={result}
            index={index}
            isExpanded={expandedIndex === index}
            isFullContent={fullContentItems.has(index)}
            isSelected={isSelected(result.url)}
            isCopied={copiedItemIndex === index}
            onToggleExpand={toggleExpand}
            onToggleSelect={toggleSelect}
            onToggleFullContent={toggleFullContent}
            onCopyJson={handleCopyItemJson}
          />
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
        {copied
          ? t("batch.results.copied")
          : t("batch.results.copySelected", { count: selectedStats.count })}
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
          {t("batch.results.exportMd")}
        </Button>
        <Button
          variant="success"
          size="md"
          fullWidth
          onClick={handleExportZip}
          disabled={isExporting || selectedStats.count === 0}>
          <Icon icon="mdi:folder-zip-outline" className="mr-1 h-4 w-4" />
          {t("batch.results.exportZip")}
        </Button>
      </div>

      {/* AI 总结 */}
      {selectedStats.count > 0 && <BatchAiSummary results={selectedResults} />}

      {/* 重新开始 */}
      <Button variant="outline" size="md" fullWidth onClick={onReset}>
        <Icon icon="mdi:refresh" className="mr-1 h-4 w-4" />
        {t("batch.results.reset")}
      </Button>
    </div>
  )
})

interface ScrapeResultItemProps {
  result: BatchScrapeResult
  index: number
  isExpanded: boolean
  isFullContent: boolean
  isSelected: boolean
  isCopied: boolean
  onToggleExpand: (index: number) => void
  onToggleSelect: (url: string) => void
  onToggleFullContent: (index: number) => void
  onCopyJson: (result: BatchScrapeResult, index: number) => void
}

const ScrapeResultItem = memo(function ScrapeResultItem({
  result,
  index,
  isExpanded,
  isFullContent,
  isSelected,
  isCopied,
  onToggleExpand,
  onToggleSelect,
  onToggleFullContent,
  onCopyJson
}: ScrapeResultItemProps) {
  const { t } = useI18n()

  return (
    <div
      className={cn(
        "border-line-2 border-b last:border-b-0",
        isExpanded && "bg-content-alt"
      )}>
      <button
        type="button"
        className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 hover:bg-content-alt"
        onClick={() => onToggleExpand(index)}>
        {/* Checkbox - 仅成功项可勾选 */}
        {result.success ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect(result.url)
            }}
            className="flex-shrink-0">
            <Icon
              icon={
                isSelected
                  ? "mdi:checkbox-marked"
                  : "mdi:checkbox-blank-outline"
              }
              className={cn(
                "h-4 w-4",
                isSelected ? "text-accent-blue" : "text-text-4"
              )}
            />
          </button>
        ) : (
          <Icon
            icon="mdi:checkbox-blank-off-outline"
            className="h-4 w-4 flex-shrink-0 text-text-4"
          />
        )}
        {result.success ? (
          <Icon
            icon="mdi:check-circle"
            className="h-4 w-4 flex-shrink-0 text-success"
          />
        ) : (
          <Icon
            icon="mdi:close-circle"
            className="h-4 w-4 flex-shrink-0 text-error"
          />
        )}
        <span
          className={cn(
            "flex-1 truncate text-sm",
            result.success ? "text-text-2" : "text-text-4"
          )}>
          {result.title}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className={cn(
            "h-4 w-4 text-text-4 transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      {isExpanded && (
        <div className="border-line-2 border-t bg-content-solid px-3 py-2">
          {/* URL + Copy JSON button */}
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex-1 truncate text-text-3 text-xs">
              {result.url}
            </span>
            <Button
              variant={isCopied ? "success" : "secondary"}
              size="xs"
              onClick={(e) => {
                e.stopPropagation()
                onCopyJson(result, index)
              }}>
              <Icon
                icon={isCopied ? "mdi:check" : "mdi:code-json"}
                className="mr-1 h-3.5 w-3.5"
              />
              {isCopied ? t("batch.results.copied") : t("batch.results.json")}
            </Button>
          </div>
          {/* Content */}
          {result.success ? (
            <div className="rounded bg-content-alt p-2">
              <div
                className={cn(
                  "overflow-y-auto whitespace-pre-wrap break-words text-text-2 text-xs",
                  isFullContent ? "max-h-96" : "max-h-24"
                )}>
                {isFullContent
                  ? result.content
                  : result.content.substring(0, 500)}
                {result.content.length > 500 && !isFullContent && "..."}
              </div>
              {result.content.length > 500 && (
                <Button
                  variant="outline"
                  size="xs"
                  fullWidth
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFullContent(index)
                  }}>
                  <Icon
                    icon={isFullContent ? "mdi:chevron-up" : "mdi:chevron-down"}
                    className="mr-1 h-4 w-4"
                  />
                  {isFullContent
                    ? t("batch.results.collapse")
                    : t("batch.results.expandAll")}
                </Button>
              )}
            </div>
          ) : (
            <div className="text-error text-xs">{result.error}</div>
          )}
        </div>
      )}
    </div>
  )
})

export default ScrapeResultsPanel
