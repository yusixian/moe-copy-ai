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
  useState
} from "react"

import { syncStorage } from "~utils/storage"

import { getTranslations } from "./translations"
import {
  DEFAULT_LOCALE,
  type I18nContextValue,
  LOCALE_STORAGE_KEY,
  type Locale
} from "./types"

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

  // 初始化时从 storage 读取语言偏好
  useEffect(() => {
    if (initialLocale) return

    const loadLocale = async () => {
      try {
        const savedLocale = await syncStorage.get<Locale>(LOCALE_STORAGE_KEY)
        if (
          savedLocale &&
          (savedLocale === "zh_CN" || savedLocale === "en_US")
        ) {
          setLocaleState(savedLocale)
        }
      } catch (error) {
        console.error("Failed to load locale from storage:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLocale()
  }, [initialLocale])

  // 监听 storage 变化，实现跨 context 同步
  useEffect(() => {
    const unsubscribe = syncStorage.watch({
      [LOCALE_STORAGE_KEY]: (change) => {
        const newLocale = change.newValue as Locale | undefined
        if (newLocale && (newLocale === "zh_CN" || newLocale === "en_US")) {
          setLocaleState(newLocale)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // 切换语言并保存到 storage
  const setLocale = useCallback(async (newLocale: Locale) => {
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
