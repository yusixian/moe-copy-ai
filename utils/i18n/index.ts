/**
 * i18n 模块入口
 * 导出所有公共 API
 */

// Context 和 Hooks
export { I18nProvider, useI18n, useTranslation } from "./context"
// 翻译资源（高级用例）
export { getTranslations, translations } from "./translations"
// 类型
export {
  DEFAULT_LOCALE,
  type I18nContextValue,
  LOCALE_NAMES,
  LOCALE_STORAGE_KEY,
  type Locale,
  SUPPORTED_LOCALES,
  type TranslationMessages
} from "./types"
