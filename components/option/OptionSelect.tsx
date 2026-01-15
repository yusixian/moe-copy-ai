import { useStorage } from "@plasmohq/storage/hook"
import type React from "react"
import { useCallback } from "react"
import { toast } from "react-toastify"

import { useI18n } from "~utils/i18n"

interface Option {
  value: string
  label: string
}

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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setValue(e.target.value)
      toast.success(t("option.saved"))
    },
    [setValue, t]
  )

  return (
    <div className="mb-4">
      <label className="mb-2 block font-medium text-sky-600" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={handleChange}
        className="w-full rounded-lg border border-sky-200 bg-blue-50 p-2.5 focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <p className="mt-2 text-sky-500 text-sm">{description}</p>
    </div>
  )
}

export default OptionSelect
