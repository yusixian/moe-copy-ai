import { describe, expect, it } from "vitest"

import type { ExtractedLink } from "~constants/types"

import {
  deduplicateLinks,
  filterLinks,
  isSameDomain,
  isValidScrapableUrl,
  resolveUrl
} from "../link-extractor"

describe("resolveUrl", () => {
  it("converts relative URLs to absolute", () => {
    expect(resolveUrl("/page", "https://example.com")).toBe(
      "https://example.com/page"
    )
    expect(resolveUrl("../page.html", "https://example.com/dir/sub/")).toBe(
      "https://example.com/dir/page.html"
    )
    expect(resolveUrl("//cdn.example.com/img.jpg", "https://example.com")).toBe(
      "https://cdn.example.com/img.jpg"
    )
  })

  it("returns absolute URL unchanged or original on invalid base", () => {
    expect(resolveUrl("https://other.com/page", "https://example.com")).toBe(
      "https://other.com/page"
    )
    expect(resolveUrl("/page", "not-a-url")).toBe("/page")
  })
})

describe("isSameDomain", () => {
  it("returns true for same domain regardless of path or protocol", () => {
    expect(isSameDomain("https://example.com/page", "https://example.com")).toBe(true)
    expect(isSameDomain("http://example.com/page", "https://example.com")).toBe(true)
    expect(isSameDomain("/page", "https://example.com")).toBe(true)
  })

  it("returns false for different domains, subdomains, or invalid URLs", () => {
    expect(isSameDomain("https://other.com/page", "https://example.com")).toBe(false)
    expect(isSameDomain("https://sub.example.com/page", "https://example.com")).toBe(false)
    expect(isSameDomain("not-a-url", "also-not-a-url")).toBe(false)
  })
})

describe("isValidScrapableUrl", () => {
  it("rejects non-scrapable URLs", () => {
    expect(isValidScrapableUrl("javascript:void(0)")).toBe(false)
    expect(isValidScrapableUrl("mailto:test@example.com")).toBe(false)
    expect(isValidScrapableUrl("tel:+1234567890")).toBe(false)
    expect(isValidScrapableUrl("data:text/html,<h1>Hi</h1>")).toBe(false)
    expect(isValidScrapableUrl("#section")).toBe(false)
  })

  it("accepts valid URLs", () => {
    expect(isValidScrapableUrl("https://example.com")).toBe(true)
    expect(isValidScrapableUrl("/page")).toBe(true)
    expect(isValidScrapableUrl("page.html")).toBe(true)
  })
})

describe("filterLinks", () => {
  const baseUrl = "https://example.com/current/page"
  const link = (url: string, i: number): ExtractedLink => ({
    url,
    text: `Link ${i}`,
    index: i
  })

  it("filters by validity and options", () => {
    const links = [
      link("https://example.com/page1", 0),
      link("https://other.com/page2", 1),
      link("javascript:void(0)", 2),
      link("https://example.com/current/page#anchor", 3)
    ]
    const result = filterLinks(links, baseUrl, {
      sameDomainOnly: true,
      excludeAnchors: true,
      excludeJavaScript: true
    })
    expect(result).toHaveLength(1)
    expect(result[0].url).toBe("https://example.com/page1")
  })

  it("applies custom exclude patterns", () => {
    const links = [link("/login", 0), link("/logout", 1), link("/page", 2)]
    const result = filterLinks(links, baseUrl, {
      excludePatterns: [/login/, /logout/]
    })
    expect(result).toHaveLength(1)
    expect(result[0].url).toBe("/page")
  })
})

describe("deduplicateLinks", () => {
  const baseUrl = "https://example.com"
  const link = (url: string, text: string, i: number): ExtractedLink => ({
    url,
    text,
    index: i
  })

  it("removes duplicates ignoring hash and converts to absolute", () => {
    const links = [
      link("/page#section1", "First", 0),
      link("/page#section2", "Second", 1),
      link("/page", "Third", 2)
    ]
    const result = deduplicateLinks(links, baseUrl)
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe("First")
    // URL is converted to absolute but keeps original hash
    expect(result[0].url).toBe("https://example.com/page#section1")
  })

  it("preserves distinct URLs with different query params", () => {
    const links = [
      link("/page?id=1", "A", 0),
      link("/page?id=2", "B", 1),
      link("/page?id=1", "C", 2)
    ]
    const result = deduplicateLinks(links, baseUrl)
    expect(result).toHaveLength(2)
  })
})
