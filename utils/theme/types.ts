/**
 * Theme 类型定义
 */

// 支持的主题
export type Theme = "light" | "dark" | "system"

// 解析后的主题（排除 system）
export type ResolvedTheme = "light" | "dark"

// 存储键
export const THEME_STORAGE_KEY = "user_theme"

// 默认主题
export const DEFAULT_THEME: Theme = "system"

// 支持的主题列表
export const SUPPORTED_THEMES: readonly Theme[] = [
  "light",
  "dark",
  "system"
] as const

// 主题显示名称（用于 i18n 键）
export const THEME_I18N_KEYS: Record<Theme, string> = {
  light: "settings.theme.light",
  dark: "settings.theme.dark",
  system: "settings.theme.system"
}

// Theme Context 的值类型
export interface ThemeContextValue {
  /** 用户选择的主题 */
  theme: Theme
  /** 解析后的实际主题（system 会解析为 light 或 dark） */
  resolvedTheme: ResolvedTheme
  /** 切换主题 */
  setTheme: (theme: Theme) => void
  /** 是否正在加载 */
  isLoading: boolean
}
