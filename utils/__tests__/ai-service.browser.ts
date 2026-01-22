import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createPlasmoStorageMock, resetMockStorage } from "./mocks"

// Mock @plasmohq/storage with shared mock
vi.mock("@plasmohq/storage", () => createPlasmoStorageMock())

// Mock @xsai/stream-text
vi.mock("@xsai/stream-text", () => ({
  streamText: vi.fn()
}))

// Mock logger to prevent console noise
vi.mock("../logger", () => ({
  debugLog: vi.fn()
}))

import { streamText } from "@xsai/stream-text"

import {
  addAiChatHistoryItem,
  clearAiChatHistory,
  deleteAiChatHistoryItem,
  generateSummary,
  getAiChatHistory,
  getAiConfig
} from "../ai-service"
import { syncStorage } from "../storage"

describe("getAiConfig", () => {
  beforeEach(() => {
    resetMockStorage()
  })

  it("returns valid config from storage", async () => {
    await syncStorage.setMany({
      ai_api_key: "test-key-123",
      ai_base_url: "https://api.test.com/v1/",
      ai_system_prompt: "Custom prompt",
      ai_model: "gpt-4"
    })

    const config = await getAiConfig()

    expect(config.apiKey).toBe("test-key-123")
    expect(config.baseURL).toBe("https://api.test.com/v1/")
    expect(config.systemPrompt).toBe("Custom prompt")
    expect(config.model).toBe("gpt-4")
  })

  it("returns default values when storage is empty", async () => {
    const config = await getAiConfig()

    expect(config.apiKey).toBeUndefined()
    expect(config.baseURL).toBe("https://api.openai.com/v1/")
    expect(config.systemPrompt).toContain("摘要任务")
    expect(config.model).toBe("")
  })

  it("throws error when storage fails", async () => {
    vi.spyOn(syncStorage, "get").mockRejectedValueOnce(
      new Error("Storage error")
    )

    await expect(getAiConfig()).rejects.toThrow("获取AI配置失败")
  })
})

describe("generateSummary", () => {
  beforeEach(() => {
    resetMockStorage()
    vi.clearAllMocks()
  })

  it("generates summary successfully with valid config", async () => {
    await syncStorage.setMany({
      ai_api_key: "test-key",
      ai_base_url: "https://api.test.com/v1/",
      ai_model: "gpt-4"
    })

    vi.mocked(streamText).mockResolvedValueOnce({
      text: "Generated summary",
      usage: { prompt_tokens: 100, completion_tokens: 50 }
    } as unknown as Awaited<ReturnType<typeof streamText>>)

    const result = await generateSummary()

    expect(result).toEqual({
      text: "Generated summary",
      usage: { prompt_tokens: 100, completion_tokens: 50 }
    })
    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "test-key",
        baseURL: "https://api.test.com/v1/",
        model: "gpt-4"
      })
    )
  })

  it("returns null when API key is missing", async () => {
    await syncStorage.setMany({
      ai_base_url: "https://api.test.com/v1/",
      ai_model: "gpt-4"
    })

    const result = await generateSummary()

    expect(result).toBeNull()
    expect(streamText).not.toHaveBeenCalled()
  })

  it("uses custom prompt when provided", async () => {
    await syncStorage.setMany({
      ai_api_key: "test-key",
      ai_base_url: "https://api.test.com/v1/",
      ai_model: "gpt-4"
    })

    vi.mocked(streamText).mockResolvedValueOnce({
      text: "Custom result"
    } as unknown as Awaited<ReturnType<typeof streamText>>)

    await generateSummary("Custom prompt here")

    expect(streamText).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: "user", content: "Custom prompt here" }]
      })
    )
  })

  it("returns null when API call fails", async () => {
    await syncStorage.setMany({
      ai_api_key: "test-key",
      ai_model: "gpt-4"
    })

    vi.mocked(streamText).mockRejectedValueOnce(new Error("API error"))

    const result = await generateSummary()

    expect(result).toBeNull()
  })
})

describe("AI Chat History", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
    resetMockStorage()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("returns empty history when storage is empty", async () => {
    const history = await getAiChatHistory()

    expect(history).toEqual({ items: [] })
  })

  it("adds new history item successfully", async () => {
    await addAiChatHistoryItem({
      url: "https://example.com",
      prompt: "Test prompt",
      processedPrompt: "Processed prompt",
      content: "Test content",
      usage: { prompt_tokens: 10, completion_tokens: 20 }
    })

    const history = await getAiChatHistory()

    expect(history.items).toHaveLength(1)
    expect(history.items[0]).toMatchObject({
      url: "https://example.com",
      prompt: "Test prompt",
      content: "Test content"
    })
    expect(history.items[0].id).toBeDefined()
    expect(history.items[0].timestamp).toBeDefined()
  })

  it("adds multiple items in correct order (newest first)", async () => {
    // First item at T=0
    await addAiChatHistoryItem({
      url: "https://example.com/1",
      prompt: "First",
      content: "Content 1"
    })

    // Advance time by 1 second for different timestamp
    vi.setSystemTime(new Date("2024-01-01T00:00:01.000Z"))

    // Second item at T=1s
    await addAiChatHistoryItem({
      url: "https://example.com/2",
      prompt: "Second",
      content: "Content 2"
    })

    const history = await getAiChatHistory()

    expect(history.items).toHaveLength(2)
    expect(history.items[0].url).toBe("https://example.com/2")
    expect(history.items[1].url).toBe("https://example.com/1")
    expect(history.items[0].timestamp).toBeGreaterThan(
      history.items[1].timestamp
    )
  })

  it("limits history to 50 items", async () => {
    // Add 55 items
    for (let i = 0; i < 55; i++) {
      await addAiChatHistoryItem({
        url: `https://example.com/${i}`,
        prompt: `Prompt ${i}`,
        content: `Content ${i}`
      })
    }

    const history = await getAiChatHistory()

    expect(history.items).toHaveLength(50)
    // Newest items should be kept
    expect(history.items[0].url).toBe("https://example.com/54")
  })

  it("deletes specific history item by id", async () => {
    await addAiChatHistoryItem({
      url: "https://example.com/1",
      prompt: "First",
      content: "Content 1"
    })

    await addAiChatHistoryItem({
      url: "https://example.com/2",
      prompt: "Second",
      content: "Content 2"
    })

    const historyBefore = await getAiChatHistory()
    const idToDelete = historyBefore.items[0].id

    await deleteAiChatHistoryItem(idToDelete)

    const historyAfter = await getAiChatHistory()

    expect(historyAfter.items).toHaveLength(1)
    expect(historyAfter.items[0].id).not.toBe(idToDelete)
  })

  it("clears all history", async () => {
    await addAiChatHistoryItem({
      url: "https://example.com/1",
      prompt: "First",
      content: "Content 1"
    })

    await addAiChatHistoryItem({
      url: "https://example.com/2",
      prompt: "Second",
      content: "Content 2"
    })

    await clearAiChatHistory()

    const history = await getAiChatHistory()

    expect(history.items).toHaveLength(0)
  })
})
