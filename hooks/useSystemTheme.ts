import { useEffect, useState } from "react"

import type { ResolvedTheme } from "~utils/theme/types"

/**
 * 检测系统主题偏好
 * 使用 matchMedia API 监听系统主题变化
 * @returns 当前系统主题 "light" | "dark"
 */
export function useSystemTheme(): ResolvedTheme {
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light")
    }

    // 添加监听器
    mediaQuery.addEventListener("change", handleChange)

    // 清理
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [])

  return systemTheme
}

/**
 * 获取当前系统主题（非响应式）
 * 用于初始化时快速获取
 */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}
