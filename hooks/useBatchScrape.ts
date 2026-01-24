import { useCallback, useState } from "react"

import type { FilterMode, FilterTarget } from "~constants/link-filter-presets"
import type {
  BatchProgress,
  BatchScrapeMode,
  BatchScrapeResult,
  ExtractedLink,
  SelectedElementInfo
} from "~constants/types"
import type { ExtendedBatchScrapeOptions } from "~utils/batch-scraper"

import useLinkList from "./useLinkList"
import useScrapeProgress, { type LinkFilterConfig } from "./useScrapeProgress"

// Re-export for backwards compatibility
export type { LinkFilterConfig }

interface PaginationProgress {
  currentPage: number
  maxPages: number
  isLoadingNextPage: boolean
  currentUrl?: string
}

interface UseBatchScrapeReturn {
  // State
  mode: BatchScrapeMode
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  progress: BatchProgress | null
  results: BatchScrapeResult[]
  error: string | null
  paginationProgress: PaginationProgress | null

  // Operations
  setLinks: (info: SelectedElementInfo | null, links: ExtractedLink[]) => void
  addLink: (url: string, text?: string) => void
  updateLink: (index: number, url: string, text: string) => void
  removeLink: (index: number) => void
  startScrape: (
    selectedLinks: ExtractedLink[],
    nextPageXPath?: string,
    linkContainerSelector?: string,
    filterConfig?: LinkFilterConfig,
    options?: Partial<ExtendedBatchScrapeOptions>
  ) => Promise<void>
  pauseScrape: () => void
  resumeScrape: () => void
  cancelScrape: () => void
  reset: () => void
}

/**
 * Batch scrape hook - manages complete batch scraping workflow
 * Composed from useLinkList and useScrapeProgress hooks
 */
export function useBatchScrape(): UseBatchScrapeReturn {
  const [error, setError] = useState<string | null>(null)

  const {
    mode,
    setMode,
    elementInfo,
    links,
    setLinks,
    addLink,
    updateLink,
    removeLink,
    clearLinks
  } = useLinkList()

  const handleModeChange = useCallback(
    (newMode: "scraping" | "completed" | "error" | "idle") => {
      setMode(newMode)
    },
    [setMode]
  )

  const handleError = useCallback((err: string | null) => {
    setError(err)
  }, [])

  const {
    progress,
    results,
    paginationProgress,
    startScrape,
    pauseScrape,
    resumeScrape,
    cancelScrape,
    resetProgress
  } = useScrapeProgress({
    onModeChange: handleModeChange,
    onError: handleError
  })

  const reset = useCallback(() => {
    clearLinks()
    resetProgress()
    setError(null)
  }, [clearLinks, resetProgress])

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
    reset
  }
}

export default useBatchScrape
