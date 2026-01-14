import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@plasmohq/storage", () => ({
  Storage: class {
    private store = new Map<string, unknown>()
    async get<T>(key: string): Promise<T | undefined> {
      return this.store.get(key) as T | undefined
    }
    async set(key: string, value: unknown): Promise<void> {
      this.store.set(key, value)
    }
    watch(): () => void {
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
  beforeEach(() => {
    document.body.innerHTML = ""
  })
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("returns first matching selector content with fallback", () => {
    document.body.innerHTML = `
      <div class="content">Content</div>
      <div class="main">Main</div>
    `
    expect(
      getFirstMatchContent([".content", ".main"], (el) => el.textContent?.trim() || "")
    ).toBe("Content")
    expect(
      getFirstMatchContent([".missing", ".main"], (el) => el.textContent?.trim() || "")
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
      getFirstMatchContent([".empty", "#main"], (el) => el.textContent?.trim() || "")
    ).toBe("By ID")
    expect(
      getFirstMatchContent(['[data-type="blog"]'], (el) => el.textContent?.trim() || "")
    ).toBe("By attr")
  })
})
