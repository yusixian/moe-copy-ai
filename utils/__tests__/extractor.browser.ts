import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Mock @plasmohq/storage before importing extractor
vi.mock("@plasmohq/storage", () => ({
  Storage: class {
    private store = new Map<string, unknown>()
    async get<T>(key: string): Promise<T | undefined> {
      return this.store.get(key) as T | undefined
    }
    async set(key: string, value: unknown): Promise<void> {
      this.store.set(key, value)
    }
    watch(_callback: () => void): () => void {
      return () => {}
    }
  }
}))

import { extractMetadata, getFirstMatchContent } from "../extractor"

describe("extractMetadata", () => {
  beforeEach(() => {
    document.head.innerHTML = ""
  })

  afterEach(() => {
    document.head.innerHTML = ""
  })

  it("extracts name-based meta tags", () => {
    document.head.innerHTML = `
      <meta name="author" content="Test Author">
      <meta name="description" content="Test Description">
      <meta name="keywords" content="test, keywords">
    `
    const metadata = extractMetadata()
    expect(metadata.author).toBe("Test Author")
    expect(metadata.description).toBe("Test Description")
    expect(metadata.keywords).toBe("test, keywords")
  })

  it("extracts property-based meta tags (Open Graph)", () => {
    document.head.innerHTML = `
      <meta property="og:title" content="OG Title">
      <meta property="og:description" content="OG Description">
      <meta property="og:image" content="https://example.com/image.jpg">
      <meta property="og:url" content="https://example.com">
    `
    const metadata = extractMetadata()
    expect(metadata["og:title"]).toBe("OG Title")
    expect(metadata["og:description"]).toBe("OG Description")
    expect(metadata["og:image"]).toBe("https://example.com/image.jpg")
    expect(metadata["og:url"]).toBe("https://example.com")
  })

  it("extracts Twitter card meta tags", () => {
    document.head.innerHTML = `
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="Twitter Title">
      <meta name="twitter:creator" content="@username">
    `
    const metadata = extractMetadata()
    expect(metadata["twitter:card"]).toBe("summary_large_image")
    expect(metadata["twitter:title"]).toBe("Twitter Title")
    expect(metadata["twitter:creator"]).toBe("@username")
  })

  it("returns empty object when no meta tags exist", () => {
    document.head.innerHTML = ""
    const metadata = extractMetadata()
    expect(Object.keys(metadata)).toHaveLength(0)
  })

  it("ignores meta tags without name/property or content", () => {
    document.head.innerHTML = `
      <meta charset="utf-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width">
    `
    const metadata = extractMetadata()
    expect(metadata.viewport).toBe("width=device-width")
    expect(metadata["http-equiv"]).toBeUndefined()
  })

  it("handles mixed meta tags", () => {
    document.head.innerHTML = `
      <meta name="author" content="John Doe">
      <meta property="og:title" content="Page Title">
      <meta name="twitter:site" content="@site">
    `
    const metadata = extractMetadata()
    expect(metadata.author).toBe("John Doe")
    expect(metadata["og:title"]).toBe("Page Title")
    expect(metadata["twitter:site"]).toBe("@site")
  })

  it("handles empty content attribute", () => {
    document.head.innerHTML = '<meta name="robots" content="">'
    const metadata = extractMetadata()
    expect(metadata.robots).toBeUndefined()
  })
})

describe("getFirstMatchContent", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
  })

  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("returns content from first matching selector", () => {
    document.body.innerHTML = `
      <div class="content">Content here</div>
      <div class="main">Main content</div>
    `
    const result = getFirstMatchContent(
      [".content", ".main"],
      (el) => el.textContent?.trim() || ""
    )
    expect(result).toBe("Content here")
  })

  it("falls back to next selector when first doesnt match", () => {
    document.body.innerHTML = '<div class="main">Main content</div>'
    const result = getFirstMatchContent(
      [".nonexistent", ".main"],
      (el) => el.textContent?.trim() || ""
    )
    expect(result).toBe("Main content")
  })

  it("returns empty string when no selectors match", () => {
    document.body.innerHTML = "<div>Some content</div>"
    const result = getFirstMatchContent(
      [".missing", ".also-missing"],
      (el) => el.textContent?.trim() || ""
    )
    expect(result).toBe("")
  })

  it("skips elements with empty content", () => {
    document.body.innerHTML = `
      <div class="first"></div>
      <div class="second">Actual content</div>
    `
    const result = getFirstMatchContent(
      [".first", ".second"],
      (el) => el.textContent?.trim() || ""
    )
    expect(result).toBe("Actual content")
  })

  it("handles attribute-based selectors", () => {
    document.body.innerHTML = `
      <article data-type="blog">Blog post content</article>
    `
    const result = getFirstMatchContent(
      ['[data-type="blog"]'],
      (el) => el.textContent?.trim() || ""
    )
    expect(result).toBe("Blog post content")
  })

  it("handles meta element extraction", () => {
    document.head.innerHTML = '<meta name="author" content="Jane Smith">'
    const result = getFirstMatchContent(
      ['meta[name="author"]'],
      (el) => el.getAttribute("content") || ""
    )
    expect(result).toBe("Jane Smith")
  })

  it("handles complex selectors", () => {
    document.body.innerHTML = `
      <article>
        <header>
          <h1 class="title">Article Title</h1>
        </header>
      </article>
    `
    const result = getFirstMatchContent(
      ["article header h1.title"],
      (el) => el.textContent?.trim() || ""
    )
    expect(result).toBe("Article Title")
  })

  it("works with ID selectors", () => {
    document.body.innerHTML = '<div id="main-content">Main content by ID</div>'
    const result = getFirstMatchContent(
      ["#main-content"],
      (el) => el.textContent?.trim() || ""
    )
    expect(result).toBe("Main content by ID")
  })
})
