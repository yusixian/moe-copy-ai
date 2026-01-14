import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ExtractionMode } from "~constants/types"

// Mock @plasmohq/storage
vi.mock("@plasmohq/storage", () => {
  class MockStorage {
    private store = new Map<string, unknown>()

    async get<T>(key: string): Promise<T | undefined> {
      return this.store.get(key) as T | undefined
    }

    async set(key: string, value: unknown): Promise<void> {
      this.store.set(key, value)
    }

    clear() {
      this.store.clear()
    }
  }

  return {
    Storage: MockStorage
  }
})

// Mock logger
vi.mock("../logger", () => ({
  debugLog: vi.fn()
}))

import {
  getExtractionMode,
  getReadabilityConfig,
  setExtractionMode,
  syncStorage
} from "../storage"

// Type for mocked storage with clear method
interface MockStorageInstance {
  get: <T>(key: string) => Promise<T | undefined>
  set: (key: string, value: unknown) => Promise<void>
  clear: () => void
}

describe("getExtractionMode", () => {
  beforeEach(() => {
    ;(syncStorage as unknown as MockStorageInstance).clear()
  })

  it("returns valid mode from storage", async () => {
    await syncStorage.set("extraction_mode", "selector")

    const mode = await getExtractionMode()

    expect(mode).toBe("selector")
  })

  it("returns default 'hybrid' when mode is invalid", async () => {
    await syncStorage.set("extraction_mode", "invalid_mode")

    const mode = await getExtractionMode()

    expect(mode).toBe("hybrid")
  })

  it("returns default 'hybrid' when storage is empty", async () => {
    const mode = await getExtractionMode()

    expect(mode).toBe("hybrid")
  })
})

describe("setExtractionMode", () => {
  beforeEach(() => {
    ;(syncStorage as unknown as MockStorageInstance).clear()
  })

  it("sets valid extraction mode successfully", async () => {
    await setExtractionMode("readability")

    const mode = await syncStorage.get<ExtractionMode>("extraction_mode")

    expect(mode).toBe("readability")
  })

  it("throws error for invalid mode", async () => {
    await expect(
      setExtractionMode("invalid" as ExtractionMode)
    ).rejects.toThrow("无效的抓取模式")
  })

  it("verifies persistence after setting", async () => {
    await setExtractionMode("selector")

    // Verify the mode persists
    const savedMode = await getExtractionMode()

    expect(savedMode).toBe("selector")
  })
})

describe("getReadabilityConfig", () => {
  it("returns static configuration object", () => {
    const config = getReadabilityConfig()

    expect(config).toEqual({
      charThreshold: 500,
      keepClasses: ["highlight", "code-block", "important"],
      debug: false
    })
  })
})
