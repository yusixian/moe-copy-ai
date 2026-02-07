import { Icon } from "@iconify/react"
import { useCallback, useMemo, useState } from "react"

import type { PromptTemplate } from "~constants/types"
import { useI18n } from "~utils/i18n"

import { FloatingDropdown } from "../ui/FloatingDropdown"

interface PromptTemplateSelectorProps {
  templates: PromptTemplate[]
  onSelect: (template: PromptTemplate) => void
  onSaveAsCurrent?: () => void
  disabled?: boolean
  enablePortal?: boolean
}

export function PromptTemplateSelector({
  templates,
  onSelect,
  onSaveAsCurrent,
  disabled = false,
  enablePortal = true
}: PromptTemplateSelectorProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)

  const presets = useMemo(
    () => templates.filter((tpl) => tpl.isPreset),
    [templates]
  )
  const custom = useMemo(
    () => templates.filter((tpl) => !tpl.isPreset),
    [templates]
  )

  const handleSelect = useCallback(
    (tpl: PromptTemplate) => {
      onSelect(tpl)
      setOpen(false)
    },
    [onSelect]
  )

  const handleSaveAsCurrent = useCallback(() => {
    onSaveAsCurrent?.()
    setOpen(false)
  }, [onSaveAsCurrent])

  const dropdownContent = (
    <div className="max-h-64 w-56 overflow-auto rounded-lg border border-line-1 bg-elevated-solid-1 shadow-lg">
      {/* Presets */}
      <div className="px-2 pt-2 pb-1 text-text-3 text-xs">
        {t("promptTemplate.selector.preset")}
      </div>
      {presets.map((tpl) => (
        <button
          key={tpl.id}
          type="button"
          onClick={() => handleSelect(tpl)}
          className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-accent-blue-ghost-hover"
          title={tpl.description}>
          {tpl.icon && (
            <Icon icon={tpl.icon} width={14} className="shrink-0 text-text-3" />
          )}
          <span className="truncate text-text-1">{tpl.name}</span>
        </button>
      ))}

      {/* Divider */}
      <div className="mx-2 border-line-1 border-t" />

      {/* Custom */}
      <div className="px-2 pt-2 pb-1 text-text-3 text-xs">
        {t("promptTemplate.selector.custom")}
      </div>
      {custom.length > 0 ? (
        custom.map((tpl) => (
          <button
            key={tpl.id}
            type="button"
            onClick={() => handleSelect(tpl)}
            className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs hover:bg-accent-blue-ghost-hover">
            <Icon
              icon="mdi:file-document-outline"
              width={14}
              className="shrink-0 text-text-3"
            />
            <span className="truncate text-text-1">{tpl.name}</span>
          </button>
        ))
      ) : (
        <div className="px-2 py-1.5 text-text-4 text-xs">
          {t("promptTemplate.selector.empty")}
        </div>
      )}

      {/* Save current as template */}
      {onSaveAsCurrent && (
        <>
          <div className="mx-2 border-line-1 border-t" />
          <button
            type="button"
            onClick={handleSaveAsCurrent}
            className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-accent-blue text-xs hover:bg-accent-blue-ghost-hover">
            <Icon
              icon="mdi:content-save-plus-outline"
              width={14}
              className="shrink-0"
            />
            <span>{t("promptTemplate.selector.saveAsCurrent")}</span>
          </button>
        </>
      )}
    </div>
  )

  return (
    <FloatingDropdown
      open={open}
      onOpenChange={setOpen}
      matchWidth={false}
      className="z-50"
      enablePortal={enablePortal}
      content={dropdownContent}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-accent-blue text-xs hover:bg-accent-blue-ghost disabled:opacity-50"
        title={t("promptTemplate.selector.title")}>
        <Icon icon="mdi:file-document-multiple-outline" width={14} />
        {t("promptTemplate.selector.title")}
      </button>
    </FloatingDropdown>
  )
}
