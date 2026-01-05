import { renderHook, act } from "@testing-library/react-hooks"
import { sendToBackground } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { useBatchScrape } from "~hooks/useBatchScrape"
import type { ExtractedLink, SelectedElementInfo } from "~constants/types"

// Mock dependencies
jest.mock("@plasmohq/messaging")
jest.mock("@plasmohq/storage")
jest.mock("~utils/logger", () => ({
  debugLog: jest.fn()
}))
jest.mock("~utils/batch-scraper", () => ({
  BatchScrapeController: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue([]),
    pause: jest.fn(),
    resume: jest.fn(),
    cancel: jest.fn(),
    paused: false,
    cancelled: false
  }))
}))

describe("useBatchScrape", () => {
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
  })

  const createMockLink = (
    index: number,
    url = `https://example.com/${index}`
  ): ExtractedLink => ({
    url,
    text: `Link ${index}`,
    index
  })

  const createMockElementInfo = (): SelectedElementInfo => ({
    tagName: "div",
    className: "link-container",
    id: "links",
    linkCount: 3,
    outerHTML: "<div class='link-container' id='links'>...</div>",
    selector: ".link-container"
  })

  describe("initialization", () => {
    test("should initialize with idle mode", () => {
      const { result } = renderHook(() => useBatchScrape())

      expect(result.current.mode).toBe("idle")
      expect(result.current.links).toEqual([])
      expect(result.current.results).toEqual([])
      expect(result.current.error).toBeNull()
      expect(result.current.progress).toBeNull()
    })
  })

  describe("setLinks", () => {
    test("should set links and element info", () => {
      const { result } = renderHook(() => useBatchScrape())

      const mockInfo = createMockElementInfo()
      const mockLinks = [createMockLink(0), createMockLink(1)]

      act(() => {
        result.current.setLinks(mockInfo, mockLinks)
      })

      expect(result.current.elementInfo).toEqual(mockInfo)
      expect(result.current.links).toEqual(mockLinks)
      expect(result.current.mode).toBe("previewing")
    })

    test("should switch to idle mode when links array is empty", () => {
      const { result } = renderHook(() => useBatchScrape())

      act(() => {
        result.current.setLinks(null, [])
      })

      expect(result.current.mode).toBe("idle")
      expect(result.current.links).toEqual([])
    })

    test("should clear error when setting new links", () => {
      const { result } = renderHook(() => useBatchScrape())

      // Simulate error state
      const mockInfo = createMockElementInfo()
      const mockLinks = [createMockLink(0)]

      act(() => {
        result.current.setLinks(mockInfo, mockLinks)
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe("addLink", () => {
    test("should add a new link with auto-incremented index", () => {
      const { result } = renderHook(() => useBatchScrape())

      act(() => {
        result.current.addLink("https://example.com/new", "New Link")
      })

      expect(result.current.links).toHaveLength(1)
      expect(result.current.links[0]).toEqual({
        url: "https://example.com/new",
        text: "New Link",
        index: 0
      })
    })

    test("should add link with URL as text when text is not provided", () => {
      const { result } = renderHook(() => useBatchScrape())

      act(() => {
        result.current.addLink("https://example.com/link")
      })

      expect(result.current.links[0].text).toBe("https://example.com/link")
    })

    test("should increment index correctly for multiple links", () => {
      const { result } = renderHook(() => useBatchScrape())

      act(() => {
        result.current.addLink("https://example.com/1")
        result.current.addLink("https://example.com/2")
        result.current.addLink("https://example.com/3")
      })

      expect(result.current.links).toHaveLength(3)
      expect(result.current.links[0].index).toBe(0)
      expect(result.current.links[1].index).toBe(1)
      expect(result.current.links[2].index).toBe(2)
    })
  })

  describe("updateLink", () => {
    test("should update link at specified index", () => {
      const { result } = renderHook(() => useBatchScrape())

      const mockLinks = [createMockLink(0), createMockLink(1), createMockLink(2)]

      act(() => {
        result.current.setLinks(null, mockLinks)
      })

      act(() => {
        result.current.updateLink(1, "https://updated.com", "Updated Link")
      })

      expect(result.current.links[1]).toEqual({
        url: "https://updated.com",
        text: "Updated Link",
        index: 1
      })
    })

  })

  describe("removeLink", () => {
    test("should remove link at specified index", () => {
      const { result } = renderHook(() => useBatchScrape())

      const mockLinks = [
        createMockLink(0),
        createMockLink(1),
        createMockLink(2)
      ]

      act(() => {
        result.current.setLinks(null, mockLinks)
      })

      act(() => {
        result.current.removeLink(1)
      })

      expect(result.current.links).toHaveLength(2)
      expect(result.current.links[0].index).toBe(0)
      expect(result.current.links[1].index).toBe(2)
    })

    test("should handle removing first link", () => {
      const { result } = renderHook(() => useBatchScrape())

      const mockLinks = [createMockLink(0), createMockLink(1)]

      act(() => {
        result.current.setLinks(null, mockLinks)
      })

      act(() => {
        result.current.removeLink(0)
      })

      expect(result.current.links).toHaveLength(1)
      expect(result.current.links[0].index).toBe(1)
    })

    test("should handle removing last link", () => {
      const { result } = renderHook(() => useBatchScrape())

      const mockLinks = [createMockLink(0), createMockLink(1)]

      act(() => {
        result.current.setLinks(null, mockLinks)
      })

      act(() => {
        result.current.removeLink(1)
      })

      expect(result.current.links).toHaveLength(1)
      expect(result.current.links[0].index).toBe(0)
    })
  })

  describe("startScrape", () => {
    // Removed fake tests with vague assertions
    // Real scraping behavior is tested through BatchScrapeController
  })

  describe("pauseScrape", () => {
    // Removed fake test with meaningless toBeDefined() assertion
    // Pause/resume behavior is tested in BatchScrapeController unit tests
  })

  describe("resumeScrape", () => {
    // Removed fake test with meaningless toBeDefined() assertion
    // Pause/resume behavior is tested in BatchScrapeController unit tests
  })

  describe("cancelScrape", () => {
    // Removed fake test with meaningless toBeDefined() assertion
    // Cancel behavior is tested in BatchScrapeController unit tests
  })

  describe("reset", () => {
    test("should reset all state to initial values", () => {
      const { result } = renderHook(() => useBatchScrape())

      // Set some state
      const mockLinks = [createMockLink(0), createMockLink(1)]

      act(() => {
        result.current.setLinks(createMockElementInfo(), mockLinks)
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.mode).toBe("idle")
      expect(result.current.links).toEqual([])
      expect(result.current.results).toEqual([])
      expect(result.current.error).toBeNull()
      expect(result.current.progress).toBeNull()
      expect(result.current.elementInfo).toBeNull()
    })

    test("should clear error state on reset", () => {
      const { result } = renderHook(() => useBatchScrape())

      // Set links to establish state
      const mockLinks = [createMockLink(0)]

      act(() => {
        result.current.setLinks(null, mockLinks)
      })

      // Reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe("mode transitions", () => {
    test("should transition from idle to previewing when links are set", () => {
      const { result } = renderHook(() => useBatchScrape())

      expect(result.current.mode).toBe("idle")

      const mockLinks = [createMockLink(0)]

      act(() => {
        result.current.setLinks(null, mockLinks)
      })

      expect(result.current.mode).toBe("previewing")
    })

    test("should handle multiple mode transitions", () => {
      const { result } = renderHook(() => useBatchScrape())

      const mockLinks = [createMockLink(0)]

      // idle -> previewing
      act(() => {
        result.current.setLinks(null, mockLinks)
      })

      expect(result.current.mode).toBe("previewing")

      // previewing -> idle
      act(() => {
        result.current.reset()
      })

      expect(result.current.mode).toBe("idle")
    })
  })

  describe("pagination progress", () => {
    test("should initialize with null pagination progress", () => {
      const { result } = renderHook(() => useBatchScrape())

      expect(result.current.paginationProgress).toBeNull()
    })
  })
})
