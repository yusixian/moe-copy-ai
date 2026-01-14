import type { BatchScrapeResult } from "~constants/types"
import { exportAsZip, generateZipFilename } from "~utils/zip-exporter"
import { createMockBatchScrapeResult } from "./helpers"

// Mock content-aggregator
jest.mock("~utils/content-aggregator", () => ({
  aggregateToSingleMarkdown: jest.fn().mockReturnValue({
    content: "# Index\n\n## Table of Contents\n\n1. [Doc 1](#doc-1)",
    toc: "1. [Doc 1](#doc-1)",
    metadata: { totalPages: 1, successCount: 1, failedCount: 0 }
  }),
  formatSingleDocument: jest
    .fn()
    .mockImplementation((result: BatchScrapeResult) => {
      if (result.success) {
        return `# ${result.title}\n\n**URL**: ${result.url}\n\n${result.content}`
      }
      return `# ${result.title}\n\n> 抓取失败: ${result.error}`
    })
}))

describe("zip-exporter", () => {
  let mockZip: any
  let mockDocsFolder: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup JSZip mock
    mockDocsFolder = {
      file: jest.fn()
    }

    mockZip = {
      file: jest.fn(),
      folder: jest.fn().mockReturnValue(mockDocsFolder),
      generateAsync: jest.fn().mockResolvedValue(new Blob())
    }

    // Mock JSZip constructor
    const JSZip = require("jszip")
    JSZip.mockImplementation(() => mockZip)
  })

  describe("exportAsZip", () => {
    test("should create zip with index file by default", async () => {
      const results = [
        createMockBatchScrapeResult({
          title: "Test Document",
          content: "Content",
          success: true
        })
      ]

      await exportAsZip(results)

      // Should create index.md
      expect(mockZip.file).toHaveBeenCalledWith(
        "index.md",
        expect.stringContaining("Index")
      )
    })

    test("should skip index file when includeIndex is false", async () => {
      const results = [createMockBatchScrapeResult({ success: true })]

      await exportAsZip(results, { includeIndex: false })

      expect(mockZip.file).not.toHaveBeenCalled()
    })

    test("should create docs folder", async () => {
      const results = [createMockBatchScrapeResult({ success: true })]

      await exportAsZip(results)

      expect(mockZip.folder).toHaveBeenCalledWith("docs")
    })

    test("should add documents to docs folder", async () => {
      const results = [
        createMockBatchScrapeResult({
          title: "First Doc",
          content: "Content 1",
          success: true
        }),
        createMockBatchScrapeResult({
          title: "Second Doc",
          content: "Content 2",
          success: true
        })
      ]

      await exportAsZip(results)

      expect(mockDocsFolder.file).toHaveBeenCalledTimes(2)
    })

    test("should filter out failed results", async () => {
      const results = [
        createMockBatchScrapeResult({ success: true }),
        createMockBatchScrapeResult({ success: false }),
        createMockBatchScrapeResult({ success: true })
      ]

      await exportAsZip(results)

      // Only 2 successful results should be added to docs
      expect(mockDocsFolder.file).toHaveBeenCalledTimes(2)
    })

    test("should use title format by default", async () => {
      const results = [
        createMockBatchScrapeResult({
          title: "My Title",
          success: true
        })
      ]

      await exportAsZip(results)

      expect(mockDocsFolder.file).toHaveBeenCalledWith(
        "My-Title.md",
        expect.any(String)
      )
    })

    test("should use url format when specified", async () => {
      const results = [
        createMockBatchScrapeResult({
          url: "https://example.com/my-page",
          title: "Title",
          success: true
        })
      ]

      await exportAsZip(results, { filenameFormat: "url" })

      expect(mockDocsFolder.file).toHaveBeenCalledWith(
        "my-page.md",
        expect.any(String)
      )
    })

    test("should use index format when specified", async () => {
      const results = [
        createMockBatchScrapeResult({
          title: "Title",
          success: true
        })
      ]

      await exportAsZip(results, { filenameFormat: "index" })

      expect(mockDocsFolder.file).toHaveBeenCalledWith(
        "001-document.md",
        expect.any(String)
      )
    })

    test("should sanitize filenames", async () => {
      const results = [
        createMockBatchScrapeResult({
          title: "Title: With/Special\\Characters?",
          success: true
        })
      ]

      await exportAsZip(results)

      // Special characters should be removed
      expect(mockDocsFolder.file).toHaveBeenCalledWith(
        "Title-WithSpecialCharacters.md",
        expect.any(String)
      )
    })

    test("should truncate long filenames", async () => {
      const longTitle = "A".repeat(100)
      const results = [
        createMockBatchScrapeResult({
          title: longTitle,
          success: true
        })
      ]

      await exportAsZip(results, { maxFilenameLength: 50 })

      const call = mockDocsFolder.file.mock.calls[0]
      const filename = call[0]
      // Should be truncated (50 chars + .md extension)
      expect(filename.length).toBeLessThanOrEqual(53)
    })

    test("should ensure filename uniqueness", async () => {
      const results = [
        createMockBatchScrapeResult({ title: "Same Title", success: true }),
        createMockBatchScrapeResult({ title: "Same Title", success: true }),
        createMockBatchScrapeResult({ title: "Same Title", success: true })
      ]

      await exportAsZip(results)

      const calls = mockDocsFolder.file.mock.calls
      expect(calls[0][0]).toBe("Same-Title.md")
      expect(calls[1][0]).toBe("Same-Title-1.md")
      expect(calls[2][0]).toBe("Same-Title-2.md")
    })

    test("should use default name for empty title", async () => {
      const results = [
        createMockBatchScrapeResult({
          title: "",
          success: true
        })
      ]

      await exportAsZip(results)

      expect(mockDocsFolder.file).toHaveBeenCalledWith(
        "document-1.md",
        expect.any(String)
      )
    })

    test("should generate zip blob with compression", async () => {
      const results = [createMockBatchScrapeResult({ success: true })]

      await exportAsZip(results)

      expect(mockZip.generateAsync).toHaveBeenCalledWith({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6
        }
      })
    })

    test("should return blob from generateAsync", async () => {
      const mockBlob = new Blob(["test"])
      mockZip.generateAsync.mockResolvedValue(mockBlob)

      const results = [createMockBatchScrapeResult({ success: true })]
      const blob = await exportAsZip(results)

      expect(blob).toBe(mockBlob)
    })

    test("should handle empty results array", async () => {
      const results: BatchScrapeResult[] = []

      await exportAsZip(results)

      // Should still create zip structure
      expect(mockZip.folder).toHaveBeenCalled()
      expect(mockZip.generateAsync).toHaveBeenCalled()
    })

    test("should handle all failed results", async () => {
      const results = [
        createMockBatchScrapeResult({ success: false }),
        createMockBatchScrapeResult({ success: false })
      ]

      await exportAsZip(results)

      // No documents should be added to docs folder
      expect(mockDocsFolder.file).not.toHaveBeenCalled()
      // But index should still be created (with failed section)
      expect(mockZip.file).toHaveBeenCalledWith("index.md", expect.any(String))
    })

    test("should pass correct content to formatSingleDocument", async () => {
      const { formatSingleDocument } = require("~utils/content-aggregator")
      const results = [
        createMockBatchScrapeResult({
          title: "Test",
          content: "Content",
          url: "https://example.com",
          success: true
        })
      ]

      await exportAsZip(results)

      expect(formatSingleDocument).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test",
          content: "Content",
          url: "https://example.com",
          success: true
        })
      )
    })

    test("should handle URL format with path", async () => {
      const results = [
        createMockBatchScrapeResult({
          url: "https://example.com/path/to/page.html",
          success: true
        })
      ]

      await exportAsZip(results, { filenameFormat: "url" })

      expect(mockDocsFolder.file).toHaveBeenCalledWith(
        "page.md",
        expect.any(String)
      )
    })

    test("should handle URL format with only hostname", async () => {
      const results = [
        createMockBatchScrapeResult({
          url: "https://example.com",
          success: true
        })
      ]

      await exportAsZip(results, { filenameFormat: "url" })

      expect(mockDocsFolder.file).toHaveBeenCalledWith(
        "example-com.md",
        expect.any(String)
      )
    })

    test("should handle invalid URLs in url format", async () => {
      const results = [
        createMockBatchScrapeResult({
          url: "not-a-valid-url",
          success: true
        })
      ]

      await exportAsZip(results, { filenameFormat: "url" })

      // Should sanitize the invalid URL
      expect(mockDocsFolder.file).toHaveBeenCalledWith(
        "not-a-valid-url.md",
        expect.any(String)
      )
    })

    test("should decode URL encoded characters", async () => {
      const results = [
        createMockBatchScrapeResult({
          url: "https://example.com/%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3",
          success: true
        })
      ]

      await exportAsZip(results, { filenameFormat: "url" })

      // Should decode Chinese characters
      expect(mockDocsFolder.file).toHaveBeenCalledWith(
        "中文文档.md",
        expect.any(String)
      )
    })

    test("should merge custom options with defaults", async () => {
      const results = [createMockBatchScrapeResult({ success: true })]

      await exportAsZip(results, {
        filenameFormat: "url"
        // includeIndex should default to true
        // maxFilenameLength should default to 50
      })

      // Should still create index (default behavior)
      expect(mockZip.file).toHaveBeenCalledWith("index.md", expect.any(String))
    })
  })

  describe("generateZipFilename", () => {
    test("should generate filename with current date", () => {
      const filename = generateZipFilename()

      expect(filename).toMatch(/^batch-scrape-\d{4}-\d{2}-\d{2}\.zip$/)
    })

    test("should use ISO date format", () => {
      // Mock date to 2024-01-15
      const mockDate = new Date("2024-01-15T12:00:00Z")
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as any)

      const filename = generateZipFilename()

      expect(filename).toBe("batch-scrape-2024-01-15.zip")

      jest.restoreAllMocks()
    })

    test("should generate different filenames on different days", () => {
      const date1 = new Date("2024-01-01")
      const date2 = new Date("2024-12-31")

      jest.spyOn(global, "Date").mockImplementationOnce(() => date1 as any)
      const filename1 = generateZipFilename()

      jest.spyOn(global, "Date").mockImplementationOnce(() => date2 as any)
      const filename2 = generateZipFilename()

      expect(filename1).not.toBe(filename2)
      expect(filename1).toBe("batch-scrape-2024-01-01.zip")
      expect(filename2).toBe("batch-scrape-2024-12-31.zip")

      jest.restoreAllMocks()
    })
  })
})
