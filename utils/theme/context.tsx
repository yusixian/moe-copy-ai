/**
 * Theme Context Provider 和 Hook
 * 提供运行时主题切换能力
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"

import { useSystemTheme } from "~hooks/useSystemTheme"
import { syncStorage } from "~utils/storage"
import type { ResolvedTheme } from "./types"
import {
  DEFAULT_THEME,
  SUPPORTED_THEMES,
  THEME_STORAGE_KEY,
  type Theme,
  type ThemeContextValue
} from "./types"

// 创建 Context
const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
  /** 初始主题（可选，默认从 storage 读取或使用系统主题） */
  initialTheme?: Theme
}

/**
 * 应用主题到 document
 * 添加或移除 dark class
 */
function applyTheme(resolvedTheme: ResolvedTheme) {
  if (typeof document === "undefined") return

  const root = document.documentElement
  if (resolvedTheme === "dark") {
    root.classList.add("dark")
  } else {
    root.classList.remove("dark")
  }
}

/**
 * Theme Provider 组件
 * 提供主题切换能力和主题状态
 */
export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme || DEFAULT_THEME)
  const [isLoading, setIsLoading] = useState(!initialTheme)
  const systemTheme = useSystemTheme()

  // 计算解析后的主题
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    return theme === "system" ? systemTheme : theme
  }, [theme, systemTheme])

  // 初始化时从 storage 读取主题偏好
  useEffect(() => {
    if (initialTheme) return

    const loadTheme = async () => {
      try {
        const savedTheme = await syncStorage.get<Theme>(THEME_STORAGE_KEY)

        if (savedTheme && SUPPORTED_THEMES.includes(savedTheme)) {
          setThemeState(savedTheme)
        } else {
          // 首次使用，默认使用 system
          setThemeState(DEFAULT_THEME)
        }
      } catch (error) {
        console.error("Failed to load theme from storage:", error)
        setThemeState(DEFAULT_THEME)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [initialTheme])

  // 监听 storage 变化，实现跨 context 同步
  useEffect(() => {
    const handleThemeChange = (change: { newValue?: unknown }) => {
      const newTheme = change.newValue as Theme | undefined
      if (newTheme && SUPPORTED_THEMES.includes(newTheme)) {
        setThemeState(newTheme)
      }
    }
    const watchMap = { [THEME_STORAGE_KEY]: handleThemeChange }
    const isWatching = syncStorage.watch(watchMap)

    return () => {
      if (isWatching) {
        syncStorage.unwatch(watchMap)
      }
    }
  }, [])

  // 当解析后的主题变化时，应用到 document
  useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  // 切换主题并保存到 storage
  const setTheme = useCallback(async (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      await syncStorage.set(THEME_STORAGE_KEY, newTheme)
    } catch (error) {
      console.error("Failed to save theme to storage:", error)
    }
  }, [])

  // 使用 useMemo 缓存 context value，避免不必要的重渲染
  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      isLoading
    }),
    [theme, resolvedTheme, setTheme, isLoading]
  )

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * 使用 Theme 的 Hook
 * @returns theme context value
 * @throws 如果在 ThemeProvider 外部使用则抛出错误
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
