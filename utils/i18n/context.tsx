/**
 * i18n Context Provider 和 Hook
 * 提供运行时语言切换能力
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"

import { syncStorage } from "~utils/storage"

import { getTranslations } from "./translations"
import {
  DEFAULT_LOCALE,
  type I18nContextValue,
  LOCALE_STORAGE_KEY,
  type Locale,
  SUPPORTED_LOCALES
} from "./types"

/**
 * 检测浏览器语言偏好，返回支持的 locale
 */
function detectBrowserLocale(): Locale {
  const toSupportedLocale = (language?: string | null): Locale | null => {
    if (!language) return null

    const normalized = language.toLowerCase()
    // 匹配 zh-CN, zh-TW, zh 等变体
    if (normalized.startsWith("zh")) {
      return "zh_CN"
    }
    // 匹配 en-US, en-GB, en 等变体
    if (normalized.startsWith("en")) {
      return "en_US"
    }

    return null
  }

  // 优先使用 Extension API (Chrome/Firefox)
  const runtime = globalThis as typeof globalThis & {
    chrome?: { i18n?: { getUILanguage?: () => string } }
    browser?: { i18n?: { getUILanguage?: () => string } }
  }
  const uiLanguage =
    runtime.chrome?.i18n?.getUILanguage?.() ??
    runtime.browser?.i18n?.getUILanguage?.()
  const uiLocale = toSupportedLocale(uiLanguage)
  if (uiLocale) return uiLocale

  // Fallback: 使用 navigator.language / navigator.languages
  const nav = typeof navigator !== "undefined" ? navigator : undefined
  const navLanguages =
    nav && Array.isArray(nav.languages) && nav.languages.length > 0
      ? nav.languages
      : nav?.language
        ? [nav.language]
        : []

  for (const lang of navLanguages) {
    const locale = toSupportedLocale(lang)
    if (locale) return locale
  }

  // 最终 fallback: 中文
  return DEFAULT_LOCALE
}

// 创建 Context
const I18nContext = createContext<I18nContextValue | null>(null)

interface I18nProviderProps {
  children: React.ReactNode
  /** 初始语言（可选，默认从 storage 读取或使用默认语言） */
  initialLocale?: Locale
}

/**
 * i18n Provider 组件
 * 提供翻译函数和语言切换能力
 */
export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale || DEFAULT_LOCALE
  )
  const [isLoading, setIsLoading] = useState(!initialLocale)
  const hasUserLocaleOverride = useRef(Boolean(initialLocale))

  // 初始化时从 storage 读取语言偏好
  useEffect(() => {
    if (initialLocale) return

    const loadLocale = async () => {
      try {
        const savedLocale = await syncStorage.get<Locale>(LOCALE_STORAGE_KEY)

        if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
          // 用户已保存语言偏好，使用保存的值
          setLocaleState(savedLocale)
        } else {
          // 首次使用，检测浏览器语言
          const detectedLocale = detectBrowserLocale()
          setLocaleState(detectedLocale)

          // 保存检测到的语言，避免下次重复检测
          if (!hasUserLocaleOverride.current) {
            await syncStorage.set(LOCALE_STORAGE_KEY, detectedLocale)
          }
        }
      } catch (error) {
        console.error("Failed to load locale from storage:", error)
        // 出错时使用浏览器检测作为 fallback
        setLocaleState(detectBrowserLocale())
      } finally {
        setIsLoading(false)
      }
    }

    loadLocale()
  }, [initialLocale])

  // 监听 storage 变化，实现跨 context 同步
  useEffect(() => {
    const handleLocaleChange = (change: { newValue?: unknown }) => {
      const newLocale = change.newValue as Locale | undefined
      if (newLocale && SUPPORTED_LOCALES.includes(newLocale)) {
        setLocaleState(newLocale)
      }
    }
    const watchMap = { [LOCALE_STORAGE_KEY]: handleLocaleChange }
    const isWatching = syncStorage.watch(watchMap)

    return () => {
      if (isWatching) {
        syncStorage.unwatch(watchMap)
      }
    }
  }, [])

  // 切换语言并保存到 storage
  const setLocale = useCallback(async (newLocale: Locale) => {
    hasUserLocaleOverride.current = true
    setLocaleState(newLocale)
    try {
      await syncStorage.set(LOCALE_STORAGE_KEY, newLocale)
    } catch (error) {
      console.error("Failed to save locale to storage:", error)
    }
  }, [])

  // 获取当前语言的翻译
  const messages = useMemo(() => getTranslations(locale), [locale])

  // 翻译函数
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      let message = messages[key]

      if (message === undefined) {
        // 开发模式下输出警告
        if (process.env.NODE_ENV === "development") {
          console.warn(`[i18n] Missing translation key: "${key}"`)
        }
        return key
      }

      // 支持参数插值 {param}
      if (params) {
        for (const [paramKey, value] of Object.entries(params)) {
          message = message.replace(
            new RegExp(`\\{${paramKey}\\}`, "g"),
            String(value)
          )
        }
      }

      return message
    },
    [messages]
  )

  // 使用 useMemo 缓存 context value，避免不必要的重渲染
  const contextValue = useMemo<I18nContextValue>(
    () => ({
      t,
      locale,
      setLocale,
      isLoading
    }),
    [t, locale, setLocale, isLoading]
  )

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  )
}

/**
 * 使用 i18n 的 Hook
 * @returns i18n context value
 * @throws 如果在 I18nProvider 外部使用则抛出错误
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }

  return context
}

/**
 * 仅获取翻译函数的 Hook（用于不需要语言切换能力的组件）
 * @returns 翻译函数 t
 */
export function useTranslation() {
  const { t } = useI18n()
  return t
}
