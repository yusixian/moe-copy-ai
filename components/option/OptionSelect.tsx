import React, { useCallback } from "react"
import { toast } from "react-toastify"

import { useStorage } from "@plasmohq/storage/hook"

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
  const [value, setValue] = useStorage<string>(storageKey, defaultValue)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setValue(e.target.value)
      toast.success("设置已保存！")
    },
    [setValue]
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
      <p className="mt-2 text-sm text-sky-500">{description}</p>
    </div>
  )
}

export default OptionSelect
