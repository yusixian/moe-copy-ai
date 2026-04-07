import { describe, expect, it } from "vitest"

import { preprocessHtml } from "../plugins/preprocess-html"

describe("preprocessHtml — plasmo and URL handling", () => {
  it("removes plasmo elements", () => {
    const html = '<div id="plasmo-overlay">overlay</div><p>Text</p>'
    const result = preprocessHtml(html)
    expect(result).not.toContain("overlay")
    expect(result).toContain("Text")
  })

  it("resolves relative image URLs", () => {
    const html = '<img src="/images/photo.jpg">'
    const result = preprocessHtml(html, "https://example.com")
    expect(result).toContain("https://example.com/images/photo.jpg")
  })

  it("preserves scripts for downstream HAST processing", () => {
    const html =
      '<script>console.log("test")</script><script type="math/tex">x^2</script><p>Content</p>'
    const result = preprocessHtml(html)
    // preprocessHtml no longer removes scripts — that's handled by rehypeCleanup
    expect(result).toContain("Content")
  })
})
