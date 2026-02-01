import { Icon } from "@iconify/react"
import { memo, useEffect, useMemo, useState } from "react"

import type { BatchProgress } from "~constants/types"
import { cn } from "~utils"
import { useI18n } from "~utils/i18n"

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
  const { t } = useI18n()

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
        <h3 className="font-semibold text-text-1">
          {t("batch.progress.title")}
        </h3>
        <span className="text-sm text-text-3">{elapsedTime}</span>
      </div>

      {/* 操作按钮 - 固定在顶部 */}
      <div className="flex gap-3">
        {progress.isPaused ? (
          <button
            type="button"
            onClick={onResume}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-500 py-2.5 font-medium text-sm text-white transition-colors hover:bg-emerald-600">
            <Icon icon="mdi:play" className="h-4 w-4" />
            {t("batch.progress.resume")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onPause}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 font-medium text-sm text-white transition-colors hover:bg-amber-600">
            <Icon icon="mdi:pause" className="h-4 w-4" />
            {t("batch.progress.pause")}
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line-1 bg-content-solid py-2.5 font-medium text-sm text-text-2 transition-colors hover:bg-content-alt">
          <Icon icon="mdi:close" className="h-4 w-4" />
          {t("batch.progress.cancel")}
        </button>
      </div>

      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-2">
            {t("batch.progress.pages", {
              completed: progress.completed,
              total: progress.total
            })}
          </span>
          <span className="font-medium text-accent-blue">{percentage}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-content-alt">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-indigo transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* 分页进度 */}
      {paginationProgress && (
        <div className="rounded-lg bg-accent-indigo-ghost p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon
                icon={
                  paginationProgress.isLoadingNextPage
                    ? "mdi:loading"
                    : "mdi:book-open-page-variant"
                }
                className={cn(
                  "h-4 w-4 text-accent-indigo",
                  paginationProgress.isLoadingNextPage && "animate-spin"
                )}
              />
              <span className="font-medium text-accent-indigo text-sm">
                {paginationProgress.isLoadingNextPage
                  ? t("batch.progress.pagination.loading")
                  : t("batch.progress.pagination.page", {
                      current: paginationProgress.currentPage
                    })}
              </span>
            </div>
            {paginationProgress.maxPages > 0 && (
              <span className="text-accent-indigo/70 text-xs">
                {t("batch.progress.pagination.max", {
                  max: paginationProgress.maxPages
                })}
              </span>
            )}
          </div>
          {paginationProgress.currentUrl && (
            <div className="mt-2 truncate text-accent-indigo text-xs">
              {paginationProgress.currentUrl}
            </div>
          )}
        </div>
      )}

      {/* 当前抓取 */}
      {progress.current && (
        <div className="rounded-lg bg-accent-blue-ghost p-3">
          <div className="mb-1 flex items-center gap-2">
            <Icon
              icon="mdi:loading"
              className="h-4 w-4 animate-spin text-accent-blue"
            />
            <span className="font-medium text-accent-blue text-sm">
              {t("batch.progress.current")}
            </span>
          </div>
          <div className="truncate text-accent-blue text-xs">
            {progress.current.url}
          </div>
        </div>
      )}

      {/* 统计 */}
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Icon icon="mdi:check-circle" className="h-4 w-4 text-success" />
          <span className="text-text-2">
            {t("batch.progress.stats.success", { count: stats.success })}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Icon icon="mdi:close-circle" className="h-4 w-4 text-error" />
          <span className="text-text-2">
            {t("batch.progress.stats.failed", { count: stats.failed })}
          </span>
        </div>
      </div>

      {/* 最近结果列表 */}
      {progress.results.length > 0 && (
        <div className="max-h-32 overflow-y-auto rounded-lg border border-line-1">
          {progress.results
            .slice(-5)
            .reverse()
            .map((result, index) => (
              <div
                key={result.url}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs",
                  index !== Math.min(progress.results.length, 5) - 1 &&
                    "border-line-2 border-b"
                )}>
                {result.status === "success" ? (
                  <Icon
                    icon="mdi:check-circle"
                    className="h-3.5 w-3.5 flex-shrink-0 text-success"
                  />
                ) : (
                  <Icon
                    icon="mdi:close-circle"
                    className="h-3.5 w-3.5 flex-shrink-0 text-error"
                  />
                )}
                <span className="truncate text-text-2">
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
