import { afterEach, describe, expect, it } from "vitest"

import type { ImageInfo } from "~constants/types"

import { extractFormattedText } from "../formatter"

describe("extractFormattedText", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("converts h1 headings to markdown format", () => {
    const div = document.createElement("div")
    div.innerHTML = "<h1>Main Title</h1><p>Content paragraph</p>"
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("# Main Title")
    expect(result).toContain("Content paragraph")
  })

  it("converts all heading levels correctly", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <h1>H1</h1>
      <h2>H2</h2>
      <h3>H3</h3>
      <h4>H4</h4>
      <h5>H5</h5>
      <h6>H6</h6>
    `
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("# H1")
    expect(result).toContain("## H2")
    expect(result).toContain("### H3")
    expect(result).toContain("#### H4")
    expect(result).toContain("##### H5")
    expect(result).toContain("###### H6")
  })

  it("extracts images with markdown syntax", () => {
    const div = document.createElement("div")
    div.innerHTML = '<img src="test.jpg" alt="Test Image">'
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("![Test Image](test.jpg)")
    expect(images).toHaveLength(1)
    expect(images[0].src).toBe("test.jpg")
    expect(images[0].alt).toBe("Test Image")
  })

  it("extracts images without alt text using fallback", () => {
    const div = document.createElement("div")
    div.innerHTML = '<img src="no-alt.jpg">'
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toMatch(/!\[.*\]\(no-alt\.jpg\)/)
    expect(images).toHaveLength(1)
  })

  it("handles figure elements with captions", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <figure>
        <img src="photo.jpg" alt="Photo">
        <figcaption>Photo description here</figcaption>
      </figure>
    `
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("![Photo](photo.jpg)")
    expect(result).toContain("Photo description here")
    expect(images).toHaveLength(1)
    expect(images[0].src).toBe("photo.jpg")
  })

  it("uses caption as alt when alt is empty", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <figure>
        <img src="photo.jpg">
        <figcaption>Caption text</figcaption>
      </figure>
    `
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("![Caption text](photo.jpg)")
  })

  it("converts tables to markdown format", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <table>
        <tr><th>Header1</th><th>Header2</th></tr>
        <tr><td>Cell1</td><td>Cell2</td></tr>
      </table>
    `
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("| Header1 | Header2 |")
    expect(result).toContain("| --- |")
    expect(result).toContain("| Cell1 | Cell2 |")
  })

  it("converts blockquotes correctly", () => {
    const div = document.createElement("div")
    div.innerHTML = "<blockquote>This is a quote</blockquote>"
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("> This is a quote")
  })

  it("converts list items correctly", () => {
    const div = document.createElement("div")
    div.innerHTML = "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>"
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("- Item 1")
    expect(result).toContain("- Item 2")
    expect(result).toContain("- Item 3")
  })

  it("converts code blocks correctly", () => {
    const div = document.createElement("div")
    div.innerHTML = "<pre><code>const x = 1;</code></pre>"
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("```")
    expect(result).toContain("const x = 1;")
  })

  it("converts standalone bold text to markdown", () => {
    const div = document.createElement("div")
    div.innerHTML = "<div><strong>bold text</strong></div>"
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("**bold text**")
  })

  it("converts standalone italic text to markdown", () => {
    const div = document.createElement("div")
    div.innerHTML = "<div><em>italic text</em></div>"
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("*italic text*")
  })

  it("converts links to markdown format", () => {
    const div = document.createElement("div")
    div.innerHTML = '<a href="https://example.com">Click here</a>'
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("[Click here](https://example.com)")
  })

  it("ignores javascript and anchor links", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <a href="javascript:void(0)">JS Link</a>
      <a href="#section">Anchor</a>
    `
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("JS Link")
    expect(result).toContain("Anchor")
    expect(result).not.toContain("[JS Link]")
    expect(result).not.toContain("[Anchor]")
  })

  it("extracts images from links (fancybox pattern)", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <a class="fancybox" href="large.jpg">
        <img src="thumb.jpg" alt="Thumbnail">
      </a>
    `
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(images).toHaveLength(1)
    expect(images[0].src).toBe("large.jpg")
    // fancybox 应该使用 href 作为图片源，而不是 img 的 src
    expect(result).toContain("![Thumbnail](large.jpg)")
  })

  it("handles nested containers (div, section, article)", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <article>
        <section>
          <div>
            <p>Nested content</p>
          </div>
        </section>
      </article>
    `
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(result).toContain("Nested content")
  })

  it("handles multiple images with correct indexing", () => {
    const div = document.createElement("div")
    div.innerHTML = `
      <img src="img1.jpg" alt="First">
      <img src="img2.jpg" alt="Second">
      <img src="img3.jpg" alt="Third">
    `
    const images: ImageInfo[] = []
    extractFormattedText(div, images)
    expect(images).toHaveLength(3)
    expect(images[0].index).toBe(0)
    expect(images[1].index).toBe(1)
    expect(images[2].index).toBe(2)
  })

  it("skips data: URI images", () => {
    const div = document.createElement("div")
    div.innerHTML = '<img src="data:image/png;base64,abc123" alt="Data URI">'
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(images).toHaveLength(0)
    expect(result).not.toContain("data:image")
  })

  it("handles images with data-original attribute", () => {
    const div = document.createElement("div")
    div.innerHTML =
      '<img src="placeholder.jpg" data-original="real-image.jpg" alt="Lazy">'
    const images: ImageInfo[] = []
    const result = extractFormattedText(div, images)
    expect(images).toHaveLength(1)
    // 应该提取到图片并生成 markdown 语法
    expect(result).toMatch(/!\[Lazy\]\(.+\.jpg\)/)
  })
})
