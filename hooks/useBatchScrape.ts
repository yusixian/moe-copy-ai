import { useCallback, useRef, useState } from 'react'

import { Storage } from '@plasmohq/storage'

import type {
  BatchProgress,
  BatchScrapeMode,
  BatchScrapeResult,
  ExtractedLink,
  ScrapeStrategyType,
  SelectedElementInfo,
} from '~constants/types'
import { BatchScrapeController, type ExtendedBatchScrapeOptions } from '~utils/batch-scraper'

const storage = new Storage({ area: 'sync' })

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
  addLink: (url: string, text?: string) => void
  updateLink: (index: number, url: string, text: string) => void
  removeLink: (index: number) => void
  startScrape: (selectedLinks: ExtractedLink[], options?: Partial<ExtendedBatchScrapeOptions>) => Promise<void>
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

  // 添加链接
  const addLink = useCallback((url: string, text?: string) => {
    setLinksState((prev) => {
      const maxIndex = prev.length > 0 ? Math.max(...prev.map((l) => l.index)) : -1
      const newLink: ExtractedLink = {
        url,
        text: text || url,
        index: maxIndex + 1,
      }
      return [...prev, newLink]
    })
    // 确保在 previewing 模式
    setMode('previewing')
  }, [])

  // 更新链接
  const updateLink = useCallback((index: number, url: string, text: string) => {
    setLinksState((prev) => prev.map((link) => (link.index === index ? { ...link, url, text } : link)))
  }, [])

  // 删除链接
  const removeLink = useCallback((index: number) => {
    setLinksState((prev) => {
      const newLinks = prev.filter((link) => link.index !== index)
      // 如果删除后没有链接了，回到 idle 模式
      if (newLinks.length === 0) {
        setMode('idle')
      }
      return newLinks
    })
  }, [])

  // 开始抓取
  const startScrape = useCallback(
    async (selectedLinks: ExtractedLink[], options: Partial<ExtendedBatchScrapeOptions> = {}) => {
      if (selectedLinks.length === 0) {
        setError('没有可抓取的链接')
        return
      }

      setMode('scraping')
      setError(null)
      setResults([])

      // 从 storage 读取用户配置
      const concurrency = (await storage.get<string>('batch_concurrency')) || '2'
      const delay = (await storage.get<string>('batch_delay')) || '500'
      const timeout = (await storage.get<string>('batch_timeout')) || '30000'
      const retryCount = (await storage.get<string>('batch_retry')) || '1'
      const strategy = (await storage.get<ScrapeStrategyType>('batch_strategy')) || 'fetch'

      const mergedOptions: ExtendedBatchScrapeOptions = {
        concurrency: parseInt(concurrency, 10),
        delayBetweenRequests: parseInt(delay, 10),
        timeout: parseInt(timeout, 10),
        retryCount: parseInt(retryCount, 10),
        strategy,
        ...options,
      }

      const controller = new BatchScrapeController(mergedOptions)
      controllerRef.current = controller

      try {
        const scrapeResults = await controller.execute(selectedLinks, (p) => {
          setProgress({ ...p })
        })

        setResults(scrapeResults)
        setMode('completed')
      } catch (err) {
        setError(err instanceof Error ? err.message : '抓取过程中发生错误')
        setMode('error')
      }
    },
    []
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
    addLink,
    updateLink,
    removeLink,
    startScrape,
    pauseScrape,
    resumeScrape,
    cancelScrape,
    reset,
  }
}

export default useBatchScrape
