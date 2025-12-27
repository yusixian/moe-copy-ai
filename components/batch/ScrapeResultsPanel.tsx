import { Icon } from '@iconify/react'
import { useClipboard } from 'foxact/use-clipboard'
import { memo, useMemo, useState } from 'react'

import type { BatchScrapeResult } from '~constants/types'
import { cn } from '~utils'
import { aggregateToSingleMarkdown } from '~utils/content-aggregator'
import { exportAsZip } from '~utils/zip-exporter'

interface ScrapeResultsPanelProps {
  results: BatchScrapeResult[]
  onReset: () => void
}

const ScrapeResultsPanel = memo(function ScrapeResultsPanel({
  results,
  onReset,
}: ScrapeResultsPanelProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const { copy, copied } = useClipboard({ timeout: 2000 })

  // 统计
  const stats = useMemo(() => {
    const success = results.filter((r) => r.success)
    const failed = results.filter((r) => !r.success)
    const totalChars = success.reduce((sum, r) => sum + r.content.length, 0)
    return {
      total: results.length,
      successCount: success.length,
      failedCount: failed.length,
      totalChars,
    }
  }, [results])

  // 下载文件
  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 复制全部内容
  const handleCopyAll = () => {
    const { content } = aggregateToSingleMarkdown(results)
    copy(content)
  }

  // 导出为 Markdown
  const handleExportMarkdown = async () => {
    setIsExporting(true)
    try {
      const { content } = aggregateToSingleMarkdown(results)
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
      const date = new Date().toISOString().split('T')[0]
      downloadFile(blob, `batch-scrape-${date}.md`)
    } catch (error) {
      console.error('导出 Markdown 失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导出为 ZIP
  const handleExportZip = async () => {
    setIsExporting(true)
    try {
      const blob = await exportAsZip(results, {
        includeIndex: true,
        filenameFormat: 'title',
        maxFilenameLength: 50,
      })
      const date = new Date().toISOString().split('T')[0]
      downloadFile(blob, `batch-scrape-${date}.zip`)
    } catch (error) {
      console.error('导出 ZIP 失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 切换展开
  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 标题 */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
          <Icon icon="mdi:check-bold" className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">抓取完成</h3>
          <p className="text-sm text-gray-500">
            成功 {stats.successCount} / {stats.total} 页面
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-emerald-50 p-3 text-center">
          <div className="text-xl font-bold text-emerald-600">{stats.successCount}</div>
          <div className="text-xs text-emerald-700">成功</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3 text-center">
          <div className="text-xl font-bold text-red-600">{stats.failedCount}</div>
          <div className="text-xs text-red-700">失败</div>
        </div>
        <div className="rounded-lg bg-sky-50 p-3 text-center">
          <div className="text-xl font-bold text-sky-600">
            {stats.totalChars > 1000 ? `${(stats.totalChars / 1000).toFixed(1)}k` : stats.totalChars}
          </div>
          <div className="text-xs text-sky-700">字符</div>
        </div>
      </div>

      {/* 结果列表 */}
      <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200">
        {results.map((result, index) => (
          <div
            key={result.url}
            className={cn('border-b border-gray-100 last:border-b-0', expandedIndex === index && 'bg-gray-50')}
          >
            <div
              className="flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-gray-50"
              onClick={() => toggleExpand(index)}
            >
              {result.success ? (
                <Icon icon="mdi:check-circle" className="h-4 w-4 flex-shrink-0 text-emerald-500" />
              ) : (
                <Icon icon="mdi:close-circle" className="h-4 w-4 flex-shrink-0 text-red-500" />
              )}
              <span className="flex-1 truncate text-sm text-gray-700">{result.title}</span>
              <Icon
                icon="mdi:chevron-down"
                className={cn('h-4 w-4 text-gray-400 transition-transform', expandedIndex === index && 'rotate-180')}
              />
            </div>
            {expandedIndex === index && (
              <div className="border-t border-gray-100 bg-white px-3 py-2">
                <div className="mb-1 text-xs text-gray-500">{result.url}</div>
                {result.success ? (
                  <div className="max-h-24 overflow-y-auto rounded bg-gray-50 p-2 text-xs text-gray-600">
                    {result.content.substring(0, 500)}
                    {result.content.length > 500 && '...'}
                  </div>
                ) : (
                  <div className="text-xs text-red-500">{result.error}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 复制按钮 */}
      <button
        onClick={handleCopyAll}
        disabled={stats.successCount === 0}
        className={cn(
          'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
          stats.successCount === 0
            ? 'cursor-not-allowed bg-gray-200 text-gray-500'
            : copied
              ? 'bg-emerald-500 text-white shadow-md'
              : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md hover:from-violet-600 hover:to-purple-600'
        )}
      >
        {copied ? (
          <>
            <Icon icon="mdi:check" className="h-4 w-4" />
            已复制
          </>
        ) : (
          <>
            <Icon icon="mdi:content-copy" className="h-4 w-4" />
            复制全部
          </>
        )}
      </button>

      {/* 导出按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleExportMarkdown}
          disabled={isExporting || stats.successCount === 0}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
            stats.successCount > 0 && !isExporting
              ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-md hover:from-sky-600 hover:to-indigo-600'
              : 'cursor-not-allowed bg-gray-200 text-gray-500'
          )}
        >
          <Icon icon="mdi:file-document-outline" className="h-4 w-4" />
          导出 MD
        </button>
        <button
          onClick={handleExportZip}
          disabled={isExporting || stats.successCount === 0}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
            stats.successCount > 0 && !isExporting
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:from-emerald-600 hover:to-teal-600'
              : 'cursor-not-allowed bg-gray-200 text-gray-500'
          )}
        >
          <Icon icon="mdi:folder-zip-outline" className="h-4 w-4" />
          导出 ZIP
        </button>
      </div>

      {/* 重新开始 */}
      <button
        onClick={onReset}
        className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Icon icon="mdi:refresh" className="h-4 w-4" />
        重新开始
      </button>
    </div>
  )
})

export default ScrapeResultsPanel
