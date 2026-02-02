import { describe, expect, it } from "vitest"

import {
  evaluateContentQuality,
  extractImagesFromMarkdown
} from "../readability-extractor"

describe("evaluateContentQuality", () => {
  it("returns empty result for empty inputs", async () => {
    const result = await evaluateContentQuality("", "")
    expect(result.betterContent).toBe("")
    expect(result.scores.selector).toBe(0)
  })

  it("prefers structured content with headings and paragraphs", async () => {
    const structured =
      "# Title\n\nFirst paragraph with content.\n\n## Section\n\nMore content."
    const plain = "Plain text without structure."
    const result = await evaluateContentQuality(structured, plain)
    expect(result.betterContent).toBe(structured)
    expect(result.scores.selector).toBeGreaterThan(result.scores.readability)
  })

  it("penalizes HTML-heavy content", async () => {
    const clean = "Clean content without HTML tags here."
    const htmly = "<div><span>Content</span></div><p><a href='#'>Link</a></p>"
    const result = await evaluateContentQuality(clean, htmly)
    expect(result.scores.selector).toBeGreaterThan(result.scores.readability)
  })
})

describe("extractImagesFromMarkdown", () => {
  it("extracts images with correct properties", async () => {
    const md = "![alt](url1.jpg) text ![b](url2.png)"
    const images = await extractImagesFromMarkdown(md)
    expect(images).toHaveLength(2)
    expect(images[0]).toMatchObject({ src: "url1.jpg", alt: "alt", index: 0 })
    expect(images[1]).toMatchObject({ src: "url2.png", alt: "b", index: 1 })
  })

  it("handles edge cases", async () => {
    expect(await extractImagesFromMarkdown("No images here")).toHaveLength(0)
    expect(
      (await extractImagesFromMarkdown("![](no-alt.jpg)"))[0].alt
    ).toContain("0")
    expect(
      (await extractImagesFromMarkdown("![test](url.jpg?q=1&o=2)"))[0].src
    ).toContain("?q=1")
  })
})
