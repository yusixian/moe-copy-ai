import type { LevelWithSilentOrString } from "pino"
import { useState } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import "./styles/global.css"

// 定义日志级别选项
const LOG_LEVELS: { value: LevelWithSilentOrString; label: string }[] = [
  { value: "trace", label: "跟踪 (Trace)" },
  { value: "debug", label: "调试 (Debug)" },
  { value: "info", label: "信息 (Info)" },
  { value: "warn", label: "警告 (Warn)" },
  { value: "error", label: "错误 (Error)" },
  { value: "fatal", label: "致命 (Fatal)" },
  { value: "silent", label: "静默 (Silent)" }
]

// 定义抓取时机选项
const SCRAPE_TIMING_OPTIONS = [
  { value: "auto", label: "页面加载完成后自动抓取" },
  { value: "manual", label: "仅在用户手动触发时抓取" }
]

function OptionsPage() {
  // 使用storage hook获取/设置日志级别
  const [logLevel, setLogLevel] = useStorage<string>("log_level", "debug")
  // 添加新的hook用于获取/设置抓取时机
  const [scrapeTiming, setScrapeTiming] = useStorage<string>(
    "scrape_timing",
    "auto"
  )
  const [saved, setSaved] = useState(false)

  // 处理日志级别变更
  const handleLogLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLogLevel(e.target.value)
    setSaved(true)

    // 3秒后清除保存提示
    setTimeout(() => {
      setSaved(false)
    }, 3000)
  }

  // 处理抓取时机变更
  const handleScrapeTimingChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setScrapeTiming(e.target.value)
    setSaved(true)

    // 3秒后清除保存提示
    setTimeout(() => {
      setSaved(false)
    }, 3000)
  }

  return (
    <div className="bg-white min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">网页内容抓取器选项</h1>
        <p className="text-sm text-gray-600 mt-2">配置插件的行为和功能</p>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-50 p-6 rounded border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">日志设置</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="logLevel">
              日志级别
            </label>
            <select
              id="logLevel"
              value={logLevel}
              onChange={handleLogLevelChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {LOG_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              设置插件的日志记录级别。较低级别的日志会包含更多详细信息，但可能会影响性能。
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="scrapeTiming">
              抓取时机
            </label>
            <select
              id="scrapeTiming"
              value={scrapeTiming}
              onChange={handleScrapeTimingChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              {SCRAPE_TIMING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500">
              设置何时执行网页内容抓取。自动模式将在页面加载后立即抓取，手动模式则只在用户明确请求时抓取。
            </p>
          </div>

          {saved && (
            <div className="p-3 bg-green-100 text-green-700 rounded border border-green-200 mb-4">
              设置已保存！
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">日志级别说明</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <span className="font-semibold">跟踪 (Trace):</span>{" "}
                最详细的日志级别，包含所有操作的细节
              </li>
              <li>
                <span className="font-semibold">调试 (Debug):</span>{" "}
                调试信息，开发环境推荐使用
              </li>
              <li>
                <span className="font-semibold">信息 (Info):</span>{" "}
                一般信息性消息
              </li>
              <li>
                <span className="font-semibold">警告 (Warn):</span>{" "}
                潜在问题的警告
              </li>
              <li>
                <span className="font-semibold">错误 (Error):</span>{" "}
                错误信息，不影响主要功能
              </li>
              <li>
                <span className="font-semibold">致命 (Fatal):</span>{" "}
                严重错误，影响核心功能
              </li>
              <li>
                <span className="font-semibold">静默 (Silent):</span>{" "}
                不记录任何日志
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>网页内容抓取器 © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}

export default OptionsPage
