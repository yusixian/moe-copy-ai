import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react"

import type {
  BatchProgress,
  BatchScrapeMode,
  BatchScrapeResult,
  ExtractedLink,
  NextPageButtonInfo,
  SelectedElementInfo
} from "~constants/types"
import useBatchScrape, { type LinkFilterConfig } from "~hooks/useBatchScrape"
import useElementSelector from "~hooks/useElementSelector"
import type { ExtendedBatchScrapeOptions } from "~utils/batch-scraper"

interface PaginationProgress {
  currentPage: number
  maxPages: number
  isLoadingNextPage: boolean
  currentUrl?: string
}

interface BatchScrapeContextValue {
  // State
  mode: BatchScrapeMode
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  progress: BatchProgress | null
  results: BatchScrapeResult[]
  error: string | null
  paginationProgress: PaginationProgress | null
  nextPageButton: NextPageButtonInfo | null
  isSelectingNextPage: boolean
  isSelecting: boolean

  // Link operations
  setLinks: (info: SelectedElementInfo | null, links: ExtractedLink[]) => void
  addLink: (url: string, text?: string) => void
  updateLink: (index: number, url: string, text: string) => void
  removeLink: (index: number) => void

  // Scrape operations
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

  // UI operations
  handleSelectElement: () => void
  handleSelectNextPage: () => void
  handleClearNextPage: () => void
  handleCancel: () => void
  handleReset: () => void
}

const BatchScrapeContext = createContext<BatchScrapeContextValue | null>(null)

interface BatchScrapeProviderProps {
  children: ReactNode
}

export function BatchScrapeProvider({ children }: BatchScrapeProviderProps) {
  const [isSelectingNextPage, setIsSelectingNextPage] = useState(false)

  const {
    isSelecting,
    elementInfo: selectorElementInfo,
    extractedLinks,
    nextPageButton,
    activateSelector,
    deactivateSelector,
    clearSelection,
    clearNextPageButton
  } = useElementSelector()

  const {
    mode,
    elementInfo: scrapeElementInfo,
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
  } = useBatchScrape()

  // Sync extracted links from selector to batch scrape
  useEffect(() => {
    if (selectorElementInfo && extractedLinks.length > 0) {
      setLinks(selectorElementInfo, extractedLinks)
    }
  }, [selectorElementInfo, extractedLinks, setLinks])

  // Reset isSelectingNextPage when selection completes
  useEffect(() => {
    if (!isSelecting && isSelectingNextPage) {
      setIsSelectingNextPage(false)
    }
  }, [isSelecting, isSelectingNextPage])

  // Combined mode considering selector state
  const currentMode: BatchScrapeMode = useMemo(() => {
    return isSelecting && !isSelectingNextPage ? "selecting" : mode
  }, [isSelecting, isSelectingNextPage, mode])

  // Combined element info
  const elementInfo = selectorElementInfo || scrapeElementInfo

  // UI handlers
  const handleSelectElement = useCallback(() => {
    setIsSelectingNextPage(false)
    activateSelector()
  }, [activateSelector])

  const handleSelectNextPage = useCallback(() => {
    setIsSelectingNextPage(true)
    activateSelector("next-page-button")
  }, [activateSelector])

  const handleClearNextPage = useCallback(() => {
    clearNextPageButton()
  }, [clearNextPageButton])

  const handleCancel = useCallback(() => {
    if (isSelecting) {
      deactivateSelector()
      setIsSelectingNextPage(false)
    } else {
      cancelScrape()
    }
  }, [isSelecting, deactivateSelector, cancelScrape])

  const handleReset = useCallback(() => {
    clearSelection()
    clearNextPageButton()
    reset()
  }, [clearSelection, clearNextPageButton, reset])

  const value = useMemo(
    (): BatchScrapeContextValue => ({
      mode: currentMode,
      elementInfo,
      links,
      progress,
      results,
      error,
      paginationProgress,
      nextPageButton,
      isSelectingNextPage: isSelectingNextPage && isSelecting,
      isSelecting,
      setLinks,
      addLink,
      updateLink,
      removeLink,
      startScrape,
      pauseScrape,
      resumeScrape,
      cancelScrape,
      handleSelectElement,
      handleSelectNextPage,
      handleClearNextPage,
      handleCancel,
      handleReset
    }),
    [
      currentMode,
      elementInfo,
      links,
      progress,
      results,
      error,
      paginationProgress,
      nextPageButton,
      isSelectingNextPage,
      isSelecting,
      setLinks,
      addLink,
      updateLink,
      removeLink,
      startScrape,
      pauseScrape,
      resumeScrape,
      cancelScrape,
      handleSelectElement,
      handleSelectNextPage,
      handleClearNextPage,
      handleCancel,
      handleReset
    ]
  )

  return (
    <BatchScrapeContext.Provider value={value}>
      {children}
    </BatchScrapeContext.Provider>
  )
}

export function useBatchScrapeContext(): BatchScrapeContextValue {
  const context = useContext(BatchScrapeContext)
  if (!context) {
    throw new Error(
      "useBatchScrapeContext must be used within a BatchScrapeProvider"
    )
  }
  return context
}

export default BatchScrapeContext
