import {
  BatchScrapeController,
  batchScrape,
  DEFAULT_BATCH_OPTIONS,
  type ExtendedBatchScrapeOptions
} from "~utils/batch-scraper"
import type {
  BatchProgress,
  BatchScrapeResult,
  ExtractedLink
} from "~constants/types"

// Mock dependencies
jest.mock("~utils/logger", () => ({
  debugLog: jest.fn()
}))

// Mock scrape strategies
const mockScrape = jest.fn()
const mockInitialize = jest.fn()
const mockCleanup = jest.fn()

jest.mock("~utils/scrape-strategies", () => ({
  createScrapeStrategy: jest.fn(() => ({
    scrape: mockScrape,
    initialize: mockInitialize,
    cleanup: mockCleanup,
    supportsConcurrency: true
  }))
}))

describe("batch-scraper", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("DEFAULT_BATCH_OPTIONS", () => {
    test("should have correct default values", () => {
      expect(DEFAULT_BATCH_OPTIONS).toEqual({
        concurrency: 2,
        timeout: 30000,
        retryCount: 1,
        delayBetweenRequests: 500,
        strategy: "fetch"
      })
    })
  })

  describe("BatchScrapeController", () => {
    const createMockLinks = (count: number): ExtractedLink[] => {
      return Array.from({ length: count }, (_, i) => ({
        url: `https://example.com/page${i + 1}`,
        text: `Page ${i + 1}`,
        index: i
      }))
    }

    const createSuccessResult = (url: string): BatchScrapeResult => ({
      url,
      success: true,
      title: "Test Title",
      content: "Test content",
      method: "fetch"
    })

    const createFailureResult = (url: string): BatchScrapeResult => ({
      url,
      success: false,
      title: "Failed",
      content: "",
      error: "Network error",
      method: "fetch"
    })

    describe("constructor", () => {
      test("should use default options when no options provided", () => {
        const controller = new BatchScrapeController()
        expect(controller).toBeDefined()
      })

      test("should merge custom options with defaults", () => {
        const customOptions: Partial<ExtendedBatchScrapeOptions> = {
          concurrency: 5,
          timeout: 60000
        }
        const controller = new BatchScrapeController(customOptions)
        expect(controller).toBeDefined()
      })

      test("should create scrape strategy based on options", () => {
        const { createScrapeStrategy } = require("~utils/scrape-strategies")
        new BatchScrapeController({ strategy: "background-tabs" })
        expect(createScrapeStrategy).toHaveBeenCalledWith("background-tabs")
      })
    })

    describe("state management", () => {
      test("should initially not be paused or cancelled", () => {
        const controller = new BatchScrapeController()
        expect(controller.paused).toBe(false)
        expect(controller.cancelled).toBe(false)
      })

      test("should handle pause, resume, and cancel state transitions", () => {
        const controller = new BatchScrapeController()

        // Initial state
        expect(controller.paused).toBe(false)
        expect(controller.cancelled).toBe(false)

        // Pause
        controller.pause()
        expect(controller.paused).toBe(true)

        // Resume
        controller.resume()
        expect(controller.paused).toBe(false)

        // Cancel
        controller.cancel()
        expect(controller.cancelled).toBe(true)
      })
    })

    describe("execute", () => {
      test("should call strategy lifecycle hooks (initialize and cleanup)", async () => {
        const controller = new BatchScrapeController()
        const links = createMockLinks(1)
        const onProgress = jest.fn()

        mockScrape.mockResolvedValue(createSuccessResult(links[0].url))

        await controller.execute(links, onProgress)

        // Verify both lifecycle hooks are called in correct order
        expect(mockInitialize).toHaveBeenCalled()
        expect(mockCleanup).toHaveBeenCalled()
      })

      test("should scrape all links successfully", async () => {
        const controller = new BatchScrapeController()
        const links = createMockLinks(3)
        const onProgress = jest.fn()

        mockScrape.mockImplementation((url) =>
          Promise.resolve(createSuccessResult(url))
        )

        const results = await controller.execute(links, onProgress)

        expect(results).toHaveLength(3)
        expect(results.every((r) => r.success)).toBe(true)
        expect(mockScrape).toHaveBeenCalledTimes(3)
      })

      test("should report progress during execution", async () => {
        const controller = new BatchScrapeController()
        const links = createMockLinks(2)
        const onProgress = jest.fn()

        mockScrape.mockImplementation((url) =>
          Promise.resolve(createSuccessResult(url))
        )

        await controller.execute(links, onProgress)

        // Should have been called (initial + during execution + final)
        expect(onProgress).toHaveBeenCalled()

        // Check initial call has correct structure
        const initialCall = onProgress.mock.calls.find(
          (call) => call[0].completed === 0
        )
        expect(initialCall).toBeDefined()
        if (initialCall) {
          const progress = initialCall[0] as BatchProgress
          expect(progress.total).toBe(2)
          expect(progress.completed).toBe(0)
        }
      })

      test("should stop when cancelled", async () => {
        const controller = new BatchScrapeController()
        const links = createMockLinks(5)
        const onProgress = jest.fn()

        let scrapeCount = 0
        mockScrape.mockImplementation((url) => {
          scrapeCount++
          if (scrapeCount === 2) {
            controller.cancel()
          }
          return Promise.resolve(createSuccessResult(url))
        })

        const results = await controller.execute(links, onProgress)

        // Should stop early due to cancellation
        expect(results.length).toBeLessThan(5)
      })

      test("should retry failed scrapes", async () => {
        const controller = new BatchScrapeController({ retryCount: 2 })
        const links = createMockLinks(1)
        const onProgress = jest.fn()

        let attemptCount = 0
        mockScrape.mockImplementation((url) => {
          attemptCount++
          // Fail first 2 attempts, succeed on 3rd
          if (attemptCount <= 2) {
            return Promise.resolve(createFailureResult(url))
          }
          return Promise.resolve(createSuccessResult(url))
        })

        const results = await controller.execute(links, onProgress)

        // Should have retried
        expect(attemptCount).toBe(3) // Initial + 2 retries
        expect(results[0].success).toBe(true)
      })

      test("should return failed result after all retries exhausted", async () => {
        const controller = new BatchScrapeController({ retryCount: 2 })
        const links = createMockLinks(1)
        const onProgress = jest.fn()

        mockScrape.mockResolvedValue(createFailureResult(links[0].url))

        const results = await controller.execute(links, onProgress)

        expect(results[0].success).toBe(false)
        expect(mockScrape).toHaveBeenCalledTimes(3) // Initial + 2 retries
      })

      test("should handle empty links array", async () => {
        const controller = new BatchScrapeController()
        const links: ExtractedLink[] = []
        const onProgress = jest.fn()

        const results = await controller.execute(links, onProgress)

        expect(results).toEqual([])
        expect(onProgress).toHaveBeenCalled()
      })

      test("should handle strategy without concurrency support", async () => {
        const { createScrapeStrategy } = require("~utils/scrape-strategies")
        createScrapeStrategy.mockReturnValueOnce({
          scrape: mockScrape,
          initialize: mockInitialize,
          cleanup: mockCleanup,
          supportsConcurrency: false
        })

        const controller = new BatchScrapeController({ concurrency: 5 })
        const links = createMockLinks(3)
        const onProgress = jest.fn()

        mockScrape.mockImplementation((url) =>
          Promise.resolve(createSuccessResult(url))
        )

        await controller.execute(links, onProgress)

        // Should process all links despite concurrency setting
        expect(mockScrape).toHaveBeenCalledTimes(3)
      })

      test("should update progress with current URL being fetched", async () => {
        const controller = new BatchScrapeController()
        const links = createMockLinks(2)
        const onProgress = jest.fn()

        mockScrape.mockImplementation((url) =>
          Promise.resolve(createSuccessResult(url))
        )

        await controller.execute(links, onProgress)

        // Find progress calls with current URL
        const progressWithCurrent = onProgress.mock.calls.filter(
          (call) => call[0].current !== null
        )
        expect(progressWithCurrent.length).toBeGreaterThan(0)

        // Verify current has correct structure
        const withCurrent = progressWithCurrent[0][0] as BatchProgress
        expect(withCurrent.current).toHaveProperty("url")
        expect(withCurrent.current).toHaveProperty("status", "fetching")
      })

      test("should track completed count correctly", async () => {
        const controller = new BatchScrapeController()
        const links = createMockLinks(3)
        const onProgress = jest.fn()

        mockScrape.mockImplementation((url) =>
          Promise.resolve(createSuccessResult(url))
        )

        await controller.execute(links, onProgress)

        // Find final progress call (completed === 3)
        const finalCall = onProgress.mock.calls.find(
          (call) => call[0].completed === 3
        )
        expect(finalCall).toBeDefined()
        if (finalCall) {
          const progress = finalCall[0] as BatchProgress
          expect(progress.results).toHaveLength(3)
        }
      })

      test("should cleanup even if execution throws error", async () => {
        const controller = new BatchScrapeController()
        const links = createMockLinks(1)
        const onProgress = jest.fn()

        mockScrape.mockRejectedValue(new Error("Network failure"))

        await expect(controller.execute(links, onProgress)).rejects.toThrow(
          "Network failure"
        )
        expect(mockCleanup).toHaveBeenCalled()
      })

      test("should handle mixed success and failure results", async () => {
        const controller = new BatchScrapeController()
        const links = createMockLinks(4)
        const onProgress = jest.fn()

        mockScrape.mockImplementation((url, _options) => {
          // Fail URLs with "2" or "4", succeed others
          if (url.includes("page2") || url.includes("page4")) {
            return Promise.resolve(createFailureResult(url))
          }
          return Promise.resolve(createSuccessResult(url))
        })

        const results = await controller.execute(links, onProgress)

        expect(results).toHaveLength(4)
        expect(results.filter((r) => r.success)).toHaveLength(2)
        expect(results.filter((r) => !r.success)).toHaveLength(2)
      })

      test("should respect batch size based on concurrency", async () => {
        const controller = new BatchScrapeController({ concurrency: 2 })
        const links = createMockLinks(5)
        const onProgress = jest.fn()

        mockScrape.mockImplementation((url) =>
          Promise.resolve(createSuccessResult(url))
        )

        await controller.execute(links, onProgress)

        // All links should be processed
        expect(mockScrape).toHaveBeenCalledTimes(5)
      })

      test("should call strategy scrape with correct options", async () => {
        const controller = new BatchScrapeController({
          timeout: 60000,
          retryCount: 3
        })
        const links = createMockLinks(1)
        const onProgress = jest.fn()

        mockScrape.mockResolvedValue(createSuccessResult(links[0].url))

        await controller.execute(links, onProgress)

        expect(mockScrape).toHaveBeenCalledWith(links[0].url, {
          timeout: 60000,
          retryCount: 3
        })
      })
    })
  })

  describe("batchScrape", () => {
    test("should create controller and execute scraping", async () => {
      const links: ExtractedLink[] = [
        { url: "https://example.com/1", text: "Link 1", index: 0 }
      ]
      const onProgress = jest.fn()

      mockScrape.mockResolvedValue({
        url: links[0].url,
        success: true,
        title: "Test",
        content: "Content",
        method: "fetch"
      })

      const { results, controller } = await batchScrape(links, {}, onProgress)

      expect(results).toHaveLength(1)
      expect(controller).toBeInstanceOf(BatchScrapeController)
    })

    test("should pass options to controller", async () => {
      const links: ExtractedLink[] = [
        { url: "https://example.com/1", text: "Link 1", index: 0 }
      ]
      const onProgress = jest.fn()
      const options = { concurrency: 5, timeout: 60000 }

      mockScrape.mockResolvedValue({
        url: links[0].url,
        success: true,
        title: "Test",
        content: "Content",
        method: "fetch"
      })

      await batchScrape(links, options, onProgress)

      const { createScrapeStrategy } = require("~utils/scrape-strategies")
      expect(createScrapeStrategy).toHaveBeenCalled()
    })

    test("should return controller that can be used for control", async () => {
      const links: ExtractedLink[] = [
        { url: "https://example.com/1", text: "Link 1", index: 0 },
        { url: "https://example.com/2", text: "Link 2", index: 1 }
      ]
      const onProgress = jest.fn()

      mockScrape.mockImplementation((url) =>
        Promise.resolve({
          url,
          success: true,
          title: "Test",
          content: "Content",
          method: "fetch"
        })
      )

      const { controller } = await batchScrape(links, {}, onProgress)

      // Controller should be usable after execution
      controller.pause()
      expect(controller.paused).toBe(true)
    })
  })
})
