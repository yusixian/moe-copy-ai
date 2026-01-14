/**
 * React hooks test helpers
 */

import { act as hooksAct, renderHook } from "@testing-library/react-hooks"

// Re-export for convenience
export { renderHook }
export { hooksAct as act }

// ========== Mock Hook Dependencies ==========

/**
 * Mock useStorage hook return value
 */
export function mockUseStorage(initialValue: any = "") {
  const setValue = jest.fn()
  return [initialValue, setValue]
}

/**
 * Setup storage mock with initial values
 */
export function setupStorageMock(values: Record<string, any> = {}) {
  return {
    get: jest
      .fn()
      .mockImplementation((key) => Promise.resolve(values[key] || null)),
    set: jest.fn().mockResolvedValue(undefined),
    watch: jest.fn()
  }
}

/**
 * Setup sendToBackground mock
 */
export function setupBackgroundMock(response: any = { success: true }) {
  return jest.fn().mockResolvedValue(response)
}

// ========== Async Utilities ==========

/**
 * Wait for next update in hook
 */
export async function waitForNextUpdate(hook: any) {
  await hooksAct(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  })
}

/**
 * Flush all pending promises
 */
export function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

// ========== Mock Data Factories ==========

/**
 * Create mock AI config
 */
export function createMockAiConfig(overrides = {}) {
  return {
    apiKey: "test-api-key",
    baseURL: "https://api.test.com",
    model: "gpt-3.5-turbo",
    systemPrompt: "You are a helpful assistant",
    ...overrides
  }
}

/**
 * Create mock batch scrape result
 */
export function createMockBatchResult(index = 0, overrides = {}) {
  return {
    url: `https://example.com/page${index}`,
    success: true,
    title: `Page ${index}`,
    content: `Content for page ${index}`,
    method: "fetch",
    ...overrides
  }
}

/**
 * Create mock extracted link
 */
export function createMockLink(index = 0, overrides = {}) {
  return {
    url: `https://example.com/link${index}`,
    text: `Link ${index}`,
    index,
    ...overrides
  }
}
