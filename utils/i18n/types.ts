/**
 * i18n 类型定义
 */

// 支持的语言
export type Locale = "zh_CN" | "en_US"

// 翻译文件的类型 - 扁平化的 key-value 结构
export type TranslationMessages = Record<string, string>

// i18n Context 的值类型
export interface I18nContextValue {
  /** 翻译函数 */
  t: (key: string, params?: Record<string, string | number>) => string
  /** 当前语言 */
  locale: Locale
  /** 切换语言 */
  setLocale: (locale: Locale) => void
  /** 是否正在加载 */
  isLoading: boolean
}

// 存储键
export const LOCALE_STORAGE_KEY = "user_locale"

// 默认语言
export const DEFAULT_LOCALE: Locale = "zh_CN"

// 支持的语言列表
export const SUPPORTED_LOCALES: readonly Locale[] = ["zh_CN", "en_US"] as const

// 语言显示名称
export const LOCALE_NAMES: Record<Locale, string> = {
  zh_CN: "简体中文",
  en_US: "English"
}
