import { useCallback, useState } from "react"

import type {
  BatchScrapeMode,
  ExtractedLink,
  SelectedElementInfo
} from "~constants/types"

/**
 * Hook for managing link list state (CRUD operations)
 */
export function useLinkList() {
  const [mode, setMode] = useState<BatchScrapeMode>("idle")
  const [elementInfo, setElementInfo] = useState<SelectedElementInfo | null>(
    null
  )
  const [links, setLinksState] = useState<ExtractedLink[]>([])

  const setLinks = useCallback(
    (info: SelectedElementInfo | null, extractedLinks: ExtractedLink[]) => {
      setElementInfo(info)
      setLinksState(extractedLinks)
      setMode(extractedLinks.length > 0 ? "previewing" : "idle")
    },
    []
  )

  const addLink = useCallback((url: string, text?: string) => {
    setLinksState((prev) => {
      const maxIndex =
        prev.length > 0 ? Math.max(...prev.map((l) => l.index)) : -1
      const newLink: ExtractedLink = {
        url,
        text: text || url,
        index: maxIndex + 1
      }
      return [...prev, newLink]
    })
    setMode("previewing")
  }, [])

  const updateLink = useCallback((index: number, url: string, text: string) => {
    setLinksState((prev) =>
      prev.map((link) => (link.index === index ? { ...link, url, text } : link))
    )
  }, [])

  const removeLink = useCallback((index: number) => {
    setLinksState((prev) => {
      const newLinks = prev.filter((link) => link.index !== index)
      if (newLinks.length === 0) {
        setMode("idle")
      }
      return newLinks
    })
  }, [])

  const clearLinks = useCallback(() => {
    setLinksState([])
    setElementInfo(null)
    setMode("idle")
  }, [])

  return {
    mode,
    setMode,
    elementInfo,
    links,
    setLinks,
    addLink,
    updateLink,
    removeLink,
    clearLinks
  }
}

export default useLinkList
