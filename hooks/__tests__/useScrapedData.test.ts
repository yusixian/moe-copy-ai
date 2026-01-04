import { renderHook, act } from "@testing-library/react-hooks"
import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useScrapedData } from "~hooks/useScrapedData"
import type { ScrapedContent, ScrapeResponse } from "~constants/types"

// Mock dependencies
jest.mock("@plasmohq/messaging")
jest.mock("@plasmohq/storage")
jest.mock("~utils/formatter", () => ({
  formatContent: jest.fn((content) => `formatted: ${content}`)
}))
jest.mock("~utils", () => ({
  detectMarkdown: jest.fn((content) => content.includes("```"))
}))
jest.mock("~utils/logger", () => ({
  logger: {
    debug: jest.fn()
  }
}))

describe("useScrapedData", () => {
  const mockSendToBackground = sendToBackground as jest.MockedFunction<
    typeof sendToBackground
  >
  const mockStorage = {
    get: jest.fn(),
    set: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(Storage as jest.MockedClass<typeof Storage>).mockImplementation(
      () => mockStorage as any
    )
    mockStorage.get.mockResolvedValue(null)

    // Mock document.querySelector for selector validation
    document.querySelector = jest.fn()
  })

  const createMockScrapedData = (
    overrides: Partial<ScrapedContent> = {}
  ): ScrapedContent => ({
    title: "Test Title",
    author: "Test Author",
    publishDate: "2024-01-01",
    url: "https://example.com",
    articleContent: "Test content",
    cleanedContent: "Test content",
    metadata: {},
    images: [],
    ...overrides
  })

  const createMockScrapeResponse = (
    data?: Partial<ScrapedContent>,
    success = true
  ): ScrapeResponse => ({
    success,
    data: success ? createMockScrapedData(data) : undefined,
    error: success ? undefined : "Scrape failed"
  })

  describe("initialization", () => {
    test("should initialize with loading state", () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result } = renderHook(() => useScrapedData())

      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBeNull()
      expect(result.current.scrapedData).toBeNull()
    })

    test("should load default selectors on mount", async () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      expect(result.current.contentSelectors).toBeDefined()
      expect(result.current.authorSelectors).toBeDefined()
      expect(result.current.dateSelectors).toBeDefined()
      expect(result.current.titleSelectors).toBeDefined()
    })

    test("should handle storage errors gracefully", async () => {
      mockStorage.get.mockRejectedValue(new Error("Storage error"))
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      // Should still have default selectors
      expect(result.current.contentSelectors).toBeDefined()
    })
  })

  describe("fetchScrapedContent", () => {
    test("should fetch scraped content successfully", async () => {
      const mockData = createMockScrapedData({
        title: "Fetched Title",
        articleContent: "Fetched content"
      })

      mockSendToBackground.mockResolvedValue({
        success: true,
        data: mockData
      } as any)

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      expect(result.current.isLoading).toBe(false)
      expect(result.current.scrapedData).toBeDefined()
      expect(result.current.scrapedData?.title).toBe("Fetched Title")
      expect(result.current.error).toBeNull()
    })

    test("should handle fetch errors", async () => {
      mockSendToBackground.mockResolvedValue({
        success: false,
        error: "Network error"
      } as any)

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe("Network error")
      expect(result.current.scrapedData).toBeNull()
    })

    test("should format article content", async () => {
      const mockData = createMockScrapedData({
        articleContent: "Raw content"
      })

      mockSendToBackground.mockResolvedValue({
        success: true,
        data: mockData
      } as any)

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      expect(result.current.scrapedData?.articleContent).toBe(
        "formatted: Raw content"
      )
    })

    test("should detect markdown content", async () => {
      const mockData = createMockScrapedData({
        articleContent: "```javascript\ncode\n```"
      })

      mockSendToBackground.mockResolvedValue({
        success: true,
        data: mockData
      } as any)

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      expect(result.current.isMarkdown).toBe(true)
    })

    test("should handle refresh (manual fetch)", async () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      // Clear mock to track new calls
      mockSendToBackground.mockClear()
      mockSendToBackground.mockResolvedValue({
        success: true,
        data: createMockScrapedData({ title: "Refreshed" })
      } as any)

      await act(async () => {
        await result.current.handleRefresh()
      })

      expect(mockSendToBackground).toHaveBeenCalled()
      expect(result.current.scrapedData?.title).toBe("Refreshed")
    })

    test("should send custom selectors to background", async () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      mockSendToBackground.mockClear()
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      await act(async () => {
        await result.current.handleRefresh({ content: ".custom-selector" })
      })

      expect(mockSendToBackground).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            selectors: { content: ".custom-selector" }
          }
        })
      )
    })

    test("should handle selector results from response", async () => {
      const mockData = createMockScrapedData()
      const selectorResults = {
        content: [
          { selector: ".content", content: "Content 1", allContent: [] }
        ],
        author: [{ selector: ".author", content: "Author 1", allContent: [] }],
        date: [{ selector: ".date", content: "Date 1", allContent: [] }],
        title: [{ selector: ".title", content: "Title 1", allContent: [] }]
      }

      mockSendToBackground.mockResolvedValue({
        success: true,
        data: { ...mockData, selectorResults }
      } as any)

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      expect(result.current.scrapedData).toBeDefined()
    })

    test("should handle exception during fetch", async () => {
      mockSendToBackground.mockRejectedValue(new Error("Network failure"))

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      expect(result.current.error).toContain("Network failure")
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe("handleSelectorChange", () => {
    beforeEach(() => {
      // Make querySelector succeed by default
      ;(document.querySelector as jest.Mock).mockReturnValue({})
    })

    test("should change selected selector index", async () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      act(() => {
        result.current.handleSelectorChange("content", 1)
      })

      expect(result.current.selectedSelectorIndices.content).toBe(1)
    })

    test("should validate selector before using", async () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      // Make querySelector throw for invalid selector
      ;(document.querySelector as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid selector")
      })

      act(() => {
        result.current.handleSelectorChange("content", 0)
      })

      // Should set invalid selector message
      expect(result.current.scrapedData?.articleContent).toBe(
        "无效的选择器"
      )
    })

    // Removed: Over-mocked test that only verified mock setup, not real caching behavior

    test("should handle empty selector results", async () => {
      const selectorResults = {
        content: [
          { selector: ".empty", content: "", allContent: [] }
        ],
        author: [],
        date: [],
        title: []
      }

      mockSendToBackground.mockResolvedValue({
        success: true,
        data: {
          ...createMockScrapedData(),
          selectorResults
        }
      } as any)

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      mockSendToBackground.mockClear()
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      // Set content selectors to include our empty selector
      mockStorage.get.mockImplementation((key: string) => {
        if (key === "custom_content_selectors") {
          return Promise.resolve([".empty"])
        }
        return Promise.resolve(null)
      })

      const { result: result2, waitForNextUpdate: waitForNextUpdate2 } =
        renderHook(() => useScrapedData())

      await waitForNextUpdate2()

      mockSendToBackground.mockClear()

      await act(async () => {
        result2.current.handleSelectorChange("content", 0)
        await new Promise((resolve) => setTimeout(resolve, 0))
      })

      // Should attempt to re-fetch
      expect(mockSendToBackground).toHaveBeenCalled()
    })

  })

  describe("handleSelectContent", () => {
    test("should select specific content from selector results", async () => {
      const selectorResults = {
        content: [
          {
            selector: ".content",
            content: "Content 1",
            allContent: ["Content 1", "Content 2", "Content 3"]
          }
        ],
        author: [],
        date: [],
        title: []
      }

      mockSendToBackground.mockResolvedValue({
        success: true,
        data: {
          ...createMockScrapedData(),
          selectorResults
        }
      } as any)

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      act(() => {
        result.current.handleSelectContent("content", ".content", 1)
      })

      // articleContent gets raw content, cleanedContent gets formatted
      expect(result.current.scrapedData?.articleContent).toBe("Content 2")
      expect(result.current.scrapedData?.cleanedContent).toBe(
        "formatted: Content 2"
      )
    })

    // Removed: Fake tests with meaningless "should not crash" assertions
    // These only checked toBeDefined/toBeNull without testing actual error handling
  })

  describe("getSelectorsForType", () => {
    test("should return selectors for given type", async () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      const contentSelectors = result.current.getSelectorsForType("content")
      expect(Array.isArray(contentSelectors)).toBe(true)
      expect(contentSelectors.length).toBeGreaterThan(0)
    })

    test("should return empty array for invalid type", async () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      const selectors = result.current.getSelectorsForType(
        "invalid" as any
      )
      expect(selectors).toEqual([])
    })
  })

  describe("debugInfo", () => {
    test("should accumulate debug messages", async () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      expect(result.current.debugInfo).toBeTruthy()
      expect(typeof result.current.debugInfo).toBe("string")
    })
  })

  describe("selectedSelectorIndices", () => {
    test("should initialize with all indices at 0", async () => {
      mockSendToBackground.mockResolvedValue(
        createMockScrapeResponse() as any
      )

      const { result, waitForNextUpdate } = renderHook(() => useScrapedData())

      await waitForNextUpdate()

      expect(result.current.selectedSelectorIndices).toEqual({
        content: 0,
        author: 0,
        date: 0,
        title: 0
      })
    })
  })
})
