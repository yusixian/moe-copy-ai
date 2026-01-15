import type { LevelWithSilentOrString } from "pino"

// 定义日志级别选项
export const LOG_LEVELS: { value: LevelWithSilentOrString; label: string }[] = [
  { value: "debug", label: "调试 (Debug)" },
  { value: "info", label: "信息 (Info)" },
  { value: "error", label: "错误 (Error)" },
  { value: "silent", label: "静默 (Silent)" }
]

// 定义抓取时机选项
export const SCRAPE_TIMING_OPTIONS = [
  { value: "auto", label: "页面加载完成后自动抓取" },
  { value: "manual", label: "仅在用户手动触发时抓取" }
]

// 定义调试面板开关选项
export const DEBUG_PANEL_OPTIONS = [
  { value: "true", label: "显示" },
  { value: "false", label: "隐藏" }
]

// 定义悬浮窗显示选项
export const FLOAT_BUTTON_OPTIONS = [
  { value: "true", label: "显示" },
  { value: "false", label: "隐藏" }
]

// 批量抓取 - 并发数量
export const BATCH_CONCURRENCY_OPTIONS = [
  { value: "1", label: "1 (最慢)" },
  { value: "2", label: "2 (默认)" },
  { value: "3", label: "3" },
  { value: "5", label: "5" },
  { value: "10", label: "10 (最快)" }
]

// 批量抓取 - 批次延迟
export const BATCH_DELAY_OPTIONS = [
  { value: "0", label: "无延迟" },
  { value: "200", label: "200ms" },
  { value: "500", label: "500ms (默认)" },
  { value: "1000", label: "1秒" },
  { value: "2000", label: "2秒" }
]

// 批量抓取 - 超时时间
export const BATCH_TIMEOUT_OPTIONS = [
  { value: "10000", label: "10秒" },
  { value: "30000", label: "30秒 (默认)" },
  { value: "60000", label: "60秒" },
  { value: "120000", label: "2分钟" }
]

// 批量抓取 - 重试次数
export const BATCH_RETRY_OPTIONS = [
  { value: "0", label: "不重试" },
  { value: "1", label: "1次 (默认)" },
  { value: "2", label: "2次" },
  { value: "3", label: "3次" }
]

// 批量抓取 - 抓取策略
export const BATCH_STRATEGY_OPTIONS = [
  {
    value: "fetch",
    label: "Fetch API",
    labelKey: "batch.settings.strategy.fetch",
    descKey: "batch.settings.strategy.fetch.desc"
  },
  {
    value: "background-tabs",
    label: "后台标签页",
    labelKey: "batch.settings.strategy.backgroundTabs",
    descKey: "batch.settings.strategy.backgroundTabs.desc"
  },
  {
    value: "current-tab",
    label: "当前标签页",
    labelKey: "batch.settings.strategy.currentTab",
    descKey: "batch.settings.strategy.currentTab.desc"
  }
] as const

// 分页抓取 - 最大页数
export const PAGINATION_MAX_PAGES_OPTIONS = [
  { value: "3", label: "3 页" },
  { value: "5", label: "5 页" },
  { value: "10", label: "10 页" },
  { value: "20", label: "20 页" },
  { value: "0", label: "无限制" }
]

// 分页抓取 - 页面间延迟
export const PAGINATION_DELAY_OPTIONS = [
  { value: "1000", label: "1 秒" },
  { value: "2000", label: "2 秒" },
  { value: "3000", label: "3 秒" },
  { value: "5000", label: "5 秒" }
]
