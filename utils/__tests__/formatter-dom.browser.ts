import { afterEach, describe, expect, it } from "vitest"

import type { ImageInfo } from "~constants/types"

import { cleanContent, extractFormattedText, formatContent } from "../formatter"

describe("extractFormattedText", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("converts headings to markdown format", () => {
    const div = document.createElement("div")
    div.innerHTML = "<h1>H1</h1><h2>H2</h2><h3>H3</h3>"
    const result = extractFormattedText(div, [])
    expect(result).toContain("# H1")
    expect(result).toContain("## H2")
    expect(result).toContain("### H3")
  })

  it("converts common elements to markdown", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <blockquote>Quote</blockquote>
      <ul><li>Item</li></ul>
      <pre><code>code</code></pre>
      <a href="https://example.com">Link</a>
    `
    const result = extractFormattedText(div, [])
    expect(result).toContain("> Quote")
    expect(result).toContain("- Item")
    expect(result).toContain("```")
    expect(result).toContain("[Link](https://example.com)")
  })

  it("extracts images with markdown syntax and populates array", () => {
    const div = document.createElement("div")
    div.innerHTML =
      '<img src="test.jpg" alt="Test"><img src="img2.jpg" alt="Two">'
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("![Test](test.jpg)")
    expect(images).toHaveLength(2)
    expect(images[0]).toMatchObject({ src: "test.jpg", alt: "Test", index: 0 })
  })

  it("handles figure with caption and fancybox pattern", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <figure><img src="photo.jpg"><figcaption>Caption</figcaption></figure>
      <a class="fancybox" href="large.jpg"><img src="thumb.jpg" alt="Thumb"></a>
    `
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("![Caption](photo.jpg)")
    expect(result).toContain("![Thumb](large.jpg)")
    expect(images[1].src).toBe("large.jpg")
  })

  it("converts tables to markdown format", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <table>
        <tr><th>Header1</th><th>Header2</th></tr>
        <tr><td>Cell1</td><td>Cell2</td></tr>
      </table>
    `
    const result = extractFormattedText(div, [])
    expect(result).toContain("| Header1 | Header2 |")
    expect(result).toContain("| --- |")
    expect(result).toContain("| Cell1 | Cell2 |")
  })

  it("ignores javascript/anchor links and data: URI images", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <a href="javascript:void(0)">JS</a>
      <a href="#section">Anchor</a>
      <img src="data:image/png;base64,abc" alt="Data">
    `
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).not.toContain("[JS]")
    expect(result).not.toContain("[Anchor]")
    expect(images).toHaveLength(0)
  })
})

describe("formatContent", () => {
  it("returns empty string for empty input", () => {
    expect(formatContent("")).toBe("")
  })

  it("normalizes excessive newlines to double newlines", () => {
    expect(formatContent("a\n\n\nb")).toBe("a\n\nb")
    expect(formatContent("a\n\n\n\n\nb")).toBe("a\n\nb")
  })

  it("converts CRLF to LF", () => {
    expect(formatContent("a\r\nb")).toBe("a\nb")
  })

  it("preserves double newlines for paragraph breaks", () => {
    expect(formatContent("para1\n\npara2")).toBe("para1\n\npara2")
  })
})

describe("cleanContent", () => {
  it("returns empty string for empty input", () => {
    expect(cleanContent("")).toBe("")
  })

  it("removes excessive whitespace", () => {
    expect(cleanContent("hello   world")).toBe("hello world")
    expect(cleanContent("hello\n\nworld")).toBe("hello world")
  })

  it("fixes punctuation spacing", () => {
    expect(cleanContent("hello , world")).toBe("hello, world")
    expect(cleanContent("hello . world")).toBe("hello. world")
    expect(cleanContent("hello ! world")).toBe("hello! world")
  })

  it("preserves code blocks unchanged", () => {
    const input = "text before ```\ncode here\n``` text after"
    const result = cleanContent(input)
    expect(result).toContain("```\ncode here\n```")
  })

  it("preserves markdown heading format", () => {
    const input = "# Title\n\n## Subtitle"
    const result = cleanContent(input)
    expect(result).toContain("# Title")
    expect(result).toContain("## Subtitle")
  })

  it("fixes bracket and quote spacing", () => {
    expect(cleanContent("( hello )")).toBe("(hello)")
    expect(cleanContent("[ hello ]")).toBe("[hello]")
  })
})
