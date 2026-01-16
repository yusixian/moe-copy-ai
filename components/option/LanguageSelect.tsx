import type React from "react"
import { useCallback } from "react"
import { toast } from "react-toastify"

import {
  getTranslations,
  LOCALE_NAMES,
  type Locale,
  SUPPORTED_LOCALES,
  useI18n
} from "~utils/i18n"

/**
 * 语言选择组件
 * 使用 i18n Context 管理语言切换
 */
export const LanguageSelect: React.FC = () => {
  const { t, locale, setLocale } = useI18n()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLocale = e.target.value as Locale
      setLocale(newLocale)
      const translatedMessage =
        getTranslations(newLocale)["common.success"] ?? t("common.success")
      toast.success(translatedMessage)
    },
    [setLocale, t]
  )

  return (
    <div className="mb-4">
      <label
        className="mb-2 block font-medium text-sky-600"
        htmlFor="language-select">
        {t("option.interface.language")}
      </label>
      <select
        id="language-select"
        value={locale}
        onChange={handleChange}
        className="w-full rounded-lg border border-sky-200 bg-blue-50 p-2.5 focus:border-sky-400 focus:ring-2 focus:ring-sky-200">
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {LOCALE_NAMES[loc]}
          </option>
        ))}
      </select>
      <p className="mt-2 text-sky-500 text-sm">
        {t("option.interface.language.desc")}
      </p>
    </div>
  )
}

export default LanguageSelect
