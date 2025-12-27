import { useCallback, useRef, useState } from 'react'

import type {
  BatchProgress,
  BatchScrapeMode,
  BatchScrapeOptions,
  BatchScrapeResult,
  ExtractedLink,
  SelectedElementInfo,
} from '~constants/types'
import { BatchScrapeController, DEFAULT_BATCH_OPTIONS } from '~utils/batch-scraper'

interface UseBatchScrapeReturn {
  // 状态
  mode: BatchScrapeMode
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  progress: BatchProgress | null
  results: BatchScrapeResult[]
  error: string | null

  // 操作
  setLinks: (info: SelectedElementInfo | null, links: ExtractedLink[]) => void
  startScrape: (options?: Partial<BatchScrapeOptions>) => Promise<void>
  pauseScrape: () => void
  resumeScrape: () => void
  cancelScrape: () => void
  reset: () => void
}

/**
 * 批量抓取 hook
 * 管理完整的批量抓取流程
 */
export function useBatchScrape(): UseBatchScrapeReturn {
  const [mode, setMode] = useState<BatchScrapeMode>('idle')
  const [elementInfo, setElementInfo] = useState<SelectedElementInfo | null>(null)
  const [links, setLinksState] = useState<ExtractedLink[]>([])
  const [progress, setProgress] = useState<BatchProgress | null>(null)
  const [results, setResults] = useState<BatchScrapeResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const controllerRef = useRef<BatchScrapeController | null>(null)

  // 设置链接（从元素选择器接收）
  const setLinks = useCallback((info: SelectedElementInfo | null, extractedLinks: ExtractedLink[]) => {
    setElementInfo(info)
    setLinksState(extractedLinks)
    setMode(extractedLinks.length > 0 ? 'previewing' : 'idle')
    setError(null)
  }, [])

  // 开始抓取
  const startScrape = useCallback(
    async (options: Partial<BatchScrapeOptions> = {}) => {
      if (links.length === 0) {
        setError('没有可抓取的链接')
        return
      }

      setMode('scraping')
      setError(null)
      setResults([])

      const mergedOptions = { ...DEFAULT_BATCH_OPTIONS, ...options }
      const controller = new BatchScrapeController(mergedOptions)
      controllerRef.current = controller

      try {
        const scrapeResults = await controller.execute(links, (p) => {
          setProgress({ ...p })
        })

        setResults(scrapeResults)
        setMode('completed')
      } catch (err) {
        setError(err instanceof Error ? err.message : '抓取过程中发生错误')
        setMode('error')
      }
    },
    [links]
  )

  // 暂停抓取
  const pauseScrape = useCallback(() => {
    controllerRef.current?.pause()
    setProgress((prev) => (prev ? { ...prev, isPaused: true } : null))
  }, [])

  // 恢复抓取
  const resumeScrape = useCallback(() => {
    controllerRef.current?.resume()
    setProgress((prev) => (prev ? { ...prev, isPaused: false } : null))
  }, [])

  // 取消抓取
  const cancelScrape = useCallback(() => {
    controllerRef.current?.cancel()
    setMode('idle')
    setProgress(null)
  }, [])

  // 重置状态
  const reset = useCallback(() => {
    controllerRef.current?.cancel()
    controllerRef.current = null
    setMode('idle')
    setElementInfo(null)
    setLinksState([])
    setProgress(null)
    setResults([])
    setError(null)
  }, [])

  return {
    mode,
    elementInfo,
    links,
    progress,
    results,
    error,
    setLinks,
    startScrape,
    pauseScrape,
    resumeScrape,
    cancelScrape,
    reset,
  }
}

export default useBatchScrape
