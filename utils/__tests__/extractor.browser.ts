import { afterEach, describe, expect, it, vi } from "vitest"

import { createPlasmoStorageMock } from "./mocks"

// Mock @plasmohq/storage with shared mock
vi.mock("@plasmohq/storage", () => createPlasmoStorageMock())

vi.mock("../logger", () => ({
  debugLog: vi.fn()
}))

vi.mock("../readability-extractor", () => ({
  convertHtmlToMarkdown: vi.fn(async (html: string) => {
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || ""
  }),
  extractImagesFromMarkdown: vi.fn(() => []),
  evaluateContentQuality: vi.fn(),
  extractWithReadability: vi.fn()
}))

import {
  extractArticleContent,
  extractAuthor,
  extractMetadata,
  extractPublishDate,
  extractTitle,
  getFirstMatchContent
} from "../extractor"

// Global cleanup after each test
afterEach(() => {
  document.head.innerHTML = ""
  document.body.innerHTML = ""
})

describe("extractMetadata", () => {
  it("extracts name and property based meta tags", () => {
    document.head.innerHTML = `
      <meta name="author" content="Author">
      <meta name="description" content="Desc">
      <meta property="og:title" content="OG Title">
      <meta name="twitter:card" content="summary">
    `
    const metadata = extractMetadata()
    expect(metadata.author).toBe("Author")
    expect(metadata.description).toBe("Desc")
    expect(metadata["og:title"]).toBe("OG Title")
    expect(metadata["twitter:card"]).toBe("summary")
  })

  it("ignores empty content and non-content meta tags", () => {
    document.head.innerHTML = `
      <meta charset="utf-8">
      <meta name="robots" content="">
      <meta name="viewport" content="width=device-width">
    `
    const metadata = extractMetadata()
    expect(metadata.robots).toBeUndefined()
    expect(metadata.viewport).toBe("width=device-width")
  })
})

describe("getFirstMatchContent", () => {
  it("returns first matching selector content with fallback", () => {
    document.body.innerHTML = `
      <div class="content">Content</div>
      <div class="main">Main</div>
    `
    expect(
      getFirstMatchContent(
        [".content", ".main"],
        (el) => el.textContent?.trim() || ""
      )
    ).toBe("Content")
    expect(
      getFirstMatchContent(
        [".missing", ".main"],
        (el) => el.textContent?.trim() || ""
      )
    ).toBe("Main")
    expect(
      getFirstMatchContent([".missing"], (el) => el.textContent?.trim() || "")
    ).toBe("")
  })

  it("skips empty elements and handles various selectors", () => {
    document.body.innerHTML = `
      <div class="empty"></div>
      <div id="main">By ID</div>
      <article data-type="blog">By attr</article>
    `
    expect(
      getFirstMatchContent(
        [".empty", "#main"],
        (el) => el.textContent?.trim() || ""
      )
    ).toBe("By ID")
    expect(
      getFirstMatchContent(
        ['[data-type="blog"]'],
        (el) => el.textContent?.trim() || ""
      )
    ).toBe("By attr")
  })
})

describe("extractArticleContent", () => {
  it("extracts content from article tag", async () => {
    document.body.innerHTML = `
      <article>
        <h1>Article Title</h1>
        <p>Article content here</p>
      </article>
    `

    const { content, results } = await extractArticleContent()

    expect(content).toContain("Article Title")
    expect(content).toContain("Article content here")
    expect(results).toHaveLength(1)
    expect(results[0].selector).toBe("article (longest)")
  })

  it("selects longest article when multiple exist", async () => {
    document.body.innerHTML = `
      <article>Short</article>
      <article>This is a much longer article with more content</article>
      <article>Medium length article</article>
    `

    const { content, results } = await extractArticleContent()

    expect(content).toContain("much longer article")
    expect(results[0].selector).toBe("article (longest)")
  })

  it("uses custom selector when provided", async () => {
    document.body.innerHTML = `
      <article>Article content</article>
      <div class="custom-content">Custom content here</div>
    `

    const { content, results } = await extractArticleContent(
      [],
      ".custom-content"
    )

    expect(content).toContain("Custom content here")
    expect(results[0].selector).toBe(".custom-content")
  })

  it("falls back to paragraph collection when no article found", async () => {
    document.body.innerHTML = `
      <div>
        <p>First paragraph with enough text to be considered meaningful content</p>
        <p>Second paragraph also with sufficient length</p>
        <p>Third paragraph continues the content</p>
        <p>Fourth paragraph wraps it up nicely</p>
      </div>
    `

    const { content, results } = await extractArticleContent()

    expect(content).toContain("First paragraph")
    expect(results.some((r) => r.selector.includes("paragraphs"))).toBe(true)
  })

  it("returns body content as last resort", async () => {
    document.body.innerHTML = `<div>Only body content</div>`

    const { results } = await extractArticleContent()

    expect(results.some((r) => r.selector === "body")).toBe(true)
  })
})

describe("extractTitle", () => {
  it("extracts title from meta tag", async () => {
    document.head.innerHTML = `<meta property="og:title" content="Meta Title">`

    const { title, results } = await extractTitle()

    expect(title).toBe("Meta Title")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].selector).toBe('meta[property="og:title"]')
    expect(results[0].content).toBe("Meta Title")
  })

  it("falls back to h1 when no meta tag", async () => {
    document.body.innerHTML = `<h1>Page Title from H1</h1>`

    const { title } = await extractTitle()

    expect(title).toBe("Page Title from H1")
  })

  it("returns empty string when no title found", async () => {
    const { title } = await extractTitle()

    expect(title).toBe("")
  })
})

describe("extractAuthor", () => {
  it("extracts author from meta tag", async () => {
    document.head.innerHTML = `<meta name="author" content="John Doe">`

    const { author, results } = await extractAuthor()

    expect(author).toBe("John Doe")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].selector).toBe('meta[name="author"]')
    expect(results[0].content).toBe("John Doe")
  })

  it("extracts author from element with author class", async () => {
    document.body.innerHTML = `<span class="author-name">Jane Smith</span>`

    const { author, results } = await extractAuthor()

    expect(author).toBe("Jane Smith")
    expect(results.length).toBeGreaterThan(0)
    // The matching selector should be in the results
    const authorResult = results.find((r) => r.content === "Jane Smith")
    expect(authorResult).toBeDefined()
    expect(authorResult?.selector).toBe('[class*="author"]')
  })
})

describe("extractPublishDate", () => {
  it("extracts date from meta tag", async () => {
    document.head.innerHTML = `<meta property="article:published_time" content="2024-01-15">`

    const { publishDate, results } = await extractPublishDate()

    expect(publishDate).toBe("2024-01-15")
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].selector).toBe('meta[property="article:published_time"]')
    expect(results[0].content).toBe("2024-01-15")
  })

  it("extracts datetime from time element with class", async () => {
    document.body.innerHTML = `<time class="publish-date" datetime="2024-01-15">January 15, 2024</time>`

    const { publishDate } = await extractPublishDate()

    expect(publishDate).toBe("2024-01-15")
  })

  it("extracts text content from element with date class", async () => {
    document.body.innerHTML = `<span class="date-published">January 15, 2024</span>`

    const { publishDate } = await extractPublishDate()

    expect(publishDate).toBe("January 15, 2024")
  })

  it("returns empty string when no date found", async () => {
    const { publishDate } = await extractPublishDate()

    expect(publishDate).toBe("")
  })
})
