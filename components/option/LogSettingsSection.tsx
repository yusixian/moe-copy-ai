import type React from "react"

import { LOG_LEVELS, SCRAPE_TIMING_OPTIONS } from "../../constants/options"
import OptionSection from "./OptionSection"
import OptionSelect from "./OptionSelect"

export const LogSettingsSection: React.FC = () => {
  return (
    <OptionSection title="日志设置" icon="line-md:cog">
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
        <h3 className="mb-2 flex items-center font-medium text-lg text-sky-600">
          <span className="mr-2">📝</span>日志级别说明
        </h3>
        <ul className="space-y-2 text-sky-600 text-sm">
          <li className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-400"></span>
            <span className="font-semibold">调试 (Debug):</span>{" "}
            <span className="ml-2">
              详细的调试信息，包含抓取过程和AI交互细节
            </span>
          </li>
          <li className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
            <span className="font-semibold">信息 (Info):</span>{" "}
            <span className="ml-2">一般信息性消息，如操作状态和成功提示</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-400"></span>
            <span className="font-semibold">错误 (Error):</span>{" "}
            <span className="ml-2">错误信息，如抓取失败</span>
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
