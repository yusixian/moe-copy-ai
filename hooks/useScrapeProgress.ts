import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useCallback, useRef, useState } from "react"

import type { FilterMode, FilterTarget } from "~constants/link-filter-presets"
import type {
  BatchProgress,
  BatchScrapeResult,
  ExtractedLink,
  ScrapeStrategyType
} from "~constants/types"
import {
  BatchScrapeController,
  type ExtendedBatchScrapeOptions
} from "~utils/batch-scraper"
import { useI18n } from "~utils/i18n"
import { debugLog } from "~utils/logger"

export interface LinkFilterConfig {
  pattern: string
  target: FilterTarget
  mode: FilterMode
}

interface PaginationProgress {
  currentPage: number
  maxPages: number
  isLoadingNextPage: boolean
  currentUrl?: string
}

interface ScrapeProgressCallbacks {
  onModeChange: (mode: "scraping" | "completed" | "error" | "idle") => void
  onError: (error: string | null) => void
}

const storage = new Storage({ area: "sync" })

/**
 * Hook for managing scrape progress and execution
 */
export function useScrapeProgress(callbacks: ScrapeProgressCallbacks) {
  const { t } = useI18n()
  const { onModeChange, onError } = callbacks

  const [progress, setProgress] = useState<BatchProgress | null>(null)
  const [results, setResults] = useState<BatchScrapeResult[]>([])
  const [paginationProgress, setPaginationProgress] =
    useState<PaginationProgress | null>(null)

  const controllerRef = useRef<BatchScrapeController | null>(null)
  const isCancelledRef = useRef(false)

  const applyFilter = useCallback(
    (
      links: ExtractedLink[],
      filterConfig?: LinkFilterConfig
    ): ExtractedLink[] => {
      if (!filterConfig?.pattern?.trim()) {
        return links
      }

      try {
        const regex = new RegExp(filterConfig.pattern, "i")
        return links.filter((link) => {
          let matches = false
          switch (filterConfig.target) {
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
          return filterConfig.mode === "include" ? matches : !matches
        })
      } catch {
        return links
      }
    },
    []
  )

  const startScrape = useCallback(
    async (
      selectedLinks: ExtractedLink[],
      nextPageXPath?: string,
      linkContainerSelector?: string,
      filterConfig?: LinkFilterConfig,
      options: Partial<ExtendedBatchScrapeOptions> = {}
    ) => {
      if (selectedLinks.length === 0) {
        onError(t("batch.error.noLinks"))
        return
      }

      onModeChange("scraping")
      onError(null)
      setResults([])
      setPaginationProgress(null)
      isCancelledRef.current = false

      // Read user config from storage
      const concurrency =
        (await storage.get<string>("batch_concurrency")) || "2"
      const delay = (await storage.get<string>("batch_delay")) || "500"
      const timeout = (await storage.get<string>("batch_timeout")) || "30000"
      const retryCount = (await storage.get<string>("batch_retry")) || "1"
      const strategy =
        (await storage.get<ScrapeStrategyType>("batch_strategy")) || "fetch"
      const maxPages = parseInt(
        (await storage.get<string>("pagination_max_pages")) || "10",
        10
      )
      const delayBetweenPages = parseInt(
        (await storage.get<string>("pagination_delay")) || "2000",
        10
      )

      const mergedOptions: ExtendedBatchScrapeOptions = {
        concurrency: parseInt(concurrency, 10),
        delayBetweenRequests: parseInt(delay, 10),
        timeout: parseInt(timeout, 10),
        retryCount: parseInt(retryCount, 10),
        strategy,
        ...options
      }

      const paginationEnabled = !!nextPageXPath
      debugLog("[BatchScrape] Pagination config:", {
        enabled: paginationEnabled,
        xpath: nextPageXPath
      })

      const allResults: BatchScrapeResult[] = []
      let currentPage = 1
      let linksToScrape = selectedLinks

      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true
        })
        const tabId = tab?.id

        while (true) {
          if (isCancelledRef.current) {
            debugLog("[BatchScrape] User cancelled")
            break
          }

          debugLog(
            `[BatchScrape] Page ${currentPage} starting, links to scrape: ${linksToScrape.length}`
          )

          if (paginationEnabled && tabId !== undefined) {
            const currentTab = await chrome.tabs.get(tabId)
            setPaginationProgress({
              currentPage,
              maxPages,
              isLoadingNextPage: false,
              currentUrl: currentTab?.url
            })
          }

          const controller = new BatchScrapeController(mergedOptions)
          controllerRef.current = controller

          const pageResults = await controller.execute(linksToScrape, (p) => {
            setProgress({
              ...p,
              total: p.total + allResults.length,
              completed: p.completed + allResults.length
            })
          })

          allResults.push(...pageResults)
          setResults([...allResults])

          if (!paginationEnabled || !tabId) {
            break
          }

          if (maxPages > 0 && currentPage >= maxPages) {
            debugLog(`[BatchScrape] Reached max pages: ${maxPages}`)
            break
          }

          setPaginationProgress((prev) => ({
            currentPage,
            maxPages,
            isLoadingNextPage: true,
            currentUrl: prev?.currentUrl
          }))

          await new Promise((resolve) => setTimeout(resolve, delayBetweenPages))

          if (isCancelledRef.current) break

          debugLog("[BatchScrape] Clicking next page")
          const clickResult = await sendToBackground<
            { tabId: number; nextPageXPath: string },
            { success: boolean; hasNextPage: boolean; error?: string }
          >({
            name: "clickNextPage",
            body: {
              tabId,
              nextPageXPath: nextPageXPath as string
            }
          })

          debugLog("[BatchScrape] Next page click result:", clickResult)
          if (!clickResult.success || !clickResult.hasNextPage) {
            debugLog("[BatchScrape] No next page or click failed")
            break
          }

          await new Promise((resolve) => setTimeout(resolve, 1000))

          if (isCancelledRef.current) break

          debugLog(
            `[BatchScrape] Extracting links from page ${currentPage + 1}`
          )
          const extractResult = await sendToBackground<
            { tabId: number; linkContainerSelector?: string },
            { success: boolean; links?: ExtractedLink[]; error?: string }
          >({
            name: "extractLinksFromPage",
            body: {
              tabId,
              linkContainerSelector
            }
          })

          if (!extractResult.success || !extractResult.links?.length) {
            debugLog(
              `[BatchScrape] Page ${currentPage + 1} extraction failed:`,
              extractResult.error || "No links"
            )
            break
          }

          const filteredByRegex = applyFilter(extractResult.links, filterConfig)
          debugLog(
            `[BatchScrape] Page ${currentPage + 1}: ${filteredByRegex.length}/${extractResult.links.length} after regex filter`
          )

          const existingUrls = new Set(allResults.map((r) => r.url))
          const newLinks = filteredByRegex.filter(
            (l) => !existingUrls.has(l.url)
          )
          debugLog(
            `[BatchScrape] Page ${currentPage + 1}: extracted ${extractResult.links.length}, filtered ${filteredByRegex.length}, new ${newLinks.length}`
          )

          if (newLinks.length === 0) {
            debugLog(
              `[BatchScrape] Page ${currentPage + 1} has no new links, stopping pagination`
            )
            break
          }
          linksToScrape = newLinks
          currentPage++
        }

        setResults(allResults)
        onModeChange("completed")
        setPaginationProgress(null)
      } catch (err) {
        onError(
          err instanceof Error ? err.message : t("batch.error.scrapeError")
        )
        onModeChange("error")
        setPaginationProgress(null)
      }
    },
    [applyFilter, onModeChange, onError, t]
  )

  const pauseScrape = useCallback(() => {
    controllerRef.current?.pause()
    setProgress((prev) => (prev ? { ...prev, isPaused: true } : null))
  }, [])

  const resumeScrape = useCallback(() => {
    controllerRef.current?.resume()
    setProgress((prev) => (prev ? { ...prev, isPaused: false } : null))
  }, [])

  const cancelScrape = useCallback(() => {
    isCancelledRef.current = true
    controllerRef.current?.cancel()
    onModeChange("idle")
    setProgress(null)
    setPaginationProgress(null)
  }, [onModeChange])

  const resetProgress = useCallback(() => {
    isCancelledRef.current = true
    controllerRef.current?.cancel()
    controllerRef.current = null
    setProgress(null)
    setResults([])
    setPaginationProgress(null)
  }, [])

  return {
    progress,
    results,
    paginationProgress,
    startScrape,
    pauseScrape,
    resumeScrape,
    cancelScrape,
    resetProgress
  }
}

export default useScrapeProgress
