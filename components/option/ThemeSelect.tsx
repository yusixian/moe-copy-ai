import type React from "react"
import { useCallback } from "react"
import { toast } from "react-toastify"

import { useI18n } from "~utils/i18n"
import { SUPPORTED_THEMES, type Theme, useTheme } from "~utils/theme"

/**
 * 主题选择组件
 * 使用 Theme Context 管理主题切换
 */
export const ThemeSelect: React.FC = () => {
  const { t } = useI18n()
  const { theme, setTheme } = useTheme()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newTheme = e.target.value as Theme
      setTheme(newTheme)
      toast.success(t("common.success"))
    },
    [setTheme, t]
  )

  const themeLabels: Record<Theme, string> = {
    light: t("settings.theme.light"),
    dark: t("settings.theme.dark"),
    system: t("settings.theme.system")
  }

  return (
    <div className="mb-4">
      <label
        className="mb-2 block font-medium text-text-1"
        htmlFor="theme-select">
        {t("settings.theme")}
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={handleChange}
        className="w-full rounded-lg border border-line-1 bg-content p-2.5 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20">
        {SUPPORTED_THEMES.map((th) => (
          <option key={th} value={th}>
            {themeLabels[th]}
          </option>
        ))}
      </select>
      <p className="mt-2 text-sm text-text-2">{t("settings.theme.desc")}</p>
    </div>
  )
}

export default ThemeSelect
