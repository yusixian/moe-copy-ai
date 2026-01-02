import { useMemo } from "react"

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
  placeholder = "请选择模型",
  compact = false,
  id
}: ModelSelectInputProps) {
  // 转换 options 格式
  const comboboxOptions: ComboboxOption[] = useMemo(
    () =>
      options.map((opt) => ({
        id: opt.id,
        label: opt.id,
        description: opt.owned_by
      })),
    [options]
  )

  return (
    <Combobox
      value={value}
      onChange={onChange}
      options={comboboxOptions}
      placeholder={placeholder}
      compact={compact}
      inputId={id}
      emptyText={
        options.length === 0 ? "暂无可用模型，请先获取模型列表" : "无匹配模型"
      }
    />
  )
}
