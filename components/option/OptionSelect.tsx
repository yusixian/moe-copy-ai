import { useStorage } from "@plasmohq/storage/hook"
import type React from "react"
import { useCallback } from "react"
import { toast } from "react-toastify"

import { useI18n } from "~utils/i18n"

type Option =
  | { value: string; label: string }
  | { value: string; labelKey: string }

interface OptionSelectProps {
  id: string
  label: string
  options: Option[]
  storageKey: string
  defaultValue: string
  description: string
}

export const OptionSelect: React.FC<OptionSelectProps> = ({
  id,
  label,
  options,
  storageKey,
  defaultValue,
  description
}) => {
  const { t } = useI18n()
  const [value, setValue] = useStorage<string>(storageKey, defaultValue)

  const getOptionLabel = useCallback(
    (option: Option) => ("label" in option ? option.label : t(option.labelKey)),
    [t]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setValue(e.target.value)
      toast.success(t("option.saved"))
    },
    [setValue, t]
  )

  return (
    <div className="mb-4">
      <label className="mb-2 block font-medium text-text-1" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className="w-full rounded-lg border border-line-1 bg-content p-2.5 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {getOptionLabel(option)}
          </option>
        ))}
      </select>
      <p className="mt-2 text-sm text-text-2">{description}</p>
    </div>
  )
}

export default OptionSelect
