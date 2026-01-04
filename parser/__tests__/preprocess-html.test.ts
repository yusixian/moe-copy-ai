/**
 * @jest-environment jsdom
 */

import { preprocessHtml } from "../plugins/preprocess-html"

describe("preprocessHtml", () => {
  describe("Browser Environment (DOMParser available)", () => {
    beforeEach(() => {
      // jsdom environment provides DOMParser by default
    })

    test("should remove script tags", () => {
      const html = `
        <div>
          <p>Content</p>
          <script>alert('test')</script>
          <p>More content</p>
        </div>
      `
      const result = preprocessHtml(html)

      expect(result).toContain("Content")
      expect(result).toContain("More content")
      expect(result).not.toContain("alert")
      expect(result).not.toContain("<script")
    })

    test("should remove style tags", () => {
      const html = `
        <div>
          <p>Content</p>
          <style>.test { color: red; }</style>
          <p>More content</p>
        </div>
      `
      const result = preprocessHtml(html)

      expect(result).toContain("Content")
      expect(result).toContain("More content")
      expect(result).not.toContain("color: red")
      expect(result).not.toContain("<style")
    })

    test("should remove meta, link, noscript, and svg tags", () => {
      const html = `
        <div>
          <p>Content</p>
          <meta name="description" content="test">
          <link rel="stylesheet" href="style.css">
          <noscript>Enable JavaScript</noscript>
          <svg><circle cx="50" cy="50" r="40"/></svg>
          <p>More content</p>
        </div>
      `
      const result = preprocessHtml(html)

      expect(result).toContain("Content")
      expect(result).toContain("More content")
      expect(result).not.toContain("<meta")
      expect(result).not.toContain("<link")
      expect(result).not.toContain("<noscript")
      expect(result).not.toContain("<svg")
    })

    test("should remove Plasmo elements by id", () => {
      const html = `
        <div>
          <p>Valid content</p>
          <div id="plasmo-container">Should be removed</div>
          <div id="my-plasmo-ui">Should be removed</div>
          <p>More valid content</p>
        </div>
      `
      const result = preprocessHtml(html)

      expect(result).toContain("Valid content")
      expect(result).toContain("More valid content")
      expect(result).not.toContain("Should be removed")
      expect(result).not.toContain("plasmo-container")
    })

    test("should remove Plasmo elements by class", () => {
      const html = `
        <div>
          <p>Valid content</p>
          <div class="plasmo-overlay">Should be removed</div>
          <div class="my-plasmo-component">Should be removed</div>
          <p>More valid content</p>
        </div>
      `
      const result = preprocessHtml(html)

      expect(result).toContain("Valid content")
      expect(result).toContain("More valid content")
      expect(result).not.toContain("Should be removed")
    })

    test("should remove Plasmo elements by data-plasmo-id", () => {
      const html = `
        <div>
          <p>Valid content</p>
          <div data-plasmo-id="test">Should be removed</div>
          <p>More valid content</p>
        </div>
      `
      const result = preprocessHtml(html)

      expect(result).toContain("Valid content")
      expect(result).toContain("More valid content")
      expect(result).not.toContain("Should be removed")
      expect(result).not.toContain("data-plasmo-id")
    })

    test("should remove custom Plasmo tags", () => {
      const html = `
        <div>
          <p>Valid content</p>
          <plasmo-csui>Should be removed</plasmo-csui>
          <plasmo-overlay>Should be removed</plasmo-overlay>
          <p>More valid content</p>
        </div>
      `
      const result = preprocessHtml(html)

      expect(result).toContain("Valid content")
      expect(result).toContain("More valid content")
      expect(result).not.toContain("Should be removed")
      expect(result).not.toContain("plasmo-")
    })

    test("should resolve relative image URLs with baseUrl", () => {
      const html = `
        <div>
          <img src="/images/test.jpg" alt="Test">
          <img src="relative/image.png" alt="Relative">
          <img src="https://example.com/absolute.jpg" alt="Absolute">
        </div>
      `
      const baseUrl = "https://example.com/page"
      const result = preprocessHtml(html, baseUrl)

      expect(result).toContain('src="https://example.com/images/test.jpg"')
      // URL resolution: new URL("relative/image.png", "https://example.com/page")
      // resolves to "https://example.com/relative/image.png" (not page/relative)
      expect(result).toContain('src="https://example.com/relative/image.png"')
      expect(result).toContain('src="https://example.com/absolute.jpg"')
    })

    test("should handle invalid URLs gracefully", () => {
      const html = `
        <div>
          <img src="://invalid-url" alt="Invalid">
          <p>Content</p>
        </div>
      `
      const baseUrl = "https://example.com"
      const result = preprocessHtml(html, baseUrl)

      // Should not throw error
      expect(result).toContain("Content")
      // Invalid URL should remain unchanged
      expect(result).toContain("://invalid-url")
    })

    test("should not modify HTML when no baseUrl provided", () => {
      const html = `
        <div>
          <img src="/images/test.jpg" alt="Test">
          <p>Content</p>
        </div>
      `
      const result = preprocessHtml(html)

      expect(result).toContain('src="/images/test.jpg"')
      expect(result).toContain("Content")
    })

    test("should handle empty HTML", () => {
      const result = preprocessHtml("")
      expect(result).toBe("")
    })

    test("should preserve valid content while removing unwanted elements", () => {
      const html = `
        <article>
          <h1>Title</h1>
          <script>tracking()</script>
          <p>First paragraph</p>
          <div id="plasmo-ui">Extension UI</div>
          <p>Second paragraph</p>
          <style>.ad { display: block; }</style>
          <img src="/image.jpg" alt="Image">
        </article>
      `
      const result = preprocessHtml(html)

      expect(result).toContain("Title")
      expect(result).toContain("First paragraph")
      expect(result).toContain("Second paragraph")
      expect(result).toContain('alt="Image"')
      expect(result).not.toContain("tracking()")
      expect(result).not.toContain("Extension UI")
      expect(result).not.toContain(".ad")
    })
  })

  describe("Node.js Environment (regex fallback)", () => {
    test("should handle script tags with regex fallback", () => {
      // This would test the Node.js path, but jsdom provides DOMParser
      // In a real Node.js environment, this would use regex
      const html = "<script>test</script><p>Content</p>"
      const result = preprocessHtml(html)

      // Should still work via DOMParser in jsdom
      expect(result).toContain("Content")
      expect(result).not.toContain("test")
    })
  })
})
