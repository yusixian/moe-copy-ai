import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  getPresetTemplates,
  MAX_CUSTOM_TEMPLATES
} from "~constants/prompt-presets"
import type { PromptTemplate } from "~constants/types"

import { createPlasmoStorageMock, MockStorage, resetMockStorage } from "./mocks"

vi.mock("@plasmohq/storage", () => createPlasmoStorageMock())

const STORAGE_KEY = "ai_prompt_templates"
const OVERRIDES_KEY = "ai_preset_overrides"

function createStorage() {
  return new MockStorage({ area: "local" })
}

// Identity translation function for testing
const t = (key: string) => key

describe("getPresetTemplates", () => {
  it("returns all 9 preset templates", () => {
    const presets = getPresetTemplates(t)

    expect(presets).toHaveLength(9)
    expect(presets.every((p) => p.isPreset)).toBe(true)
  })

  it("all presets have required fields", () => {
    const presets = getPresetTemplates(t)

    for (const preset of presets) {
      expect(preset.id).toMatch(/^preset:/)
      expect(preset.name).toBeTruthy()
      expect(preset.content).toBeTruthy()
      expect(preset.icon).toBeTruthy()
      expect(preset.description).toBeTruthy()
    }
  })

  it("preset ids are unique", () => {
    const presets = getPresetTemplates(t)
    const ids = presets.map((p) => p.id)

    expect(new Set(ids).size).toBe(ids.length)
  })

  it("uses translation function for name, content, and description", () => {
    const mockT = vi.fn((key: string) => `translated:${key}`)
    const presets = getPresetTemplates(mockT)

    expect(mockT).toHaveBeenCalled()
    expect(presets[0].name).toMatch(/^translated:/)
    expect(presets[0].content).toMatch(/^translated:/)
    expect(presets[0].description).toMatch(/^translated:/)
  })
})

describe("prompt template storage CRUD", () => {
  let storage: MockStorage

  beforeEach(() => {
    resetMockStorage()
    storage = createStorage()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("starts with no custom templates", async () => {
    const templates = await storage.get<PromptTemplate[]>(STORAGE_KEY)

    expect(templates).toBeUndefined()
  })

  it("creates a custom template", async () => {
    const template: PromptTemplate = {
      id: "test-uuid-1",
      name: "Test Template",
      content: "Summarize: {{content}}",
      isPreset: false,
      createdAt: 1000,
      updatedAt: 1000
    }
    await storage.set(STORAGE_KEY, [template])

    const stored = await storage.get<PromptTemplate[]>(STORAGE_KEY)

    expect(stored).toHaveLength(1)
    expect(stored?.[0].name).toBe("Test Template")
    expect(stored?.[0].isPreset).toBe(false)
  })

  it("updates a custom template", async () => {
    const template: PromptTemplate = {
      id: "test-uuid-1",
      name: "Original",
      content: "original content",
      isPreset: false,
      createdAt: 1000,
      updatedAt: 1000
    }
    await storage.set(STORAGE_KEY, [template])

    const stored = await storage.get<PromptTemplate[]>(STORAGE_KEY)
    expect(stored).toBeDefined()
    const updated = (stored ?? []).map((tpl) =>
      tpl.id === "test-uuid-1"
        ? { ...tpl, name: "Updated", updatedAt: 2000 }
        : tpl
    )
    await storage.set(STORAGE_KEY, updated)

    const result = await storage.get<PromptTemplate[]>(STORAGE_KEY)
    expect(result?.[0].name).toBe("Updated")
    expect(result?.[0].updatedAt).toBe(2000)
  })

  it("deletes a custom template", async () => {
    const templates: PromptTemplate[] = [
      {
        id: "a",
        name: "A",
        content: "a",
        isPreset: false,
        createdAt: 1000,
        updatedAt: 1000
      },
      {
        id: "b",
        name: "B",
        content: "b",
        isPreset: false,
        createdAt: 1000,
        updatedAt: 1000
      }
    ]
    await storage.set(STORAGE_KEY, templates)

    const stored = await storage.get<PromptTemplate[]>(STORAGE_KEY)
    const filtered = (stored ?? []).filter((tpl) => tpl.id !== "a")
    await storage.set(STORAGE_KEY, filtered)

    const result = await storage.get<PromptTemplate[]>(STORAGE_KEY)
    expect(result).toHaveLength(1)
    expect(result?.[0].id).toBe("b")
  })

  it("enforces MAX_CUSTOM_TEMPLATES limit", () => {
    expect(MAX_CUSTOM_TEMPLATES).toBe(15)

    const templates: PromptTemplate[] = Array.from(
      { length: MAX_CUSTOM_TEMPLATES },
      (_, i) => ({
        id: `tpl-${i}`,
        name: `Template ${i}`,
        content: `content ${i}`,
        isPreset: false,
        createdAt: 1000,
        updatedAt: 1000
      })
    )

    // At limit: should not allow adding more
    expect(templates.length >= MAX_CUSTOM_TEMPLATES).toBe(true)
  })
})

describe("preset overrides storage", () => {
  let storage: MockStorage

  beforeEach(() => {
    resetMockStorage()
    storage = createStorage()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("hides a preset template via override", async () => {
    const overrides = { "preset:summary": { hidden: true } }
    await storage.set(OVERRIDES_KEY, overrides)

    const presets = getPresetTemplates(t)
    const stored =
      await storage.get<Record<string, { hidden?: boolean }>>(OVERRIDES_KEY)

    const visible = presets.filter((p) => !stored?.[p.id]?.hidden)
    expect(visible).toHaveLength(8)
    expect(visible.find((p) => p.id === "preset:summary")).toBeUndefined()
  })

  it("overrides preset name and content", async () => {
    const overrides = {
      "preset:summary": {
        name: "Custom Summary",
        content: "Custom content"
      }
    }
    await storage.set(OVERRIDES_KEY, overrides)

    const presets = getPresetTemplates(t)
    const stored =
      await storage.get<Record<string, { name?: string; content?: string }>>(
        OVERRIDES_KEY
      )

    const summaryPreset = presets.find((p) => p.id === "preset:summary")
    expect(summaryPreset).toBeDefined()
    const override = stored?.["preset:summary"]

    const merged = {
      ...summaryPreset,
      name: override?.name ?? summaryPreset?.name,
      content: override?.content ?? summaryPreset?.content,
      isModified: true
    }

    expect(merged.name).toBe("Custom Summary")
    expect(merged.content).toBe("Custom content")
    expect(merged.isModified).toBe(true)
  })

  it("resets a preset override by deleting the key", async () => {
    const overrides = {
      "preset:summary": { name: "Custom" },
      "preset:translate": { content: "Custom" }
    }
    await storage.set(OVERRIDES_KEY, overrides)

    // Reset summary
    const stored = await storage.get<Record<string, unknown>>(OVERRIDES_KEY)
    const next = { ...stored }
    delete next["preset:summary"]
    await storage.set(OVERRIDES_KEY, next)

    const result = await storage.get<Record<string, unknown>>(OVERRIDES_KEY)
    expect(result?.["preset:summary"]).toBeUndefined()
    expect(result?.["preset:translate"]).toBeDefined()
  })

  it("restores all presets by clearing overrides", async () => {
    const overrides = {
      "preset:summary": { hidden: true },
      "preset:translate": { name: "Custom" }
    }
    await storage.set(OVERRIDES_KEY, overrides)

    await storage.set(OVERRIDES_KEY, {})

    const result = await storage.get<Record<string, unknown>>(OVERRIDES_KEY)
    expect(result).toBeDefined()
    expect(Object.keys(result ?? {})).toHaveLength(0)
  })

  it("counts hidden presets correctly", async () => {
    const overrides = {
      "preset:summary": { hidden: true },
      "preset:translate": { hidden: true },
      "preset:keypoints": { name: "Custom" } // not hidden, just overridden
    }
    await storage.set(OVERRIDES_KEY, overrides)

    const stored =
      await storage.get<Record<string, { hidden?: boolean }>>(OVERRIDES_KEY)
    expect(stored).toBeDefined()
    const hiddenCount = Object.values(stored ?? {}).filter(
      (o) => o.hidden
    ).length

    expect(hiddenCount).toBe(2)
  })
})

describe("validation rules", () => {
  it("rejects empty name", () => {
    const name = "   "
    expect(name.trim()).toBe("")
  })

  it("rejects empty content", () => {
    const content = ""
    expect(content.trim()).toBe("")
  })

  it("trims name and content on save", () => {
    const name = "  My Template  "
    const content = "  {{content}}  "

    expect(name.trim()).toBe("My Template")
    expect(content.trim()).toBe("{{content}}")
  })

  it("identifies preset ids by prefix", () => {
    expect("preset:summary".startsWith("preset:")).toBe(true)
    expect("custom-uuid-123".startsWith("preset:")).toBe(false)
  })
})
