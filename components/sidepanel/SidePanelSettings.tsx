import { Icon } from "@iconify/react"
import { useStorage } from "@plasmohq/storage/hook"
import { useLayoutEffect, useState } from "react"
import { toast } from "react-toastify"

import { Button } from "~/components/ui/button"
import { Collapsible } from "~/components/ui/collapsible"
import Segmented from "~/components/ui/segmented"
import { LOG_LEVELS, SCRAPE_TIMING_OPTIONS } from "~constants/options"
import type { ExtractionMode } from "~constants/types"
import { useAiSettings } from "~hooks/useAiSettings"
import {
  getTranslations,
  LOCALE_NAMES,
  type Locale,
  SUPPORTED_LOCALES,
  useI18n
} from "~utils/i18n"
import { translateOptions } from "~utils/options-helper"
import { getExtractionMode, setExtractionMode } from "~utils/storage"
import { ModelSelectInput } from "../ai/ModelSelectInput"
import {
  BatchScrapeSettings,
  CompactSelect
} from "../batch/BatchScrapeSettings"
import { ThemeSelect } from "../option/ThemeSelect"

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
    <div className="flex items-center justify-between rounded-xl border border-line-1 bg-content p-3">
      <span className="flex items-center gap-2 font-medium text-sm text-text-1">
        <Icon icon={icon} width={16} className="text-accent-blue" />
        {label}
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          checked ? "bg-accent-blue" : "bg-line-2"
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
  const { t } = useI18n()
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
    toast.success(t("sidepanel.settings.extractionMode.saved"))
  }

  if (loading)
    return (
      <div className="text-text-3 text-xs">
        {t("sidepanel.settings.extractionMode.loading")}
      </div>
    )

  const modes = [
    {
      value: "selector" as const,
      label: t("sidepanel.settings.extractionMode.selector"),
      desc: t("sidepanel.settings.extractionMode.selector.desc")
    },
    {
      value: "readability" as const,
      label: t("sidepanel.settings.extractionMode.readability"),
      desc: t("sidepanel.settings.extractionMode.readability.desc")
    },
    {
      value: "hybrid" as const,
      label: t("sidepanel.settings.extractionMode.hybrid"),
      desc: t("sidepanel.settings.extractionMode.hybrid.desc")
    }
  ]

  return (
    <div className="space-y-2">
      <Segmented
        id="extraction-mode"
        options={modes}
        value={mode}
        onChange={handleChange}
        className="w-full"
      />
      <p className="text-text-2 text-xs">
        {modes.find((m) => m.value === mode)?.desc}
      </p>
    </div>
  )
}

// AI 设置
function AiSettings() {
  const { t } = useI18n()
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
        <label htmlFor="sp-api-key" className="mb-1 block text-text-1 text-xs">
          {t("sidepanel.settings.ai.apiKey")}
        </label>
        <input
          id="sp-api-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full rounded border border-line-1 bg-content px-2 py-1.5 text-xs focus:border-accent-blue focus:outline-none"
          placeholder={t("sidepanel.settings.ai.apiKeyPlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="sp-base-url" className="mb-1 block text-text-1 text-xs">
          {t("sidepanel.settings.ai.baseUrl")}
        </label>
        <div className="flex gap-1">
          <input
            id="sp-base-url"
            type="text"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
            className="flex-1 rounded border border-line-1 bg-content px-2 py-1.5 text-xs focus:border-accent-blue focus:outline-none"
            placeholder={t("sidepanel.settings.ai.baseUrlPlaceholder")}
          />
          <Button
            variant="secondary"
            size="icon"
            onClick={() => fetchModels()}
            disabled={isLoadingModels}
            className="h-7 w-7">
            <Icon
              icon={isLoadingModels ? "mdi:loading" : "mdi:refresh"}
              width={14}
              className={isLoadingModels ? "animate-spin" : ""}
            />
          </Button>
        </div>
      </div>

      <div>
        <label htmlFor="sp-model" className="mb-1 block text-text-1 text-xs">
          {t("sidepanel.settings.ai.model")}
        </label>
        <ModelSelectInput
          id="sp-model"
          value={model}
          onChange={setModel}
          options={modelList}
          compact
        />
      </div>

      <div>
        <label
          htmlFor="sp-system-prompt"
          className="mb-1 block text-text-1 text-xs">
          {t("sidepanel.settings.ai.systemPrompt")}
        </label>
        <textarea
          id="sp-system-prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={3}
          className="w-full rounded border border-line-1 bg-content px-2 py-1.5 text-xs focus:border-accent-blue focus:outline-none"
        />
      </div>

      <Button fullWidth size="sm" onClick={saveSettings}>
        <Icon icon="mdi:content-save" width={14} className="mr-1" />
        {t("sidepanel.settings.ai.save")}
      </Button>
    </div>
  )
}

// 日志设置
function LogSettings() {
  const { t } = useI18n()
  const [logLevel, setLogLevel] = useStorage("log_level", "silent")
  const [scrapeTiming, setScrapeTiming] = useStorage("scrape_timing", "manual")

  const handleLogLevelChange = (value: string) => {
    setLogLevel(value)
    toast.success(t("sidepanel.settings.log.levelSaved"))
  }

  const handleScrapeTimingChange = (value: string) => {
    setScrapeTiming(value)
    toast.success(t("sidepanel.settings.log.timingSaved"))
  }

  return (
    <div className="space-y-3">
      <CompactSelect
        label={t("sidepanel.settings.log.level")}
        value={logLevel}
        onChange={handleLogLevelChange}
        options={translateOptions(
          LOG_LEVELS as Array<{ value: string; labelKey: string }>,
          t
        )}
      />
      <CompactSelect
        label={t("sidepanel.settings.log.timing")}
        value={scrapeTiming}
        onChange={handleScrapeTimingChange}
        options={translateOptions(SCRAPE_TIMING_OPTIONS, t)}
      />
    </div>
  )
}

// 语言设置
function LanguageSettings() {
  const { t, locale, setLocale } = useI18n()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value as Locale
    setLocale(newLocale)
    const msg = getTranslations(newLocale)["common.success"] ?? "Success"
    toast.success(msg)
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-line-1 bg-content p-3">
      <span className="flex items-center gap-2 font-medium text-sm text-text-1">
        <Icon icon="mdi:globe" width={16} className="text-accent-blue" />
        {t("option.interface.language")}
      </span>
      <select
        value={locale}
        onChange={handleChange}
        className="rounded border border-line-1 bg-content px-2 py-1 text-sm focus:border-accent-blue focus:outline-none">
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_NAMES[loc]}
          </option>
        ))}
      </select>
    </div>
  )
}

// 主设置组件
export default function SidePanelSettings() {
  const { t } = useI18n()
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
    toast.success(t("sidepanel.settings.floatButton.saved"))
  }

  const handleDebugPanelChange = (checked: boolean) => {
    setShowDebugPanel(checked ? "true" : "false")
    toast.success(t("sidepanel.settings.debugPanel.saved"))
  }

  return (
    <div className="space-y-2">
      <Collapsible
        title={t("sidepanel.settings.extractionMode.title")}
        icon={<Icon icon="line-md:cog-loop" width={16} />}
        defaultExpanded>
        <ExtractionModeSettings />
      </Collapsible>

      <Collapsible
        title={t("sidepanel.settings.ai.title")}
        icon={<Icon icon="mdi:robot" width={16} />}
        defaultExpanded>
        <AiSettings />
      </Collapsible>

      <Collapsible
        title={t("sidepanel.settings.log.title")}
        icon={<Icon icon="mdi:file-document-outline" width={16} />}>
        <LogSettings />
      </Collapsible>

      <Collapsible
        title={t("sidepanel.settings.batch.title")}
        icon={<Icon icon="mdi:file-document-multiple" width={16} />}>
        <BatchScrapeSettings />
      </Collapsible>

      <ThemeSelect variant="inline" showDescription={false} />

      <LanguageSettings />

      <ToggleRow
        icon="mdi:palette-outline"
        label={t("sidepanel.settings.floatButton.label")}
        checked={showFloatButton === "true"}
        onChange={handleFloatButtonChange}
      />

      <ToggleRow
        icon="mdi:code-tags"
        label={t("sidepanel.settings.debugPanel.label")}
        checked={showDebugPanel === "true"}
        onChange={handleDebugPanelChange}
      />

      {/* 选择器设置 - 跳转到完整设置页 */}
      <Button
        variant="outline"
        fullWidth
        onClick={openFullSettings}
        className="justify-between rounded-xl p-3">
        <span className="flex items-center gap-2 font-medium text-sm text-text-1">
          <Icon
            icon="mdi:code-braces"
            width={16}
            className="text-accent-blue"
          />
          {t("sidepanel.settings.selector.title")}
        </span>
        <span className="flex items-center gap-1 text-text-2 text-xs">
          {t("sidepanel.settings.selector.openFull")}
          <Icon icon="mdi:open-in-new" width={14} />
        </span>
      </Button>
    </div>
  )
}
