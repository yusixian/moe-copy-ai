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
import { useI18n } from "~utils/i18n"
import { translateOptions } from "~utils/options-helper"

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
  const selectId = `select-${label.replace(/\s+/g, "-").toLowerCase()}`
  return (
    <div className="flex items-center justify-between gap-1.5">
      <label htmlFor={selectId} className="flex-shrink-0 text-gray-600 text-xs">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 rounded border border-sky-200 bg-sky-50 px-2 py-1 text-xs focus:border-sky-400 focus:outline-none">
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
  const { t } = useI18n()
  const [strategy, setStrategy] = useStorage("batch_strategy", "fetch")
  const [concurrency, setConcurrency] = useStorage("batch_concurrency", "2")
  const [delay, setDelay] = useStorage("batch_delay", "500")
  const [timeout, setBatchTimeout] = useStorage("batch_timeout", "30000")
  const [retryCount, setRetryCount] = useStorage("batch_retry", "1")

  // 分页设置
  const [maxPages, setMaxPages] = useStorage("pagination_max_pages", "5")
  const [pageDelay, setPageDelay] = useStorage("pagination_delay", "2000")

  const currentStrategyDescKey = BATCH_STRATEGY_OPTIONS.find(
    (s) => s.value === strategy
  )?.descKey

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
      <fieldset className="space-y-2">
        <legend className="text-gray-600 text-xs">
          {t("batch.settings.strategy")}
        </legend>
        <div className="grid grid-cols-3 gap-1">
          {BATCH_STRATEGY_OPTIONS.map((s) => (
            <button
              type="button"
              key={s.value}
              onClick={() =>
                handleChange(
                  setStrategy,
                  s.value,
                  t("batch.settings.strategy.saved")
                )
              }
              className={`rounded-md px-1.5 py-1.5 text-center text-xs transition-all ${
                strategy === s.value
                  ? "bg-sky-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {t(s.labelKey)}
            </button>
          ))}
        </div>
        {!compact && currentStrategyDescKey && (
          <p className="text-gray-500 text-xs">{t(currentStrategyDescKey)}</p>
        )}
      </fieldset>

      {/* 紧凑模式使用2列网格 */}
      {compact ? (
        <div className="flex flex-wrap gap-3">
          <CompactSelect
            label={t("batch.settings.concurrency")}
            value={concurrency}
            onChange={(v) =>
              handleChange(
                setConcurrency,
                v,
                t("batch.settings.concurrency.saved")
              )
            }
            options={translateOptions(BATCH_CONCURRENCY_OPTIONS, t)}
          />
          <CompactSelect
            label={t("batch.settings.delay")}
            value={delay}
            onChange={(v) =>
              handleChange(setDelay, v, t("batch.settings.delay.saved"))
            }
            options={translateOptions(BATCH_DELAY_OPTIONS, t)}
          />
          <CompactSelect
            label={t("batch.settings.timeout")}
            value={timeout}
            onChange={(v) =>
              handleChange(
                setBatchTimeout,
                v,
                t("batch.settings.timeout.saved")
              )
            }
            options={translateOptions(BATCH_TIMEOUT_OPTIONS, t)}
          />
          <CompactSelect
            label={t("batch.settings.retry")}
            value={retryCount}
            onChange={(v) =>
              handleChange(setRetryCount, v, t("batch.settings.retry.saved"))
            }
            options={translateOptions(BATCH_RETRY_OPTIONS, t)}
          />
        </div>
      ) : (
        <>
          <CompactSelect
            label={t("batch.settings.concurrency.full")}
            value={concurrency}
            onChange={(v) =>
              handleChange(
                setConcurrency,
                v,
                t("batch.settings.concurrency.saved")
              )
            }
            options={translateOptions(BATCH_CONCURRENCY_OPTIONS, t)}
          />
          <CompactSelect
            label={t("batch.settings.delay.full")}
            value={delay}
            onChange={(v) =>
              handleChange(setDelay, v, t("batch.settings.delay.saved"))
            }
            options={translateOptions(BATCH_DELAY_OPTIONS, t)}
          />
          <CompactSelect
            label={t("batch.settings.timeout.full")}
            value={timeout}
            onChange={(v) =>
              handleChange(
                setBatchTimeout,
                v,
                t("batch.settings.timeout.saved")
              )
            }
            options={translateOptions(BATCH_TIMEOUT_OPTIONS, t)}
          />
          <CompactSelect
            label={t("batch.settings.retry.full")}
            value={retryCount}
            onChange={(v) =>
              handleChange(setRetryCount, v, t("batch.settings.retry.saved"))
            }
            options={translateOptions(BATCH_RETRY_OPTIONS, t)}
          />
        </>
      )}

      {/* 分页抓取设置 */}
      <div
        className={`flex gap-2 border-gray-200 border-t pt-3 ${compact ? "" : "mt-4"}`}>
        <div className="flex-1">
          <CompactSelect
            label={
              compact
                ? t("batch.settings.maxPages")
                : t("batch.settings.maxPages.full")
            }
            value={maxPages}
            onChange={(v) =>
              handleChange(setMaxPages, v, t("batch.settings.maxPages.saved"))
            }
            options={translateOptions(PAGINATION_MAX_PAGES_OPTIONS, t)}
          />
        </div>
        <div className="flex-1">
          <CompactSelect
            label={
              compact
                ? t("batch.settings.pageDelay")
                : t("batch.settings.pageDelay.full")
            }
            value={pageDelay}
            onChange={(v) =>
              handleChange(setPageDelay, v, t("batch.settings.pageDelay.saved"))
            }
            options={translateOptions(PAGINATION_DELAY_OPTIONS, t)}
          />
        </div>
      </div>
    </div>
  )
}

export default BatchScrapeSettings
