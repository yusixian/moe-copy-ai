import { Icon } from "@iconify/react"
import { useStorage } from "@plasmohq/storage/hook"
import { useLayoutEffect, useState } from "react"
import { toast } from "react-toastify"

import { LOG_LEVELS, SCRAPE_TIMING_OPTIONS } from "~constants/options"
import type { ExtractionMode } from "~constants/types"
import { useAiSettings } from "~hooks/useAiSettings"
import { getExtractionMode, setExtractionMode } from "~utils/storage"
import { AccordionSection } from "../AccordionSection"
import { ModelSelectInput } from "../ai/ModelSelectInput"
import {
  BatchScrapeSettings,
  CompactSelect
} from "../batch/BatchScrapeSettings"

// 开关行组件（用于单选项设置）
function ToggleRow({
  icon,
  label,
  checked,
  onChange
}: {
  icon: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-sky-200 bg-white p-3">
      <span className="flex items-center gap-2 font-medium text-sky-700 text-sm">
        <Icon icon={icon} width={16} />
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-sky-500" : "bg-gray-300"
        }`}>
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  )
}

// 抓取模式设置
function ExtractionModeSettings() {
  const [mode, setMode] = useState<ExtractionMode>("hybrid")
  const [loading, setLoading] = useState(true)

  useLayoutEffect(() => {
    getExtractionMode().then((m) => {
      setMode(m || "hybrid")
      setLoading(false)
    })
  }, [])

  const handleChange = async (newMode: ExtractionMode) => {
    setMode(newMode)
    await setExtractionMode(newMode)
    toast.success("抓取模式已保存")
  }

  if (loading) return <div className="text-gray-400 text-xs">加载中...</div>

  const modes = [
    { value: "selector", label: "选择器", desc: "CSS选择器提取" },
    { value: "readability", label: "阅读", desc: "智能提取算法" },
    { value: "hybrid", label: "混合", desc: "自动选择最优" }
  ]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-1">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => handleChange(m.value as ExtractionMode)}
            className={`rounded-md px-2 py-1.5 text-center text-xs transition-all ${
              mode === m.value
                ? "bg-sky-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}>
            {m.label}
          </button>
        ))}
      </div>
      <p className="text-gray-500 text-xs">
        {modes.find((m) => m.value === mode)?.desc}
      </p>
    </div>
  )
}

// AI 设置
function AiSettings() {
  const {
    apiKey,
    setApiKey,
    baseURL,
    setBaseURL,
    systemPrompt,
    setSystemPrompt,
    model,
    setModel,
    modelList,
    isLoadingModels,
    fetchModels,
    saveSettings
  } = useAiSettings()

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-gray-600 text-xs">API Key</label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full rounded border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs focus:border-sky-400 focus:outline-none"
          placeholder="sk-..."
        />
      </div>

      <div>
        <label className="mb-1 block text-gray-600 text-xs">Base URL</label>
        <div className="flex gap-1">
          <input
            type="text"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
            className="flex-1 rounded border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs focus:border-sky-400 focus:outline-none"
            placeholder="https://api.openai.com/v1/"
          />
          <button
            onClick={() => fetchModels()}
            disabled={isLoadingModels}
            className="rounded bg-sky-100 px-2 py-1 text-sky-600 text-xs hover:bg-sky-200 disabled:opacity-50">
            <Icon
              icon={isLoadingModels ? "mdi:loading" : "mdi:refresh"}
              width={14}
              className={isLoadingModels ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-gray-600 text-xs">模型</label>
        <ModelSelectInput
          value={model}
          onChange={setModel}
          options={modelList}
          compact
        />
      </div>

      <div>
        <label className="mb-1 block text-gray-600 text-xs">系统提示词</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={3}
          className="w-full rounded border border-sky-200 bg-sky-50 px-2 py-1.5 text-xs focus:border-sky-400 focus:outline-none"
        />
      </div>

      <button
        onClick={saveSettings}
        className="flex w-full items-center justify-center gap-1 rounded bg-sky-500 py-1.5 font-medium text-white text-xs hover:bg-sky-600">
        <Icon icon="mdi:content-save" width={14} />
        保存
      </button>
    </div>
  )
}

// 日志设置
function LogSettings() {
  const [logLevel, setLogLevel] = useStorage("log_level", "silent")
  const [scrapeTiming, setScrapeTiming] = useStorage("scrape_timing", "manual")

  const handleLogLevelChange = (value: string) => {
    setLogLevel(value)
    toast.success("日志级别已保存")
  }

  const handleScrapeTimingChange = (value: string) => {
    setScrapeTiming(value)
    toast.success("抓取时机已保存")
  }

  return (
    <div className="space-y-3">
      <CompactSelect
        label="日志级别"
        value={logLevel}
        onChange={handleLogLevelChange}
        options={LOG_LEVELS.map((l) => ({
          value: l.value as string,
          label: l.label
        }))}
      />
      <CompactSelect
        label="抓取时机"
        value={scrapeTiming}
        onChange={handleScrapeTimingChange}
        options={SCRAPE_TIMING_OPTIONS}
      />
    </div>
  )
}

// 主设置组件
export default function SidePanelSettings() {
  const [showFloatButton, setShowFloatButton] = useStorage(
    "show_float_button",
    "true"
  )
  const [showDebugPanel, setShowDebugPanel] = useStorage(
    "show_debug_panel",
    "true"
  )

  const openFullSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  const handleFloatButtonChange = (checked: boolean) => {
    setShowFloatButton(checked ? "true" : "false")
    toast.success("悬浮球设置已保存")
  }

  const handleDebugPanelChange = (checked: boolean) => {
    setShowDebugPanel(checked ? "true" : "false")
    toast.success("调试面板设置已保存")
  }

  return (
    <div className="space-y-2">
      <AccordionSection title="抓取模式" icon="line-md:cog-loop" defaultOpen>
        <ExtractionModeSettings />
      </AccordionSection>

      <AccordionSection title="AI 设置" icon="mdi:robot" defaultOpen>
        <AiSettings />
      </AccordionSection>

      <AccordionSection title="日志设置" icon="mdi:file-document-outline">
        <LogSettings />
      </AccordionSection>

      <AccordionSection title="批量抓取" icon="mdi:file-document-multiple">
        <BatchScrapeSettings />
      </AccordionSection>

      <ToggleRow
        icon="mdi:palette-outline"
        label="悬浮球显示"
        checked={showFloatButton === "true"}
        onChange={handleFloatButtonChange}
      />

      <ToggleRow
        icon="mdi:code-tags"
        label="调试面板"
        checked={showDebugPanel === "true"}
        onChange={handleDebugPanelChange}
      />

      {/* 选择器设置 - 跳转到完整设置页 */}
      <button
        onClick={openFullSettings}
        className="flex w-full items-center justify-between rounded-lg border border-sky-200 bg-white p-3 text-left transition-colors hover:bg-sky-50">
        <span className="flex items-center gap-2 font-medium text-sky-700 text-sm">
          <Icon icon="mdi:code-braces" width={16} />
          选择器设置
        </span>
        <span className="flex items-center gap-1 text-gray-400 text-xs">
          打开完整设置
          <Icon icon="mdi:open-in-new" width={14} />
        </span>
      </button>
    </div>
  )
}
