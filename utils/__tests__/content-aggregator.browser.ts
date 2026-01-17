import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import type { BatchScrapeResult } from "~constants/types"

import {
  aggregateToSingleMarkdown,
  formatSingleDocument
} from "../content-aggregator"

// Helper to create test results with required fields
function createResult(
  overrides: Partial<BatchScrapeResult> &
    Pick<BatchScrapeResult, "url" | "success">
): BatchScrapeResult {
  return {
    title: "",
    content: "",
    method: "fetch",
    ...overrides
  }
}

describe("aggregateToSingleMarkdown", () => {
  beforeEach(() => {
    // Use fake timers for consistent timestamps in tests
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-15T10:30:00.000Z"))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("generates complete document structure with metadata", () => {
    const results: BatchScrapeResult[] = [
      createResult({
        url: "https://example.com/page1",
        title: "First Page",
        content: "Content of first page",
        success: true
      }),
      createResult({
        url: "https://example.com/page2",
        title: "Second Page",
        content: "Content of second page",
        success: true
      })
    ]

    const { content, metadata, toc } = aggregateToSingleMarkdown(results)

    // Verify metadata
    expect(metadata.totalPages).toBe(2)
    expect(metadata.successCount).toBe(2)
    expect(metadata.failedCount).toBe(0)
    expect(metadata.totalChars).toBe(
      "Content of first page".length + "Content of second page".length
    )

    // Verify header structure
    expect(content).toContain("# 批量抓取文档")
    expect(content).toContain("抓取时间:")
    expect(content).toContain("总页面: 2")
    expect(content).toContain("成功: 2")
    expect(content).toContain("失败: 0")

    // Verify table of contents
    expect(toc).toContain("1. [First Page]")
    expect(toc).toContain("2. [Second Page]")

    // Verify content sections
    expect(content).toContain("## First Page")
    expect(content).toContain("**URL**: https://example.com/page1")
    expect(content).toContain("Content of first page")
  })

  it("handles failed pages section", () => {
    const results: BatchScrapeResult[] = [
      createResult({
        url: "https://example.com/success",
        title: "Working Page",
        content: "Success content",
        success: true
      }),
      createResult({
        url: "https://example.com/failed",
        title: "Failed Page",
        content: "",
        success: false,
        error: "Connection timeout"
      })
    ]

    const { content, metadata } = aggregateToSingleMarkdown(results)

    expect(metadata.successCount).toBe(1)
    expect(metadata.failedCount).toBe(1)
    expect(content).toContain("## 抓取失败的页面")
    expect(content).toContain("https://example.com/failed: Connection timeout")
  })

  it("returns empty TOC when no successful results", () => {
    const results: BatchScrapeResult[] = [
      createResult({
        url: "https://example.com/failed",
        title: "Failed",
        content: "",
        success: false,
        error: "Error"
      })
    ]

    const { toc, metadata } = aggregateToSingleMarkdown(results)

    expect(toc).toBe("")
    expect(metadata.successCount).toBe(0)
    expect(metadata.failedCount).toBe(1)
  })

  it("handles empty results array", () => {
    const results: BatchScrapeResult[] = []

    const { content, metadata, toc } = aggregateToSingleMarkdown(results)

    expect(metadata.totalPages).toBe(0)
    expect(metadata.successCount).toBe(0)
    expect(metadata.failedCount).toBe(0)
    expect(metadata.totalChars).toBe(0)
    expect(toc).toBe("")
    expect(content).toContain("# 批量抓取文档")
  })

  it("uses fallback title for pages without title", () => {
    const results: BatchScrapeResult[] = [
      createResult({
        url: "https://example.com/no-title",
        title: "",
        content: "Content without title",
        success: true
      })
    ]

    const { content, toc } = aggregateToSingleMarkdown(results)

    // TOC should show "无标题"
    expect(toc).toContain("[无标题]")
    // Content section should show "文档 1"
    expect(content).toContain("## 文档 1")
  })

  it("generates correct anchor IDs for Chinese titles", () => {
    const results: BatchScrapeResult[] = [
      createResult({
        url: "https://example.com/1",
        title: "中文标题测试",
        content: "Chinese content",
        success: true
      })
    ]

    const { toc } = aggregateToSingleMarkdown(results)

    // Anchor should preserve Chinese characters
    expect(toc).toContain("(#中文标题测试)")
  })

  it("generates correct anchor IDs with special characters removed", () => {
    const results: BatchScrapeResult[] = [
      createResult({
        url: "https://example.com/1",
        title: "Hello! World? Test@123",
        content: "Content",
        success: true
      })
    ]

    const { toc } = aggregateToSingleMarkdown(results)

    // Special characters should be removed, spaces become dashes
    expect(toc).toContain("(#hello-world-test123)")
  })

  it("handles unknown error for failed pages", () => {
    const results: BatchScrapeResult[] = [
      createResult({
        url: "https://example.com/failed",
        title: "Failed",
        content: "",
        success: false
        // No error property
      })
    ]

    const { content } = aggregateToSingleMarkdown(results)

    expect(content).toContain("https://example.com/failed: 未知错误")
  })
})

describe("formatSingleDocument", () => {
  it("formats successful result correctly", () => {
    const result = createResult({
      url: "https://example.com/article",
      title: "Article Title",
      content: "Article content goes here.",
      success: true
    })

    const formatted = formatSingleDocument(result)

    expect(formatted).toContain("# Article Title")
    expect(formatted).toContain("**URL**: https://example.com/article")
    expect(formatted).toContain("Article content goes here.")
    expect(formatted).toContain("---")
  })

  it("formats failed result with error message", () => {
    const result = createResult({
      url: "https://example.com/failed",
      title: "Failed Page",
      content: "",
      success: false,
      error: "Network error"
    })

    const formatted = formatSingleDocument(result)

    expect(formatted).toContain("# Failed Page")
    expect(formatted).toContain("> 抓取失败: Network error")
    expect(formatted).toContain("**URL**: https://example.com/failed")
  })

  it("formats failed result with unknown error when error is missing", () => {
    const result = createResult({
      url: "https://example.com/failed",
      title: "",
      content: "",
      success: false
    })

    const formatted = formatSingleDocument(result)

    expect(formatted).toContain("# 抓取失败")
    expect(formatted).toContain("> 抓取失败: 未知错误")
  })

  it("uses fallback title for successful result without title", () => {
    const result = createResult({
      url: "https://example.com/no-title",
      title: "",
      content: "Content here",
      success: true
    })

    const formatted = formatSingleDocument(result)

    // Empty title means the heading will be "# "
    expect(formatted).toContain("#")
    expect(formatted).toContain("Content here")
  })
})
