import { useMemo } from "react"

import { useI18n } from "~utils/i18n"

import { Combobox, type ComboboxOption } from "../ui/Combobox"

interface ModelSelectInputProps {
  value: string | null
  onChange: (value: string) => void
  options: { id: string; owned_by?: string }[]
  placeholder?: string
  compact?: boolean
  id?: string
}

export function ModelSelectInput({
  value,
  onChange,
  options,
  placeholder,
  compact = false,
  id
}: ModelSelectInputProps) {
  const { t } = useI18n()
  // 转换 options 格式
  const comboboxOptions: ComboboxOption[] = useMemo(
    () =>
      options?.length
        ? options.map((opt) => ({
            id: opt.id,
            label: opt.id,
            description: opt.owned_by
          }))
        : [],
    [options]
  )

  return (
    <Combobox
      value={value}
      onChange={onChange}
      options={comboboxOptions}
      placeholder={placeholder || t("ai.model.select")}
      compact={compact}
      inputId={id}
      emptyText={
        options?.length === 0 ? t("ai.model.empty") : t("ai.model.noMatch")
      }
    />
  )
}
