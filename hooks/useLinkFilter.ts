import { useCallback, useMemo, useState } from "react"
import {
  DEFAULT_FILTER_STATE,
  type FilterMode,
  type FilterTarget,
  type PresetFilter
} from "~constants/link-filter-presets"
import type { ExtractedLink } from "~constants/types"

export interface LinkFilterState {
  pattern: string
  target: FilterTarget
  mode: FilterMode
  isValid: boolean
  error: string | null
}

export interface UseLinkFilterReturn {
  filterState: LinkFilterState
  setPattern: (pattern: string) => void
  setTarget: (target: FilterTarget) => void
  setMode: (mode: FilterMode) => void
  applyPreset: (preset: PresetFilter) => void
  clearFilter: () => void
  filterLinks: (links: ExtractedLink[]) => ExtractedLink[]
  getFilteredLinks: (links: ExtractedLink[]) => ExtractedLink[]
}

/**
 * 验证正则表达式是否有效
 */
function validateRegex(pattern: string): {
  isValid: boolean
  error: string | null
} {
  if (!pattern.trim()) {
    return { isValid: true, error: null }
  }
  try {
    new RegExp(pattern, "i")
    return { isValid: true, error: null }
  } catch (e) {
    return {
      isValid: false,
      error: e instanceof Error ? e.message : "无效的正则表达式"
    }
  }
}

/**
 * 链接过滤 Hook
 */
export function useLinkFilter(): UseLinkFilterReturn {
  const [pattern, setPatternState] = useState(DEFAULT_FILTER_STATE.pattern)
  const [target, setTarget] = useState<FilterTarget>(
    DEFAULT_FILTER_STATE.target
  )
  const [mode, setMode] = useState<FilterMode>(DEFAULT_FILTER_STATE.mode)

  // 验证正则表达式
  const validation = useMemo(() => validateRegex(pattern), [pattern])

  // 过滤状态
  const filterState: LinkFilterState = useMemo(
    () => ({
      pattern,
      target,
      mode,
      isValid: validation.isValid,
      error: validation.error
    }),
    [pattern, target, mode, validation]
  )

  // 设置正则表达式
  const setPattern = useCallback((newPattern: string) => {
    setPatternState(newPattern)
  }, [])

  // 应用预设
  const applyPreset = useCallback((preset: PresetFilter) => {
    setPatternState(preset.pattern)
    setTarget(preset.target)
    setMode(preset.mode)
  }, [])

  // 清除过滤
  const clearFilter = useCallback(() => {
    setPatternState("")
    setTarget("url")
    setMode("exclude")
  }, [])

  // 过滤链接
  const filterLinks = useCallback(
    (links: ExtractedLink[]): ExtractedLink[] => {
      // 如果没有有效的正则表达式，返回所有链接
      if (!pattern.trim() || !validation.isValid) {
        return links
      }

      try {
        const regex = new RegExp(pattern, "i")

        return links.filter((link) => {
          let matches = false

          // 根据目标匹配
          switch (target) {
            case "url":
              matches = regex.test(link.url)
              break
            case "text":
              matches = regex.test(link.text)
              break
            case "both":
              matches = regex.test(link.url) || regex.test(link.text)
              break
          }

          // 根据模式决定是保留还是排除
          return mode === "include" ? matches : !matches
        })
      } catch {
        return links
      }
    },
    [pattern, target, mode, validation.isValid]
  )

  // getFilteredLinks 是 filterLinks 的别名，保持 API 一致性
  const getFilteredLinks = filterLinks

  return {
    filterState,
    setPattern,
    setTarget,
    setMode,
    applyPreset,
    clearFilter,
    filterLinks,
    getFilteredLinks
  }
}

export default useLinkFilter
