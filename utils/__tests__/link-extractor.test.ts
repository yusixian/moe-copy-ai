import type { LinkFilterOptions } from "~constants/types"
import {
  deduplicateLinks,
  extractAndProcessLinks,
  extractLinksFromElement,
  filterLinks,
  getElementInfo,
  isSameDomain,
  isValidScrapableUrl,
  resolveUrl
} from "~utils/link-extractor"
import { createMockElement, setDocumentHTML } from "./helpers"

// Mock dependencies
jest.mock("~utils/selector-generator", () => ({
  generateUniqueSelector: jest.fn().mockReturnValue(".link-container")
}))

jest.mock("~utils/logger", () => ({
  debugLog: jest.fn()
}))

describe("link-extractor", () => {
  beforeEach(() => {
    setDocumentHTML("")
    jest.clearAllMocks()
  })

  describe("extractLinksFromElement", () => {
    test("should extract links from anchor element itself", () => {
      const anchor = createMockElement("a", {
        href: "https://example.com",
        textContent: "Example Link"
      })
      document.body.appendChild(anchor)

      const links = extractLinksFromElement(anchor)

      expect(links).toHaveLength(1)
      expect(links[0].url).toBe("https://example.com")
      expect(links[0].text).toBe("Example Link")
      expect(links[0].index).toBe(0)
    })

    test("should extract links from descendant anchors", () => {
      const container = createMockElement("div", {
        innerHTML: `
          <a href="https://example.com/1">Link 1</a>
          <a href="https://example.com/2">Link 2</a>
          <a href="https://example.com/3">Link 3</a>
        `
      })
      document.body.appendChild(container)

      const links = extractLinksFromElement(container)

      expect(links).toHaveLength(3)
      expect(links[0].url).toBe("https://example.com/1")
      expect(links[1].url).toBe("https://example.com/2")
      expect(links[2].url).toBe("https://example.com/3")
    })

    test("should skip anchors without href", () => {
      const container = createMockElement("div", {
        innerHTML: `
          <a href="https://example.com">With href</a>
          <a>Without href</a>
        `
      })
      document.body.appendChild(container)

      const links = extractLinksFromElement(container)

      expect(links).toHaveLength(1)
      expect(links[0].url).toBe("https://example.com")
    })

    test("should use href as text when element has no text", () => {
      const anchor = createMockElement("a", {
        href: "https://example.com"
      })
      document.body.appendChild(anchor)

      const links = extractLinksFromElement(anchor)

      expect(links[0].text).toBe("https://example.com")
    })

    test("should trim link text", () => {
      const anchor = createMockElement("a", {
        href: "https://example.com",
        textContent: "  Spaced Link  "
      })
      document.body.appendChild(anchor)

      const links = extractLinksFromElement(anchor)

      expect(links[0].text).toBe("Spaced Link")
    })

    test("should assign sequential indices", () => {
      const container = createMockElement("div", {
        innerHTML: `
          <a href="https://example.com/1">Link 1</a>
          <a href="https://example.com/2">Link 2</a>
        `
      })
      document.body.appendChild(container)

      const links = extractLinksFromElement(container)

      expect(links[0].index).toBe(0)
      expect(links[1].index).toBe(1)
    })
  })

  describe("getElementInfo", () => {
    test("should get info for anchor element", () => {
      const anchor = createMockElement("a", {
        href: "https://example.com",
        id: "link-id",
        className: "link-class"
      })
      document.body.appendChild(anchor)

      const info = getElementInfo(anchor)

      expect(info.tagName).toBe("a")
      expect(info.id).toBe("link-id")
      expect(info.className).toBe("link-class")
      expect(info.linkCount).toBe(1) // The anchor itself
      expect(info.selector).toBe(".link-container")
    })

    test("should count descendant links", () => {
      const container = createMockElement("div", {
        innerHTML: `
          <a href="#">Link 1</a>
          <a href="#">Link 2</a>
        `
      })
      document.body.appendChild(container)

      const info = getElementInfo(container)

      expect(info.linkCount).toBe(2)
    })

    test("should fallback to tag name if selector generation fails", () => {
      const { generateUniqueSelector } = require("~utils/selector-generator")
      generateUniqueSelector.mockImplementationOnce(() => {
        throw new Error("Selector generation failed")
      })

      const container = createMockElement("div")
      document.body.appendChild(container)

      const info = getElementInfo(container)

      expect(info.selector).toBe("div")
    })
  })

  describe("resolveUrl", () => {
    test("should resolve relative URL", () => {
      const resolved = resolveUrl("/path/to/page", "https://example.com")
      expect(resolved).toBe("https://example.com/path/to/page")
    })

    test("should handle absolute URL", () => {
      const resolved = resolveUrl(
        "https://other.com/page",
        "https://example.com"
      )
      expect(resolved).toBe("https://other.com/page")
    })

    test("should handle protocol-relative URL", () => {
      const resolved = resolveUrl("//other.com/page", "https://example.com")
      expect(resolved).toBe("https://other.com/page")
    })

    test("should return original URL if resolution fails", () => {
      const resolved = resolveUrl("invalid:url", "invalid-base")
      expect(resolved).toBe("invalid:url")
    })
  })

  describe("isSameDomain", () => {
    test("should return true for same domain", () => {
      const result = isSameDomain(
        "https://example.com/page",
        "https://example.com"
      )
      expect(result).toBe(true)
    })

    test("should return false for different domain", () => {
      const result = isSameDomain(
        "https://other.com/page",
        "https://example.com"
      )
      expect(result).toBe(false)
    })

    test("should return false for subdomain", () => {
      const result = isSameDomain(
        "https://sub.example.com/page",
        "https://example.com"
      )
      expect(result).toBe(false)
    })

    test("should handle relative URLs", () => {
      const result = isSameDomain("/page", "https://example.com")
      expect(result).toBe(true)
    })

    test("should return false for invalid URLs", () => {
      const result = isSameDomain("invalid", "also-invalid")
      expect(result).toBe(false)
    })
  })

  describe("isValidScrapableUrl", () => {
    test("should allow http and https URLs", () => {
      expect(isValidScrapableUrl("https://example.com")).toBe(true)
      expect(isValidScrapableUrl("http://example.com")).toBe(true)
      expect(isValidScrapableUrl("/relative/path")).toBe(true)
    })

    test("should reject javascript: URLs", () => {
      expect(isValidScrapableUrl("javascript:void(0)")).toBe(false)
    })

    test("should reject anchor-only URLs", () => {
      expect(isValidScrapableUrl("#section")).toBe(false)
    })

    test("should reject mailto: URLs", () => {
      expect(isValidScrapableUrl("mailto:test@example.com")).toBe(false)
    })

    test("should reject tel: URLs", () => {
      expect(isValidScrapableUrl("tel:+1234567890")).toBe(false)
    })

    test("should reject data: URLs", () => {
      expect(isValidScrapableUrl("data:image/png;base64,abc")).toBe(false)
    })
  })

  describe("filterLinks", () => {
    const baseUrl = "https://example.com/page"

    test("should filter out invalid URLs", () => {
      const links = [
        { url: "https://example.com/valid", text: "Valid", index: 0 },
        { url: "javascript:alert(1)", text: "JS", index: 1 },
        { url: "#anchor", text: "Anchor", index: 2 }
      ]

      const filtered = filterLinks(links, baseUrl, {
        sameDomainOnly: false,
        excludeAnchors: false,
        excludeJavaScript: false
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].url).toBe("https://example.com/valid")
    })

    test("should filter by same domain when sameDomainOnly is true", () => {
      const links = [
        { url: "https://example.com/page1", text: "Same", index: 0 },
        { url: "https://other.com/page", text: "Other", index: 1 }
      ]

      const filtered = filterLinks(links, baseUrl, {
        sameDomainOnly: true,
        excludeAnchors: false,
        excludeJavaScript: false
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].url).toBe("https://example.com/page1")
    })

    test("should exclude hash-only anchors when excludeAnchors is true", () => {
      const links = [
        { url: "https://example.com/page#section", text: "Hash", index: 0 },
        { url: "https://example.com/other", text: "Other", index: 1 }
      ]

      const filtered = filterLinks(links, baseUrl, {
        sameDomainOnly: false,
        excludeAnchors: true,
        excludeJavaScript: false
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].url).toBe("https://example.com/other")
    })

    test("should exclude by custom patterns", () => {
      const links = [
        { url: "https://example.com/page1", text: "Page 1", index: 0 },
        { url: "https://example.com/admin/page", text: "Admin", index: 1 },
        { url: "https://example.com/page2", text: "Page 2", index: 2 }
      ]

      const filtered = filterLinks(links, baseUrl, {
        sameDomainOnly: false,
        excludeAnchors: false,
        excludeJavaScript: false,
        excludePatterns: [/\/admin\//]
      })

      expect(filtered).toHaveLength(2)
      expect(filtered.some((l) => l.url.includes("admin"))).toBe(false)
    })

    test("should apply multiple filters together", () => {
      const links = [
        { url: "https://example.com/valid", text: "Valid", index: 0 },
        { url: "https://other.com/external", text: "External", index: 1 },
        { url: "javascript:void(0)", text: "JS", index: 2 },
        { url: "#anchor", text: "Anchor", index: 3 }
      ]

      const filtered = filterLinks(links, baseUrl, {
        sameDomainOnly: true,
        excludeJavaScript: true,
        excludeAnchors: true
      })

      expect(filtered).toHaveLength(1)
      expect(filtered[0].url).toBe("https://example.com/valid")
    })
  })

  describe("deduplicateLinks", () => {
    const baseUrl = "https://example.com"

    test("should remove duplicate URLs", () => {
      const links = [
        { url: "/page1", text: "Page 1 First", index: 0 },
        { url: "/page1", text: "Page 1 Duplicate", index: 1 },
        { url: "/page2", text: "Page 2", index: 2 }
      ]

      const deduplicated = deduplicateLinks(links, baseUrl)

      expect(deduplicated).toHaveLength(2)
      expect(deduplicated[0].text).toBe("Page 1 First") // Keep first occurrence
    })

    test("should normalize URLs by removing hash", () => {
      const links = [
        { url: "https://example.com/page#section1", text: "S1", index: 0 },
        { url: "https://example.com/page#section2", text: "S2", index: 1 },
        { url: "https://example.com/page", text: "No hash", index: 2 }
      ]

      const deduplicated = deduplicateLinks(links, baseUrl)

      expect(deduplicated).toHaveLength(1)
    })

    test("should convert relative URLs to absolute", () => {
      const links = [{ url: "/page", text: "Page", index: 0 }]

      const deduplicated = deduplicateLinks(links, baseUrl)

      expect(deduplicated[0].url).toBe("https://example.com/page")
    })

    test("should preserve order of first occurrences", () => {
      const links = [
        { url: "/page1", text: "1", index: 0 },
        { url: "/page2", text: "2", index: 1 },
        { url: "/page1", text: "1 dup", index: 2 },
        { url: "/page3", text: "3", index: 3 }
      ]

      const deduplicated = deduplicateLinks(links, baseUrl)

      expect(deduplicated.map((l) => l.text)).toEqual(["1", "2", "3"])
    })
  })

  describe("extractAndProcessLinks", () => {
    const baseUrl = "https://example.com"

    test("should extract, filter, and deduplicate links", () => {
      const container = createMockElement("div", {
        innerHTML: `
          <a href="/page1">Page 1</a>
          <a href="/page1">Page 1 Duplicate</a>
          <a href="https://other.com/external">External</a>
          <a href="javascript:void(0)">JavaScript</a>
          <a href="#anchor">Anchor</a>
        `
      })
      document.body.appendChild(container)

      const links = extractAndProcessLinks(container, baseUrl, {
        sameDomainOnly: true,
        excludeAnchors: true,
        excludeJavaScript: true
      })

      expect(links).toHaveLength(1)
      expect(links[0].url).toBe("https://example.com/page1")
      expect(links[0].index).toBe(0) // Re-indexed
    })

    test("should re-index links sequentially", () => {
      const container = createMockElement("div", {
        innerHTML: `
          <a href="/page1">Page 1</a>
          <a href="/page2">Page 2</a>
          <a href="/page3">Page 3</a>
        `
      })
      document.body.appendChild(container)

      const links = extractAndProcessLinks(container, baseUrl)

      expect(links[0].index).toBe(0)
      expect(links[1].index).toBe(1)
      expect(links[2].index).toBe(2)
    })

    test("should use default filter options when not provided", () => {
      const container = createMockElement("div", {
        innerHTML: `
          <a href="/page1">Page 1</a>
          <a href="#anchor">Anchor</a>
        `
      })
      document.body.appendChild(container)

      const links = extractAndProcessLinks(container, baseUrl)

      // Default excludes anchors and javascript
      expect(links).toHaveLength(1)
      expect(links[0].url).toBe("https://example.com/page1")
    })
  })
})
