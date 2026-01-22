import { beforeEach, describe, expect, it, vi } from "vitest"

import type { ExtractionMode } from "~constants/types"

import { createPlasmoStorageMock, resetMockStorage } from "./mocks"

// Mock @plasmohq/storage with shared mock
vi.mock("@plasmohq/storage", () => createPlasmoStorageMock())

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

describe("getExtractionMode", () => {
  beforeEach(() => {
    resetMockStorage()
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
    resetMockStorage()
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
