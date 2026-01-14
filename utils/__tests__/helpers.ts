/**
 * Test helper utilities for utils tests
 */

import type {
  BatchScrapeResult,
  ExtractedLink,
  ScrapedContent
} from "~constants/types"

// ========== DOM Helpers ==========

/**
 * Set document body HTML for testing
 */
export function setDocumentHTML(html: string): void {
  document.body.innerHTML = html
}

/**
 * Create a mock DOM element with properties
 */
export function createMockElement(
  tag: string,
  props: Record<string, any> = {}
): Element {
  const el = document.createElement(tag)
  Object.entries(props).forEach(([key, value]) => {
    if (key === "className") {
      el.className = value
    } else if (key === "textContent") {
      el.textContent = value
    } else if (key === "innerHTML") {
      el.innerHTML = value
    } else {
      el.setAttribute(key, value)
    }
  })
  return el
}

// ========== Storage Helpers ==========

/**
 * Create a mock storage.get function
 */
export function mockStorageGet(returnValue: any) {
  return jest.fn().mockResolvedValue(returnValue)
}

/**
 * Create a mock storage.set function
 */
export function mockStorageSet() {
  return jest.fn().mockResolvedValue(undefined)
}

/**
 * Create a complete mock storage object
 */
export function createMockStorage(overrides = {}) {
  return {
    get: mockStorageGet(null),
    set: mockStorageSet(),
    watch: jest.fn(),
    ...overrides
  }
}

// ========== Async Helpers ==========

/**
 * Wait for next tick (for async operations)
 */
export async function waitForAsync() {
  await new Promise((resolve) => setImmediate(resolve))
}

/**
 * Flush all pending promises
 */
export function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

// ========== Mock Data Factories ==========

/**
 * Create mock scraped content
 */
export function createMockScrapedContent(
  overrides: Partial<ScrapedContent> = {}
): ScrapedContent {
  return {
    title: "Test Title",
    url: "https://example.com",
    articleContent: "Article content here",
    cleanedContent: "Cleaned content here",
    author: "Test Author",
    publishDate: "2024-01-01",
    metadata: {},
    images: [],
    selectorResults: {
      content: [{ selector: "article", content: "Article content" }],
      author: [{ selector: ".author", content: "Test Author" }],
      date: [{ selector: "time", content: "2024-01-01" }],
      title: [{ selector: "h1", content: "Test Title" }]
    },
    ...overrides
  }
}

/**
 * Create mock batch scrape result
 */
export function createMockBatchScrapeResult(
  overrides: Partial<BatchScrapeResult> = {}
): BatchScrapeResult {
  return {
    url: "https://example.com",
    success: true,
    title: "Test Document",
    content: "Document content here",
    method: "fetch",
    ...overrides
  }
}

/**
 * Create mock extracted link
 */
export function createMockExtractedLink(
  index = 0,
  overrides: Partial<ExtractedLink> = {}
): ExtractedLink {
  return {
    url: `https://example.com/page${index}`,
    text: `Link ${index}`,
    index,
    ...overrides
  }
}

// ========== Assertion Helpers ==========

/**
 * Expect mock function to be called with partial object match
 */
export function expectCalledWithPartial(
  mockFn: jest.Mock,
  expected: Record<string, any>
) {
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(expected))
}

/**
 * Expect element to have specific text content
 */
export function expectElementText(selector: string, text: string) {
  const el = document.querySelector(selector)
  expect(el?.textContent).toBe(text)
}
