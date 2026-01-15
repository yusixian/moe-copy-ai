/**
 * i18n 模块入口
 * 导出所有公共 API
 */

// Context 和 Hooks
export { I18nProvider, useI18n, useTranslation } from "./context"

// 类型
export {
  DEFAULT_LOCALE,
  LOCALE_NAMES,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  type I18nContextValue,
  type Locale,
  type TranslationMessages
} from "./types"

// 翻译资源（高级用例）
export { getTranslations, translations } from "./translations"
