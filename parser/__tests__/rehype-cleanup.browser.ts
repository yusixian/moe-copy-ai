import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { parseHtmlToMarkdown } from "../htmlParser"

async function toMarkdown(html: string): Promise<string> {
  return parseHtmlToMarkdown(html)
}

describe("rehypeCleanup — tag removal through pipeline", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("removes script elements", async () => {
    const md = await toMarkdown(
      '<script>console.log("test")</script><p>Content</p>'
    )
    expect(md).not.toContain("console.log")
    expect(md).toContain("Content")
  })

  it("removes style elements", async () => {
    const md = await toMarkdown("<style>.red { color: red }</style><p>Text</p>")
    expect(md).not.toContain(".red")
    expect(md).toContain("Text")
  })

  it("removes noscript elements", async () => {
    const md = await toMarkdown(
      "<noscript><p>Please enable JS</p></noscript><p>Text</p>"
    )
    expect(md).toContain("Text")
  })

  it("removes meta and link elements", async () => {
    const html =
      '<meta charset="utf-8"><link rel="stylesheet" href="style.css"><p>Text</p>'
    const md = await toMarkdown(html)
    expect(md).not.toContain("stylesheet")
    expect(md).toContain("Text")
  })

  it("removes SVG elements", async () => {
    const md = await toMarkdown(
      '<svg viewBox="0 0 100 100"><circle r="50"/></svg><p>Text</p>'
    )
    expect(md).not.toContain("svg")
    expect(md).not.toContain("circle")
    expect(md).toContain("Text")
  })

  it("preserves normal HTML content", async () => {
    const md = await toMarkdown("<p>Hello <strong>world</strong>!</p>")
    expect(md).toContain("Hello")
    expect(md).toContain("**world**")
  })
})
