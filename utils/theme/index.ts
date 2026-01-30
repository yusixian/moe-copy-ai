/**
 * Theme 模块入口
 * 导出所有公共 API
 */

// Context 和 Hooks
export { ThemeProvider, useTheme } from "./context"
// 运行时环境检测
export { isContentScript, isExtensionPage } from "./runtime-env"
// 类型
export {
  DEFAULT_THEME,
  type ResolvedTheme,
  SUPPORTED_THEMES,
  THEME_I18N_KEYS,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemeContextValue
} from "./types"
