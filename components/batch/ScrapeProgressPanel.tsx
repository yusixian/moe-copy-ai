import { Icon } from "@iconify/react"
import { memo, useEffect, useMemo, useState } from "react"

import type { BatchProgress } from "~constants/types"
import { cn } from "~utils"

// 格式化耗时
const formatElapsedTime = (startTime: number): string => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000)
  if (elapsed < 60) return `${elapsed}s`
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  return `${mins}m ${secs}s`
}

interface PaginationProgress {
  currentPage: number
  maxPages: number
  isLoadingNextPage: boolean
  currentUrl?: string
}

interface ScrapeProgressPanelProps {
  progress: BatchProgress | null
  paginationProgress?: PaginationProgress | null
  onPause: () => void
  onResume: () => void
  onCancel: () => void
}

const ScrapeProgressPanel = memo(function ScrapeProgressPanel({
  progress,
  paginationProgress,
  onPause,
  onResume,
  onCancel
}: ScrapeProgressPanelProps) {
  // 持续更新的耗时显示
  const [elapsedTime, setElapsedTime] = useState("0s")

  // 计算百分比
  const percentage = useMemo(() => {
    if (!progress || progress.total === 0) return 0
    return Math.round((progress.completed / progress.total) * 100)
  }, [progress])

  // 每秒更新耗时
  useEffect(() => {
    if (!progress) {
      setElapsedTime("0s")
      return
    }

    // 立即更新一次
    setElapsedTime(formatElapsedTime(progress.startTime))

    // 设置定时器每秒更新
    const interval = setInterval(() => {
      setElapsedTime(formatElapsedTime(progress.startTime))
    }, 1000)

    return () => clearInterval(interval)
  }, [progress?.startTime, progress])

  // 统计成功/失败
  const stats = useMemo(() => {
    if (!progress) return { success: 0, failed: 0 }
    return {
      success: progress.results.filter((r) => r.status === "success").length,
      failed: progress.results.filter((r) => r.status === "failed").length
    }
  }, [progress])

  if (!progress) return null

  return (
    <div className="flex flex-col gap-4">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">正在批量抓取...</h3>
        <span className="text-gray-500 text-sm">{elapsedTime}</span>
      </div>

      {/* 操作按钮 - 固定在顶部 */}
      <div className="flex gap-3">
        {progress.isPaused ? (
          <button
            onClick={onResume}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 font-medium text-sm text-white transition-colors hover:bg-emerald-600">
            <Icon icon="mdi:play" className="h-4 w-4" />
            继续
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 font-medium text-sm text-white transition-colors hover:bg-amber-600">
            <Icon icon="mdi:pause" className="h-4 w-4" />
            暂停
          </button>
        )}
        <button
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 font-medium text-gray-700 text-sm transition-colors hover:bg-gray-50">
          <Icon icon="mdi:close" className="h-4 w-4" />
          取消
        </button>
      </div>

      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {progress.completed} / {progress.total} 页面
          </span>
          <span className="font-medium text-sky-600">{percentage}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 分页进度 */}
      {paginationProgress && (
        <div className="rounded-lg bg-indigo-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon
                icon={
                  paginationProgress.isLoadingNextPage
                    ? "mdi:loading"
                    : "mdi:book-open-page-variant"
                }
                className={cn(
                  "h-4 w-4 text-indigo-500",
                  paginationProgress.isLoadingNextPage && "animate-spin"
                )}
              />
              <span className="font-medium text-indigo-700 text-sm">
                {paginationProgress.isLoadingNextPage
                  ? "正在加载下一页..."
                  : `第 ${paginationProgress.currentPage} 页`}
              </span>
            </div>
            {paginationProgress.maxPages > 0 && (
              <span className="text-indigo-500 text-xs">
                最多 {paginationProgress.maxPages} 页
              </span>
            )}
          </div>
          {paginationProgress.currentUrl && (
            <div className="mt-2 truncate text-indigo-600 text-xs">
              {paginationProgress.currentUrl}
            </div>
          )}
        </div>
      )}

      {/* 当前抓取 */}
      {progress.current && (
        <div className="rounded-lg bg-sky-50 p-3">
          <div className="mb-1 flex items-center gap-2">
            <Icon
              icon="mdi:loading"
              className="h-4 w-4 animate-spin text-sky-500"
            />
            <span className="font-medium text-sky-700 text-sm">正在抓取</span>
          </div>
          <div className="truncate text-sky-600 text-xs">
            {progress.current.url}
          </div>
        </div>
      )}

      {/* 统计 */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Icon icon="mdi:check-circle" className="h-4 w-4 text-emerald-500" />
          <span className="text-gray-600">成功: {stats.success}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon icon="mdi:close-circle" className="h-4 w-4 text-red-500" />
          <span className="text-gray-600">失败: {stats.failed}</span>
        </div>
      </div>

      {/* 最近结果列表 */}
      {progress.results.length > 0 && (
        <div className="max-h-32 overflow-y-auto rounded-lg border border-gray-200">
          {progress.results
            .slice(-5)
            .reverse()
            .map((result, index) => (
              <div
                key={result.url}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs",
                  index !== Math.min(progress.results.length, 5) - 1 &&
                    "border-gray-100 border-b"
                )}>
                {result.status === "success" ? (
                  <Icon
                    icon="mdi:check-circle"
                    className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500"
                  />
                ) : (
                  <Icon
                    icon="mdi:close-circle"
                    className="h-3.5 w-3.5 flex-shrink-0 text-red-500"
                  />
                )}
                <span className="truncate text-gray-700">
                  {result.title || result.url}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
})

export default ScrapeProgressPanel
