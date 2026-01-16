import type { LevelWithSilentOrString } from "pino"

// 定义日志级别选项
export const LOG_LEVELS: {
  value: LevelWithSilentOrString
  labelKey: string
}[] = [
  {
    value: "debug",
    labelKey: "settings.log.level.debug"
  },
  { value: "info", labelKey: "settings.log.level.info" },
  {
    value: "error",
    labelKey: "settings.log.level.error"
  },
  {
    value: "silent",
    labelKey: "settings.log.level.silent"
  }
]

// 定义抓取时机选项
export const SCRAPE_TIMING_OPTIONS = [
  {
    value: "auto",
    labelKey: "settings.scrapeTiming.auto"
  },
  {
    value: "manual",
    labelKey: "settings.scrapeTiming.manual"
  }
]

// 定义调试面板开关选项
export const DEBUG_PANEL_OPTIONS = [
  { value: "true", labelKey: "settings.debugPanel.show" },
  { value: "false", labelKey: "settings.debugPanel.hide" }
]

// 定义悬浮窗显示选项
export const FLOAT_BUTTON_OPTIONS = [
  { value: "true", labelKey: "settings.floatButton.show" },
  { value: "false", labelKey: "settings.floatButton.hide" }
]

// 批量抓取 - 并发数量
export const BATCH_CONCURRENCY_OPTIONS = [
  {
    value: "1",
    labelKey: "batch.settings.concurrency.option.1"
  },
  {
    value: "2",
    labelKey: "batch.settings.concurrency.option.2"
  },
  { value: "3", labelKey: "batch.settings.concurrency.option.3" },
  { value: "5", labelKey: "batch.settings.concurrency.option.5" },
  {
    value: "10",
    labelKey: "batch.settings.concurrency.option.10"
  }
]

// 批量抓取 - 批次延迟
export const BATCH_DELAY_OPTIONS = [
  { value: "0", labelKey: "batch.settings.delay.option.0" },
  { value: "200", labelKey: "batch.settings.delay.option.200" },
  {
    value: "500",
    labelKey: "batch.settings.delay.option.500"
  },
  {
    value: "1000",
    labelKey: "batch.settings.delay.option.1000"
  },
  {
    value: "2000",
    labelKey: "batch.settings.delay.option.2000"
  }
]

// 批量抓取 - 超时时间
export const BATCH_TIMEOUT_OPTIONS = [
  {
    value: "10000",
    labelKey: "batch.settings.timeout.option.10000"
  },
  {
    value: "30000",
    labelKey: "batch.settings.timeout.option.30000"
  },
  {
    value: "60000",
    labelKey: "batch.settings.timeout.option.60000"
  },
  {
    value: "120000",
    labelKey: "batch.settings.timeout.option.120000"
  }
]

// 批量抓取 - 重试次数
export const BATCH_RETRY_OPTIONS = [
  { value: "0", labelKey: "batch.settings.retry.option.0" },
  {
    value: "1",
    labelKey: "batch.settings.retry.option.1"
  },
  { value: "2", labelKey: "batch.settings.retry.option.2" },
  { value: "3", labelKey: "batch.settings.retry.option.3" }
]

// 批量抓取 - 抓取策略
export const BATCH_STRATEGY_OPTIONS = [
  {
    value: "fetch",
    labelKey: "batch.settings.strategy.fetch",
    descKey: "batch.settings.strategy.fetch.desc"
  },
  {
    value: "background-tabs",
    labelKey: "batch.settings.strategy.backgroundTabs",
    descKey: "batch.settings.strategy.backgroundTabs.desc"
  },
  {
    value: "current-tab",
    labelKey: "batch.settings.strategy.currentTab",
    descKey: "batch.settings.strategy.currentTab.desc"
  }
] as const

// 分页抓取 - 最大页数
export const PAGINATION_MAX_PAGES_OPTIONS = [
  { value: "3", labelKey: "batch.settings.maxPages.option.3" },
  { value: "5", labelKey: "batch.settings.maxPages.option.5" },
  {
    value: "10",
    labelKey: "batch.settings.maxPages.option.10"
  },
  {
    value: "20",
    labelKey: "batch.settings.maxPages.option.20"
  },
  { value: "0", labelKey: "batch.settings.maxPages.option.0" }
]

// 分页抓取 - 页面间延迟
export const PAGINATION_DELAY_OPTIONS = [
  {
    value: "1000",
    labelKey: "batch.settings.pageDelay.option.1000"
  },
  {
    value: "2000",
    labelKey: "batch.settings.pageDelay.option.2000"
  },
  {
    value: "3000",
    labelKey: "batch.settings.pageDelay.option.3000"
  },
  {
    value: "5000",
    labelKey: "batch.settings.pageDelay.option.5000"
  }
]
