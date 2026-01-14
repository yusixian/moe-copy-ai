import { describe, expect, it } from "vitest"

import { detectMarkdown, generateUUID } from "../index"

describe("detectMarkdown", () => {
  it("detects common markdown syntax", () => {
    // Headings
    expect(detectMarkdown("# Title")).toBe(true)
    // Links and images
    expect(detectMarkdown("[link](url)")).toBe(true)
    expect(detectMarkdown("![alt](img.jpg)")).toBe(true)
    // Lists
    expect(detectMarkdown("- Item")).toBe(true)
    expect(detectMarkdown("1. Item")).toBe(true)
    // Blockquotes
    expect(detectMarkdown("> Quote")).toBe(true)
    // Code
    expect(detectMarkdown("```code```")).toBe(true)
    expect(detectMarkdown("Use `code` here")).toBe(true)
    // Formatting
    expect(detectMarkdown("**bold**")).toBe(true)
    expect(detectMarkdown("*italic*")).toBe(true)
    expect(detectMarkdown("~~strike~~")).toBe(true)
    // Tables and rules
    expect(detectMarkdown("| A | B |")).toBe(true)
    expect(detectMarkdown("---")).toBe(true)
  })

  it("returns false for plain text and empty content", () => {
    expect(detectMarkdown("Just plain text")).toBe(false)
    expect(detectMarkdown("")).toBe(false)
    expect(detectMarkdown(null as unknown as string)).toBe(false)
  })
})

describe("generateUUID", () => {
  it("returns valid UUID v4 format", () => {
    const uuid = generateUUID()
    // Pattern validates: length, format, version (4), and variant bits (8/9/a/b)
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it("generates unique values", () => {
    const uuids = new Set([generateUUID(), generateUUID(), generateUUID()])
    expect(uuids.size).toBe(3)
  })
})
