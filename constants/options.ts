import type { LevelWithSilentOrString } from "pino"

// 定义日志级别选项
export const LOG_LEVELS: { value: LevelWithSilentOrString; label: string }[] = [
  { value: "trace", label: "跟踪 (Trace)" },
  { value: "debug", label: "调试 (Debug)" },
  { value: "info", label: "信息 (Info)" },
  { value: "warn", label: "警告 (Warn)" },
  { value: "error", label: "错误 (Error)" },
  { value: "fatal", label: "致命 (Fatal)" },
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
