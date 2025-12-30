import { useCallback, useRef, useState } from 'react'

import { sendToBackground } from '@plasmohq/messaging'
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
import { debugLog } from '~utils/logger'

const storage = new Storage({ area: 'sync' })

// 分页进度信息
interface PaginationProgress {
  currentPage: number
  maxPages: number
  isLoadingNextPage: boolean
  currentUrl?: string
}

interface UseBatchScrapeReturn {
  // 状态
  mode: BatchScrapeMode
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  progress: BatchProgress | null
  results: BatchScrapeResult[]
  error: string | null
  paginationProgress: PaginationProgress | null

  // 操作
  setLinks: (info: SelectedElementInfo | null, links: ExtractedLink[]) => void
  addLink: (url: string, text?: string) => void
  updateLink: (index: number, url: string, text: string) => void
  removeLink: (index: number) => void
  startScrape: (selectedLinks: ExtractedLink[], nextPageXPath?: string, linkContainerSelector?: string, options?: Partial<ExtendedBatchScrapeOptions>) => Promise<void>
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
  const [paginationProgress, setPaginationProgress] = useState<PaginationProgress | null>(null)

  const controllerRef = useRef<BatchScrapeController | null>(null)
  const isCancelledRef = useRef(false)

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
    async (selectedLinks: ExtractedLink[], nextPageXPath?: string, linkContainerSelector?: string, options: Partial<ExtendedBatchScrapeOptions> = {}) => {
      if (selectedLinks.length === 0) {
        setError('没有可抓取的链接')
        return
      }

      setMode('scraping')
      setError(null)
      setResults([])
      setPaginationProgress(null)
      isCancelledRef.current = false

      // 从 storage 读取用户配置
      const concurrency = (await storage.get<string>('batch_concurrency')) || '2'
      const delay = (await storage.get<string>('batch_delay')) || '500'
      const timeout = (await storage.get<string>('batch_timeout')) || '30000'
      const retryCount = (await storage.get<string>('batch_retry')) || '1'
      const strategy = (await storage.get<ScrapeStrategyType>('batch_strategy')) || 'fetch'
      const maxPages = parseInt((await storage.get<string>('pagination_max_pages')) || '10', 10)
      const delayBetweenPages = parseInt((await storage.get<string>('pagination_delay')) || '2000', 10)

      const mergedOptions: ExtendedBatchScrapeOptions = {
        concurrency: parseInt(concurrency, 10),
        delayBetweenRequests: parseInt(delay, 10),
        timeout: parseInt(timeout, 10),
        retryCount: parseInt(retryCount, 10),
        strategy,
        ...options,
      }

      // 分页配置：使用传入的 nextPageXPath
      const paginationEnabled = !!nextPageXPath
      debugLog('[BatchScrape] 分页配置:', { enabled: paginationEnabled, xpath: nextPageXPath })
      const allResults: BatchScrapeResult[] = []
      let currentPage = 1
      let linksToScrape = selectedLinks

      try {
        // 获取当前标签页 ID（用于分页）
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        const tabId = tab?.id

        // 分页循环
        while (true) {
          if (isCancelledRef.current) {
            debugLog('[BatchScrape] 用户取消')
            break
          }

          // 日志：当前页信息
          debugLog(`[BatchScrape] 第 ${currentPage} 页开始, 待抓取: ${linksToScrape.length} 个链接`)

          // 更新分页进度
          if (paginationEnabled) {
            // 获取当前标签页 URL
            const currentTab = await chrome.tabs.get(tabId!)
            setPaginationProgress({
              currentPage,
              maxPages,
              isLoadingNextPage: false,
              currentUrl: currentTab?.url,
            })
          }

          // 执行当前页抓取
          const controller = new BatchScrapeController(mergedOptions)
          controllerRef.current = controller

          const pageResults = await controller.execute(linksToScrape, (p) => {
            // 更新进度，包含之前页面的结果
            setProgress({
              ...p,
              total: p.total + allResults.length,
              completed: p.completed + allResults.length,
            })
          })

          allResults.push(...pageResults)
          setResults([...allResults])

          // 检查是否需要继续分页
          if (!paginationEnabled || !tabId) {
            break
          }

          // 检查是否达到最大页数
          if (maxPages > 0 && currentPage >= maxPages) {
            debugLog(`[BatchScrape] 已达到最大页数: ${maxPages}`)
            break
          }

          // 更新状态：正在加载下一页
          setPaginationProgress((prev) => ({
            currentPage,
            maxPages,
            isLoadingNextPage: true,
            currentUrl: prev?.currentUrl,
          }))

          // 等待翻页延迟
          await new Promise((resolve) => setTimeout(resolve, delayBetweenPages))

          if (isCancelledRef.current) break

          // 点击下一页
          debugLog('[BatchScrape] 准备点击下一页')
          // paginationEnabled 为 true 时 nextPageXPath 必定存在
          const clickResult = await sendToBackground<
            { tabId: number; nextPageXPath: string },
            { success: boolean; hasNextPage: boolean; error?: string }
          >({
            name: 'clickNextPage',
            body: {
              tabId,
              nextPageXPath: nextPageXPath as string,
            },
          })

          debugLog('[BatchScrape] 点击下一页结果:', clickResult)
          if (!clickResult.success || !clickResult.hasNextPage) {
            debugLog('[BatchScrape] 没有下一页或点击失败')
            break
          }

          // 等待页面加载
          await new Promise((resolve) => setTimeout(resolve, 1000))

          if (isCancelledRef.current) break

          // 提取新页面的链接（使用原始选择的区域）
          debugLog(`[BatchScrape] 开始提取第 ${currentPage + 1} 页链接`)
          const extractResult = await sendToBackground<
            { tabId: number; linkContainerSelector?: string },
            { success: boolean; links?: ExtractedLink[]; error?: string }
          >({
            name: 'extractLinksFromPage',
            body: {
              tabId,
              linkContainerSelector,
            },
          })

          if (!extractResult.success || !extractResult.links?.length) {
            debugLog(`[BatchScrape] 第 ${currentPage + 1} 页提取失败:`, extractResult.error || '无链接')
            break
          }

          // 过滤掉已抓取的链接
          const existingUrls = new Set(allResults.map((r) => r.url))
          const newLinks = extractResult.links.filter((l) => !existingUrls.has(l.url))
          debugLog(`[BatchScrape] 第 ${currentPage + 1} 页: 提取 ${extractResult.links.length} 个, 新增 ${newLinks.length} 个`)

          if (newLinks.length === 0) {
            debugLog(`[BatchScrape] 第 ${currentPage + 1} 页没有新链接，停止分页`)
            break
          }
          linksToScrape = newLinks
          currentPage++
        }

        setResults(allResults)
        setMode('completed')
        setPaginationProgress(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : '抓取过程中发生错误')
        setMode('error')
        setPaginationProgress(null)
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
    isCancelledRef.current = true
    controllerRef.current?.cancel()
    setMode('idle')
    setProgress(null)
    setPaginationProgress(null)
  }, [])

  // 重置状态
  const reset = useCallback(() => {
    isCancelledRef.current = true
    controllerRef.current?.cancel()
    controllerRef.current = null
    setMode('idle')
    setElementInfo(null)
    setLinksState([])
    setProgress(null)
    setResults([])
    setError(null)
    setPaginationProgress(null)
  }, [])

  return {
    mode,
    elementInfo,
    links,
    progress,
    results,
    error,
    paginationProgress,
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
