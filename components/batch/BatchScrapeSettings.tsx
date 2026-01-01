import { useStorage } from "@plasmohq/storage/hook"
import { toast } from "react-toastify"

import {
  BATCH_CONCURRENCY_OPTIONS,
  BATCH_DELAY_OPTIONS,
  BATCH_RETRY_OPTIONS,
  BATCH_STRATEGY_OPTIONS,
  BATCH_TIMEOUT_OPTIONS,
  PAGINATION_DELAY_OPTIONS,
  PAGINATION_MAX_PAGES_OPTIONS
} from "~constants/options"

// 紧凑选择框组件
export function CompactSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-gray-600 text-xs">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs focus:border-sky-400 focus:outline-none">
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface BatchScrapeSettingsProps {
  /** 紧凑模式，用于 idle 界面 */
  compact?: boolean
  /** 是否显示保存提示 toast */
  showToast?: boolean
}

export function BatchScrapeSettings({
  compact = false,
  showToast = true
}: BatchScrapeSettingsProps) {
  const [strategy, setStrategy] = useStorage("batch_strategy", "fetch")
  const [concurrency, setConcurrency] = useStorage("batch_concurrency", "2")
  const [delay, setDelay] = useStorage("batch_delay", "500")
  const [timeout, setBatchTimeout] = useStorage("batch_timeout", "30000")
  const [retryCount, setRetryCount] = useStorage("batch_retry", "1")

  // 分页设置
  const [maxPages, setMaxPages] = useStorage("pagination_max_pages", "5")
  const [pageDelay, setPageDelay] = useStorage("pagination_delay", "2000")

  const currentStrategyDesc = BATCH_STRATEGY_OPTIONS.find(
    (s) => s.value === strategy
  )?.desc

  const handleChange = (
    setter: (v: string) => void,
    value: string,
    message: string
  ) => {
    setter(value)
    if (showToast) {
      toast.success(message)
    }
  }

  return (
    <div className="space-y-3">
      {/* 策略选择 - 使用按钮组 */}
      <div className="space-y-2">
        <label className="text-gray-600 text-xs">抓取策略</label>
        <div className="grid grid-cols-3 gap-1">
          {BATCH_STRATEGY_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() =>
                handleChange(setStrategy, s.value, "抓取策略已保存")
              }
              className={`rounded-md px-1.5 py-1.5 text-center text-xs transition-all ${
                strategy === s.value
                  ? "bg-sky-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {s.label}
            </button>
          ))}
        </div>
        {!compact && currentStrategyDesc && (
          <p className="text-gray-500 text-xs">{currentStrategyDesc}</p>
        )}
      </div>

      {/* 紧凑模式使用2列网格 */}
      {compact ? (
        <div className="grid grid-cols-2 gap-2">
          <CompactSelect
            label="并发"
            value={concurrency}
            onChange={(v) => handleChange(setConcurrency, v, "并发数量已保存")}
            options={BATCH_CONCURRENCY_OPTIONS}
          />
          <CompactSelect
            label="延迟"
            value={delay}
            onChange={(v) => handleChange(setDelay, v, "批次延迟已保存")}
            options={BATCH_DELAY_OPTIONS}
          />
          <CompactSelect
            label="超时"
            value={timeout}
            onChange={(v) => handleChange(setBatchTimeout, v, "超时时间已保存")}
            options={BATCH_TIMEOUT_OPTIONS}
          />
          <CompactSelect
            label="重试"
            value={retryCount}
            onChange={(v) => handleChange(setRetryCount, v, "重试次数已保存")}
            options={BATCH_RETRY_OPTIONS}
          />
        </div>
      ) : (
        <>
          <CompactSelect
            label="并发数量"
            value={concurrency}
            onChange={(v) => handleChange(setConcurrency, v, "并发数量已保存")}
            options={BATCH_CONCURRENCY_OPTIONS}
          />
          <CompactSelect
            label="批次延迟"
            value={delay}
            onChange={(v) => handleChange(setDelay, v, "批次延迟已保存")}
            options={BATCH_DELAY_OPTIONS}
          />
          <CompactSelect
            label="超时时间"
            value={timeout}
            onChange={(v) => handleChange(setBatchTimeout, v, "超时时间已保存")}
            options={BATCH_TIMEOUT_OPTIONS}
          />
          <CompactSelect
            label="重试次数"
            value={retryCount}
            onChange={(v) => handleChange(setRetryCount, v, "重试次数已保存")}
            options={BATCH_RETRY_OPTIONS}
          />
        </>
      )}

      {/* 分页抓取设置 */}
      <div
        className={`flex gap-2 border-gray-200 border-t pt-3 ${compact ? "" : "mt-4"}`}>
        <div className="flex-1">
          <CompactSelect
            label={compact ? "页数" : "最大页数"}
            value={maxPages}
            onChange={(v) => handleChange(setMaxPages, v, "最大页数已保存")}
            options={PAGINATION_MAX_PAGES_OPTIONS}
          />
        </div>
        <div className="flex-1">
          <CompactSelect
            label={compact ? "翻页" : "翻页延迟"}
            value={pageDelay}
            onChange={(v) => handleChange(setPageDelay, v, "翻页延迟已保存")}
            options={PAGINATION_DELAY_OPTIONS}
          />
        </div>
      </div>
    </div>
  )
}

export default BatchScrapeSettings
