import type { LevelWithSilentOrString } from "pino"
import { useCallback } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import "./styles/global.css"

import { Icon } from "@iconify/react"
import { toast, ToastContainer } from "react-toastify"

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

// 定义调试面板开关选项
const DEBUG_PANEL_OPTIONS = [
  { value: "true", label: "显示" },
  { value: "false", label: "隐藏" }
]

// 定义悬浮窗显示选项
const FLOAT_BUTTON_OPTIONS = [
  { value: "true", label: "显示" },
  { value: "false", label: "隐藏" }
]

function OptionsPage() {
  // 使用storage hook获取/设置日志级别
  const [logLevel, setLogLevel] = useStorage<string>("log_level", "silent")
  // 添加新的hook用于获取/设置抓取时机
  const [scrapeTiming, setScrapeTiming] = useStorage<string>(
    "scrape_timing",
    "manual"
  )
  // 添加新的hook用于获取/设置调试面板显示状态，默认为显示
  const [showDebugPanel, setShowDebugPanel] = useStorage<string>(
    "show_debug_panel",
    "true"
  )
  // 添加新的hook用于获取/设置网页内悬浮窗显示状态，默认为显示
  const [showFloatButton, setShowFloatButton] = useStorage<string>(
    "show_float_button",
    "true"
  )

  // 处理日志级别变更
  const handleLogLevelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setLogLevel(e.target.value)
      toast.success("设置已保存！")
    },
    [setLogLevel]
  )

  // 处理抓取时机变更
  const handleScrapeTimingChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setScrapeTiming(e.target.value)
      toast.success("设置已保存！")
    },
    [setScrapeTiming]
  )

  // 处理调试面板显示状态变更
  const handleDebugPanelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setShowDebugPanel(e.target.value)
      toast.success("设置已保存！")
    },
    [setShowDebugPanel]
  )

  // 处理悬浮窗显示状态变更
  const handleFloatButtonChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setShowFloatButton(e.target.value)
      toast.success("设置已保存！")
    },
    [setShowFloatButton]
  )

  // 打开GitHub仓库
  const handleOpenGithub = useCallback(() => {
    window.open("https://github.com/yusixian/moe-copy-ai", "_blank")
  }, [])

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 flex items-center justify-between rounded-xl border-2 border-sky-200 bg-white p-4 shadow-md">
          <div>
            <h1 className="flex items-center text-2xl font-bold text-sky-600">
              Moe Copy AI <span className="ml-2">✨</span> 萌抓
            </h1>
            <p className="text-sm text-indigo-600">
              配置你的小助手，让它更好地为你服务 (。・ω・。)
            </p>
          </div>

          <button
            onClick={handleOpenGithub}
            className="transform rounded-full p-2 text-sky-500 transition hover:rotate-12 hover:bg-blue-50"
            title="访问GitHub">
            <Icon icon="mdi:github" width="24" height="24" />
          </button>
        </header>

        <div className="mb-6 rounded-xl border-2 border-sky-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-sky-600">
            <Icon icon="line-md:cog-filled-loop" className="mr-2" />
            日志设置
          </h2>

          <div className="mb-4">
            <label
              className="mb-2 block font-medium text-sky-600"
              htmlFor="logLevel">
              日志级别
            </label>
            <select
              id="logLevel"
              value={logLevel}
              onChange={handleLogLevelChange}
              className="w-full rounded-lg border border-sky-200 bg-blue-50 p-2.5 focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
              {LOG_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-sky-500">
              设置插件的日志记录级别。较低级别的日志会包含更多详细信息，但可能会影响性能。
            </p>
          </div>

          <div className="mb-4">
            <label
              className="mb-2 block font-medium text-sky-600"
              htmlFor="scrapeTiming">
              抓取时机
            </label>
            <select
              id="scrapeTiming"
              value={scrapeTiming}
              onChange={handleScrapeTimingChange}
              className="w-full rounded-lg border border-sky-200 bg-blue-50 p-2.5 focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
              {SCRAPE_TIMING_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-sky-500">
              设置何时执行网页内容抓取。自动模式将在页面加载后立即抓取，手动模式则只在用户明确请求时抓取。
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-sky-200 bg-blue-50 p-4">
            <h3 className="mb-2 flex items-center text-lg font-medium text-sky-600">
              <span className="mr-2">📝</span>日志级别说明
            </h3>
            <ul className="space-y-2 text-sm text-sky-600">
              <li className="flex items-center">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-pink-400"></span>
                <span className="font-semibold">跟踪 (Trace):</span>{" "}
                <span className="ml-2">
                  最详细的日志级别，包含所有操作的细节
                </span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-400"></span>
                <span className="font-semibold">调试 (Debug):</span>{" "}
                <span className="ml-2">调试信息，开发环境推荐使用</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="font-semibold">信息 (Info):</span>{" "}
                <span className="ml-2">一般信息性消息</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-yellow-400"></span>
                <span className="font-semibold">警告 (Warn):</span>{" "}
                <span className="ml-2">潜在问题的警告</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-400"></span>
                <span className="font-semibold">错误 (Error):</span>{" "}
                <span className="ml-2">错误信息，不影响主要功能</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red-400"></span>
                <span className="font-semibold">致命 (Fatal):</span>{" "}
                <span className="ml-2">严重错误，影响核心功能</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gray-400"></span>
                <span className="font-semibold">静默 (Silent):</span>{" "}
                <span className="ml-2">不记录任何日志</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-6 rounded-xl border-2 border-sky-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-sky-600">
            <Icon icon="line-md:cog-filled-loop" className="mr-2" />
            界面设置
          </h2>

          <div className="mb-4">
            <label
              className="mb-2 block font-medium text-sky-600"
              htmlFor="floatButton">
              网页内悬浮窗
            </label>
            <select
              id="floatButton"
              value={showFloatButton}
              onChange={handleFloatButtonChange}
              className="w-full rounded-lg border border-sky-200 bg-blue-50 p-2.5 focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
              {FLOAT_BUTTON_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-sky-500">
              控制是否在网页中显示悬浮球。关闭后将不会在浏览的网页中显示悬浮窗，您仍可以通过浏览器扩展图标使用功能
              (=^･ω･^=)
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border-2 border-sky-200 bg-white p-6 shadow-md">
          <h2 className="mb-4 flex items-center text-xl font-semibold text-sky-600">
            <Icon
              icon="line-md:coffee-half-empty-filled-loop"
              className="mr-2"
            />
            开发者选项
          </h2>

          <div className="mb-4">
            <label
              className="mb-2 block font-medium text-sky-600"
              htmlFor="debugPanel">
              调试面板
            </label>
            <select
              id="debugPanel"
              value={showDebugPanel}
              onChange={handleDebugPanelChange}
              className="w-full rounded-lg border border-sky-200 bg-blue-50 p-2.5 focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
              {DEBUG_PANEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-sky-500">
              控制是否显示调试面板。调试面板提供了额外的技术信息，主要用于开发和故障排除。(◕ᴗ◕✿)
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-block rounded-full border border-sky-200 bg-sky-100 px-4 py-2">
            <p className="text-sm text-sky-600">
              Moe Copy AI<span className="ml-2">✨</span> 萌抓 ©
              <span>{` ${new Date().getFullYear()} `}</span>
              <Icon
                icon="line-md:heart-twotone"
                className="-mt-1 inline text-pink-500"
              />
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default OptionsPage
