import { describe, expect, it } from "vitest"

import {
  evaluateContentQuality,
  extractImagesFromMarkdown
} from "../readability-extractor"

describe("evaluateContentQuality", () => {
  it("returns empty content result for two empty strings", () => {
    const result = evaluateContentQuality("", "")
    expect(result.betterContent).toBe("")
    expect(result.scores.selector).toBe(0)
    expect(result.scores.readability).toBe(0)
  })

  it("prefers non-empty content over empty", () => {
    const content = "Some actual content here with enough text to score points."
    const result = evaluateContentQuality(content, "")
    expect(result.betterContent).toBe(content)
  })

  it("prefers longer content when scores are close", () => {
    const short = "Short content"
    const long =
      "Much longer content with multiple paragraphs\n\n" +
      "This is a second paragraph with more text.\n\n" +
      "And a third paragraph to make it even longer."
    const result = evaluateContentQuality(short, long)
    expect(result.betterContent).toBe(long)
  })

  it("scores content with headings higher", () => {
    const withHeadings =
      "# Title\n\nFirst paragraph with content.\n\n## Section\n\nMore content here."
    const withoutHeadings =
      "Plain text content without any structure or headings at all."
    const result = evaluateContentQuality(withHeadings, withoutHeadings)
    expect(result.scores.selector).toBeGreaterThan(result.scores.readability)
  })

  it("scores content with paragraphs higher", () => {
    // Need longer paragraphs to meet the >20 character threshold for paragraph counting
    const withParagraphs =
      "First paragraph with enough content.\n\n" +
      "Second paragraph with enough content.\n\n" +
      "Third paragraph with enough content.\n\n" +
      "Fourth paragraph with enough content.\n\n" +
      "Fifth paragraph with enough content.\n\n" +
      "Sixth paragraph with enough content."
    const singleBlock = "Single block of text without paragraph breaks at all."
    const result = evaluateContentQuality(withParagraphs, singleBlock)
    expect(result.scores.selector).toBeGreaterThan(result.scores.readability)
  })

  it("penalizes content with high HTML tag density", () => {
    const cleanContent = "This is clean content without any HTML tags."
    const htmlyContent =
      "<div><span>Content</span></div><p><a href='#'>Link</a></p>"
    const result = evaluateContentQuality(cleanContent, htmlyContent)
    expect(result.scores.selector).toBeGreaterThan(result.scores.readability)
  })

  it("returns reason explaining the choice", () => {
    const content1 = "Short"
    const content2 =
      "Much longer content with multiple paragraphs and headings.\n\n# Heading\n\nMore text here."
    const result = evaluateContentQuality(content1, content2)
    expect(result.reason).toBeTruthy()
    expect(typeof result.reason).toBe("string")
  })

  it("handles very long content appropriately", () => {
    const longContent = "x".repeat(2000)
    const shortContent = "Short"
    const result = evaluateContentQuality(longContent, shortContent)
    expect(result.scores.selector).toBeGreaterThan(result.scores.readability)
  })
})

describe("extractImagesFromMarkdown", () => {
  it("returns empty array for content without images", () => {
    const md = "Just some text without any images."
    const images = extractImagesFromMarkdown(md)
    expect(images).toHaveLength(0)
  })

  it("extracts single image from markdown", () => {
    const md = "Text ![alt text](https://example.com/img.jpg) more text"
    const images = extractImagesFromMarkdown(md)
    expect(images).toHaveLength(1)
    expect(images[0].src).toBe("https://example.com/img.jpg")
    expect(images[0].alt).toBe("alt text")
    expect(images[0].index).toBe(0)
  })

  it("extracts multiple images with correct indices", () => {
    const md = "![a](url1.jpg) text ![b](url2.png) more ![c](url3.gif)"
    const images = extractImagesFromMarkdown(md)
    expect(images).toHaveLength(3)
    expect(images.map((i) => i.index)).toEqual([0, 1, 2])
    expect(images.map((i) => i.src)).toEqual([
      "url1.jpg",
      "url2.png",
      "url3.gif"
    ])
    expect(images.map((i) => i.alt)).toEqual(["a", "b", "c"])
  })

  it("handles empty alt text with fallback", () => {
    const md = "![](https://example.com/no-alt.jpg)"
    const images = extractImagesFromMarkdown(md)
    expect(images).toHaveLength(1)
    expect(images[0].alt).toContain("0")
  })

  it("handles complex URLs", () => {
    const md =
      "![test](https://example.com/path/to/image.jpg?query=value&other=1)"
    const images = extractImagesFromMarkdown(md)
    expect(images).toHaveLength(1)
    expect(images[0].src).toBe(
      "https://example.com/path/to/image.jpg?query=value&other=1"
    )
  })

  it("handles relative URLs", () => {
    const md = "![local](/images/photo.png)"
    const images = extractImagesFromMarkdown(md)
    expect(images).toHaveLength(1)
    expect(images[0].src).toBe("/images/photo.png")
  })

  it("handles images with special characters in alt", () => {
    const md = '![Image with "quotes" and special chars!](url.jpg)'
    const images = extractImagesFromMarkdown(md)
    expect(images).toHaveLength(1)
    expect(images[0].alt).toBe('Image with "quotes" and special chars!')
  })

  it("extracts images from multiline markdown", () => {
    const md = `# Article Title

![First image](img1.jpg)

Some paragraph text here.

![Second image](img2.jpg)

More text.`
    const images = extractImagesFromMarkdown(md)
    expect(images).toHaveLength(2)
    expect(images[0].src).toBe("img1.jpg")
    expect(images[1].src).toBe("img2.jpg")
  })
})
