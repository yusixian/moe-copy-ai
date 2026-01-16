/**
 * 翻译资源导入
 * 静态导入所有翻译文件
 */

import en_US from "~locales/en_US.json"
import zh_CN from "~locales/zh_CN.json"
import { DEFAULT_LOCALE, type Locale, type TranslationMessages } from "./types"

// 翻译资源映射
export const translations: Record<Locale, TranslationMessages> = {
  zh_CN,
  en_US
}

/**
 * 获取指定语言的翻译
 */
export function getTranslations(locale: Locale): TranslationMessages {
  return translations[locale] || translations.zh_CN
}

/**
 * 获取默认系统提示词（按语言）
 */
export function getDefaultSystemPrompt(locale: Locale): string {
  const messages = getTranslations(locale)
  return (
    messages["ai.defaultSystemPrompt"] ||
    translations[DEFAULT_LOCALE]["ai.defaultSystemPrompt"] ||
    ""
  )
}
