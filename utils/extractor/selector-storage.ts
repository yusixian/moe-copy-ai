import { Storage } from "@plasmohq/storage"

import {
  AUTHOR_SELECTORS,
  CONTENT_SELECTORS,
  DATE_SELECTORS,
  TITLE_SELECTORS
} from "../../constants/config"
import { debugLog } from "../logger"

export type SelectorType = "content" | "author" | "date" | "title"

const STORAGE_KEYS: Record<SelectorType, string> = {
  content: "custom_content_selectors",
  author: "custom_author_selectors",
  date: "custom_date_selectors",
  title: "custom_title_selectors"
}

const DEFAULT_SELECTORS: Record<SelectorType, readonly string[]> = {
  content: CONTENT_SELECTORS,
  author: AUTHOR_SELECTORS,
  date: DATE_SELECTORS,
  title: TITLE_SELECTORS
}

const storage = new Storage({ area: "sync" })

export type SelectorConfig = {
  selectors: string[]
  selectedSelector?: string
}

export async function getSelectors(
  type: SelectorType,
  customSelector?: string
): Promise<SelectorConfig> {
  if (customSelector) {
    debugLog(`Using specified ${type} selector: ${customSelector}`)
    return { selectors: [customSelector], selectedSelector: customSelector }
  }

  try {
    const customSelectors = await storage.get<string[]>(STORAGE_KEYS[type])
    if (customSelectors?.length) {
      debugLog(`Using custom ${type} selectors:`, customSelectors)
      return { selectors: customSelectors }
    }
  } catch (error) {
    debugLog(`Error getting custom ${type} selectors:`, error)
  }

  debugLog(`Using default ${type} selectors`)
  return { selectors: [...DEFAULT_SELECTORS[type]] }
}
