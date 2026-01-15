import { Icon } from "@iconify/react"
import { memo, useEffect, useMemo, useRef, useState } from "react"

import { Button } from "~/components/ui/button"
import {
  type FilterMode,
  type FilterTarget,
  LINK_FILTER_PRESETS,
  type PresetFilter
} from "~constants/link-filter-presets"
import type { ExtractedLink } from "~constants/types"
import { cn } from "~utils"
import { useI18n } from "~utils/i18n"

import Segmented, { type SegmentedOption } from "../ui/segmented"

interface LinkFilterBarProps {
  links: ExtractedLink[]
  filteredLinks: ExtractedLink[]
  pattern: string
  target: FilterTarget
  mode: FilterMode
  isValid: boolean
  error: string | null
  onPatternChange: (pattern: string) => void
  onTargetChange: (target: FilterTarget) => void
  onModeChange: (mode: FilterMode) => void
  onApplyPreset: (preset: PresetFilter) => void
  onClear: () => void
}

const LinkFilterBar = memo(function LinkFilterBar({
  links,
  filteredLinks,
  pattern,
  target,
  mode,
  isValid,
  error,
  onPatternChange,
  onTargetChange,
  onModeChange,
  onApplyPreset,
  onClear
}: LinkFilterBarProps) {
  const { t } = useI18n()
  const [isPresetOpen, setIsPresetOpen] = useState(false)
  const presetRef = useRef<HTMLDivElement>(null)

  // Create options with translations
  const targetOptions = useMemo<SegmentedOption<FilterTarget>[]>(
    () => [
      { value: "url", label: t("batch.filter.target.url") },
      { value: "text", label: t("batch.filter.target.text") },
      { value: "both", label: t("batch.filter.target.both") }
    ],
    [t]
  )

  const modeOptions = useMemo<SegmentedOption<FilterMode>[]>(
    () => [
      { value: "exclude", label: t("batch.filter.mode.exclude") },
      { value: "include", label: t("batch.filter.mode.include") }
    ],
    [t]
  )

  // 点击外部关闭预设菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (presetRef.current && !presetRef.current.contains(e.target as Node)) {
        setIsPresetOpen(false)
      }
    }
    if (isPresetOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isPresetOpen])

  const filteredCount = links.length - filteredLinks.length
  const hasFilter = pattern.trim().length > 0

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
      {/* 第一行：输入框和预设 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Icon
            icon="mdi:regex"
            className={cn(
              "absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2",
              !isValid ? "text-red-400" : "text-gray-400"
            )}
          />
          <input
            type="text"
            value={pattern}
            onChange={(e) => onPatternChange(e.target.value)}
            placeholder={t("batch.filter.placeholder")}
            className={cn(
              "w-full rounded-md border py-1.5 pr-8 pl-8 text-sm transition-colors focus:outline-none focus:ring-1",
              !isValid
                ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-400"
                : "border-gray-300 bg-white focus:border-sky-400 focus:ring-sky-400"
            )}
          />
          {hasFilter && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClear}
              className="absolute top-1/2 right-2 h-5 w-5 -translate-y-1/2"
              title={t("batch.filter.clear")}>
              <Icon icon="mdi:close" className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* 预设按钮 */}
        <div className="relative" ref={presetRef}>
          <Button
            variant={isPresetOpen ? "secondary" : "outline"}
            size="sm"
            onClick={() => setIsPresetOpen(!isPresetOpen)}>
            <Icon icon="mdi:lightning-bolt" className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">
              {t("batch.filter.preset")}
            </span>
            <Icon
              icon="mdi:chevron-down"
              className={cn(
                "ml-1 h-4 w-4 transition-transform",
                isPresetOpen && "rotate-180"
              )}
            />
          </Button>

          {/* 预设下拉菜单 */}
          {isPresetOpen && (
            <div className="absolute top-full right-0 z-10 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {LINK_FILTER_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => {
                    onApplyPreset(preset)
                    setIsPresetOpen(false)
                  }}
                  className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left transition-colors hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-medium text-[10px]",
                        preset.mode === "exclude"
                          ? "bg-red-100 text-red-600"
                          : "bg-emerald-100 text-emerald-600"
                      )}>
                      {preset.mode === "exclude"
                        ? t("batch.filter.mode.exclude")
                        : t("batch.filter.mode.include")}
                    </span>
                    <span className="font-medium text-gray-700 text-sm">
                      {t(preset.nameKey)}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">
                    {t(preset.descKey)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 第二行：选项和统计 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Segmented
            id="filter-target"
            options={targetOptions}
            value={target}
            onChange={onTargetChange}
            className="text-[11px]"
            itemClass="px-2 py-1"
          />
          <Segmented
            id="filter-mode"
            options={modeOptions}
            value={mode}
            onChange={onModeChange}
            className="text-[11px]"
            itemClass="px-2 py-1"
            indicateClass={mode === "exclude" ? "bg-red-50" : "bg-emerald-50"}
          />
        </div>

        {/* 过滤统计 */}
        {hasFilter && (
          <div className="flex items-center gap-1.5 text-xs">
            {isValid ? (
              <>
                <Icon
                  icon={filteredCount > 0 ? "mdi:filter" : "mdi:filter-off"}
                  className={cn(
                    "h-3.5 w-3.5",
                    filteredCount > 0 ? "text-sky-500" : "text-gray-400"
                  )}
                />
                <span className="text-gray-500">
                  {mode === "exclude"
                    ? t("batch.filter.stats.excluded")
                    : t("batch.filter.stats.included")}{" "}
                  <span
                    className={cn(
                      "font-medium",
                      filteredCount > 0 ? "text-sky-600" : "text-gray-600"
                    )}>
                    {mode === "exclude" ? filteredCount : filteredLinks.length}
                  </span>
                  /{links.length} {t("batch.filter.stats.items")}
                </span>
              </>
            ) : (
              <span className="text-red-500">
                <Icon
                  icon="mdi:alert-circle"
                  className="mr-1 inline h-3.5 w-3.5"
                />
                {error || t("batch.filter.error.invalid")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
})

export default LinkFilterBar
