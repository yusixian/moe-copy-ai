import type { BatchScrapeResult } from "~constants/types"
import {
  aggregateToSingleMarkdown,
  formatSingleDocument
} from "~utils/content-aggregator"
import { createMockBatchScrapeResult } from "./helpers"

describe("content-aggregator", () => {
  describe("aggregateToSingleMarkdown", () => {
    test("should aggregate multiple successful results", () => {
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({
          url: "https://example.com/page1",
          title: "First Page",
          content: "First content"
        }),
        createMockBatchScrapeResult({
          url: "https://example.com/page2",
          title: "Second Page",
          content: "Second content"
        })
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      // Check metadata
      expect(aggregated.metadata.totalPages).toBe(2)
      expect(aggregated.metadata.successCount).toBe(2)
      expect(aggregated.metadata.failedCount).toBe(0)
      expect(aggregated.metadata.totalChars).toBe(
        "First content".length + "Second content".length
      )
      expect(aggregated.metadata.scrapedAt).toMatch(/\d{4}-\d{2}-\d{2}/)

      // Check TOC
      expect(aggregated.toc).toContain("1. [First Page](#first-page)")
      expect(aggregated.toc).toContain("2. [Second Page](#second-page)")

      // Check content structure
      expect(aggregated.content).toContain("# 批量抓取文档")
      expect(aggregated.content).toContain("## 目录")
      expect(aggregated.content).toContain("## First Page")
      expect(aggregated.content).toContain("**URL**: https://example.com/page1")
      expect(aggregated.content).toContain("First content")
      expect(aggregated.content).toContain("## Second Page")
      expect(aggregated.content).toContain("**URL**: https://example.com/page2")
      expect(aggregated.content).toContain("Second content")
    })

    test("should handle mixed success and failure results", () => {
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({
          url: "https://example.com/success",
          title: "Success Page",
          content: "Success content",
          success: true
        }),
        createMockBatchScrapeResult({
          url: "https://example.com/failed",
          title: "Failed Page",
          success: false,
          error: "Network timeout"
        })
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      // Check metadata
      expect(aggregated.metadata.totalPages).toBe(2)
      expect(aggregated.metadata.successCount).toBe(1)
      expect(aggregated.metadata.failedCount).toBe(1)

      // TOC should only include successful pages
      expect(aggregated.toc).toContain("1. [Success Page](#success-page)")
      expect(aggregated.toc).not.toContain("Failed Page")

      // Content should include success page
      expect(aggregated.content).toContain("## Success Page")
      expect(aggregated.content).toContain("Success content")

      // Content should include failed section
      expect(aggregated.content).toContain("## 抓取失败的页面")
      expect(aggregated.content).toContain(
        "- https://example.com/failed: Network timeout"
      )
    })

    test("should handle all failed results", () => {
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({
          url: "https://example.com/fail1",
          success: false,
          error: "Error 1"
        }),
        createMockBatchScrapeResult({
          url: "https://example.com/fail2",
          success: false,
          error: "Error 2"
        })
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      // Check metadata
      expect(aggregated.metadata.totalPages).toBe(2)
      expect(aggregated.metadata.successCount).toBe(0)
      expect(aggregated.metadata.failedCount).toBe(2)
      expect(aggregated.metadata.totalChars).toBe(0)

      // TOC should be empty
      expect(aggregated.toc).toBe("")

      // Should have failed section
      expect(aggregated.content).toContain("## 抓取失败的页面")
      expect(aggregated.content).toContain(
        "- https://example.com/fail1: Error 1"
      )
      expect(aggregated.content).toContain(
        "- https://example.com/fail2: Error 2"
      )
    })

    test("should handle empty results array", () => {
      const results: BatchScrapeResult[] = []
      const aggregated = aggregateToSingleMarkdown(results)

      expect(aggregated.metadata.totalPages).toBe(0)
      expect(aggregated.metadata.successCount).toBe(0)
      expect(aggregated.metadata.failedCount).toBe(0)
      expect(aggregated.toc).toBe("")
    })

    test("should generate correct anchor IDs for Chinese titles", () => {
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({
          title: "测试文档 Test",
          content: "Content"
        })
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      // Check anchor ID generation (lowercase, remove special chars, spaces to dashes)
      expect(aggregated.toc).toContain("[测试文档 Test](#测试文档-test)")
    })

    test("should handle titles with special characters", () => {
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({
          title: "Title: With Special/Characters!",
          content: "Content"
        })
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      // Special characters should be removed
      expect(aggregated.toc).toContain(
        "[Title: With Special/Characters!](#title-with-specialcharacters)"
      )
    })

    test("should handle missing titles", () => {
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({
          title: "",
          content: "Content without title"
        })
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      // Should use default title
      expect(aggregated.toc).toContain("1. [无标题](#document-1)")
      expect(aggregated.content).toContain("## 文档 1")
    })

    test("should calculate total characters correctly", () => {
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({ content: "12345" }), // 5 chars
        createMockBatchScrapeResult({ content: "123456789" }), // 9 chars
        createMockBatchScrapeResult({ success: false }) // should not count
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      expect(aggregated.metadata.totalChars).toBe(14)
    })

    test("should handle failed results without error message", () => {
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({
          url: "https://example.com/fail",
          success: false
          // no error property
        })
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      expect(aggregated.content).toContain(
        "- https://example.com/fail: 未知错误"
      )
    })

    test("should format datetime correctly", () => {
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({ content: "test" })
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      // Should match format: YYYY-MM-DD HH:MM
      expect(aggregated.metadata.scrapedAt).toMatch(
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/
      )
    })

    test("should preserve markdown content", () => {
      const markdownContent = `# Heading\n\n- List item 1\n- List item 2\n\n**Bold text**`
      const results: BatchScrapeResult[] = [
        createMockBatchScrapeResult({
          title: "Markdown Doc",
          content: markdownContent
        })
      ]

      const aggregated = aggregateToSingleMarkdown(results)

      // Markdown content should be preserved as-is
      expect(aggregated.content).toContain(markdownContent)
    })
  })

  describe("formatSingleDocument", () => {
    test("should format successful result", () => {
      const result = createMockBatchScrapeResult({
        url: "https://example.com/page",
        title: "Test Page",
        content: "Test content here",
        success: true
      })

      const formatted = formatSingleDocument(result)

      expect(formatted).toContain("# Test Page")
      expect(formatted).toContain("**URL**: https://example.com/page")
      expect(formatted).toContain("Test content here")
      expect(formatted).not.toContain("抓取失败")
    })

    test("should format failed result with error", () => {
      const result = createMockBatchScrapeResult({
        url: "https://example.com/fail",
        title: "Failed Page",
        success: false,
        error: "Timeout error"
      })

      const formatted = formatSingleDocument(result)

      expect(formatted).toContain("# Failed Page")
      expect(formatted).toContain("**URL**: https://example.com/fail")
      expect(formatted).toContain("> 抓取失败: Timeout error")
      expect(formatted).not.toContain("---")
    })

    test("should handle failed result without error message", () => {
      const result = createMockBatchScrapeResult({
        url: "https://example.com/fail",
        title: "Failed",
        success: false
      })

      const formatted = formatSingleDocument(result)

      expect(formatted).toContain("> 抓取失败: 未知错误")
    })

    test("should handle failed result without title", () => {
      const result = createMockBatchScrapeResult({
        url: "https://example.com/fail",
        title: "",
        success: false,
        error: "Error"
      })

      const formatted = formatSingleDocument(result)

      expect(formatted).toContain("# 抓取失败")
    })

    test("should preserve markdown in content", () => {
      const markdownContent = `## Subheading\n\nParagraph with **bold** and *italic*.`
      const result = createMockBatchScrapeResult({
        title: "Markdown",
        content: markdownContent,
        success: true
      })

      const formatted = formatSingleDocument(result)

      expect(formatted).toContain(markdownContent)
    })
  })
})
