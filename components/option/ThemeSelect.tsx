import { Icon } from "@iconify/react"
import type React from "react"
import { useCallback } from "react"
import { toast } from "react-toastify"

import { cn } from "~utils"
import { useI18n } from "~utils/i18n"
import { SUPPORTED_THEMES, type Theme, useTheme } from "~utils/theme"

interface ThemeSelectProps {
  /**
   * 布局变体
   * - "block": 垂直布局，标签在上，选择框在下（默认，用于 options 页面）
   * - "inline": 水平布局，标签和选择框在同一行（用于 sidepanel）
   */
  variant?: "block" | "inline"
  /** 额外的类名 */
  className?: string
  /** 是否显示图标（仅 inline 模式） */
  showIcon?: boolean
  /** 是否显示描述文本（仅 block 模式） */
  showDescription?: boolean
}

/**
 * 主题选择组件
 * 使用 Theme Context 管理主题切换
 * 支持两种布局变体：block（垂直）和 inline（水平）
 */
export const ThemeSelect: React.FC<ThemeSelectProps> = ({
  variant = "block",
  className,
  showIcon = true,
  showDescription = true
}) => {
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

  // Block 布局（垂直，用于 options 页面）
  if (variant === "block") {
    return (
      <div className={cn("mb-4", className)}>
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
        {showDescription && (
          <p className="mt-2 text-sm text-text-2">{t("settings.theme.desc")}</p>
        )}
      </div>
    )
  }

  // Inline 布局（水平，用于 sidepanel）
  return (
    <div
      className={cn("card flex items-center justify-between p-3", className)}>
      <span className="flex items-center gap-2 font-medium text-sm text-text-1">
        {showIcon && (
          <Icon
            icon="mdi:theme-light-dark"
            width={16}
            className="text-accent-blue"
          />
        )}
        {t("settings.theme")}
      </span>
      <select
        value={theme}
        onChange={handleChange}
        className="rounded border border-line-1 bg-content px-2 py-1 text-sm focus:border-accent-blue focus:outline-none">
        {SUPPORTED_THEMES.map((th) => (
          <option key={th} value={th}>
            {themeLabels[th]}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ThemeSelect
