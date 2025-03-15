import React from "react"

import { LOG_LEVELS, SCRAPE_TIMING_OPTIONS } from "../../constants/options"
import OptionSection from "./OptionSection"
import OptionSelect from "./OptionSelect"

export const LogSettingsSection: React.FC = () => {
  return (
    <OptionSection title="日志设置" icon="line-md:cog-filled-loop">
      <OptionSelect
        id="logLevel"
        label="日志级别"
        options={LOG_LEVELS}
        storageKey="log_level"
        defaultValue="silent"
        description="设置插件的日志记录级别。较低级别的日志会包含更多详细信息，但可能会影响性能。"
      />

      <OptionSelect
        id="scrapeTiming"
        label="抓取时机"
        options={SCRAPE_TIMING_OPTIONS}
        storageKey="scrape_timing"
        defaultValue="manual"
        description="设置何时执行网页内容抓取。自动模式将在页面加载后立即抓取，手动模式则只在用户明确请求时抓取。"
      />

      <div className="mt-6 rounded-lg border border-sky-200 bg-blue-50 p-4">
        <h3 className="mb-2 flex items-center text-lg font-medium text-sky-600">
          <span className="mr-2">📝</span>日志级别说明
        </h3>
        <ul className="space-y-2 text-sm text-sky-600">
          <li className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-pink-400"></span>
            <span className="font-semibold">跟踪 (Trace):</span>{" "}
            <span className="ml-2">最详细的日志级别，包含所有操作的细节</span>
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
    </OptionSection>
  )
}

export default LogSettingsSection
