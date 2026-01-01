/**
 * @jest-environment jsdom
 */

import type { ExtractionMode } from "../../constants/types"
import { scrapeWebpageContent } from "../extractor"

describe("Extraction Modes Integration", () => {
  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = `
      <title>Test Article - Test Blog</title>
      <meta name="author" content="Test Author">
      <meta property="og:title" content="Test OG Title">
      <meta property="og:description" content="Test OG Description">
    `
    document.body.innerHTML = `
      <article class="post-content">
        <header>
          <h1 class="post-title">Test Article Title</h1>
          <div class="post-meta">
            <span class="author">By Test Author</span>
            <time datetime="2024-01-01">January 1, 2024</time>
          </div>
        </header>
        <div class="content">
          <p>This is the first paragraph of test content for extraction. It contains meaningful information about the topic.</p>
          <p>This is the second paragraph with more detailed content. It provides additional context and information.</p>
          <h2>Subheading</h2>
          <p>Content under subheading with even more information to test content extraction capabilities.</p>
        </div>
      </article>
      <aside class="sidebar">
        <div class="ads">Advertisement content</div>
        <nav class="related">Related articles</nav>
      </aside>
    `
  })

  describe("Selector Mode", () => {
    test("should extract content using CSS selectors", async () => {
      const result = await scrapeWebpageContent({
        mode: "selector"
      })

      expect(result.metadata["extraction:mode"]).toBe("selector")
      expect(result.title).toBeTruthy()
      expect(result.articleContent).toContain("first paragraph")
      expect(result.articleContent).toContain("second paragraph")
    })

    test("should use custom selectors when provided", async () => {
      const result = await scrapeWebpageContent({
        mode: "selector",
        customSelectors: {
          content: ".content p",
          title: ".post-title"
        }
      })

      expect(result.metadata["extraction:mode"]).toBe("selector")
      expect(result.title).toContain("Test Article Title")
    })
  })

  describe("Readability Mode", () => {
    test("should attempt readability extraction", async () => {
      const result = await scrapeWebpageContent({
        mode: "readability"
      })

      expect(result.metadata["extraction:mode"]).toBeDefined()
      expect(result.articleContent).toBeDefined()
      // In test environment, might fallback to selector mode
      expect(["readability", "selector"]).toContain(
        result.metadata["extraction:mode"]
      )
    })

    test("should include readability config when specified", async () => {
      const result = await scrapeWebpageContent({
        mode: "readability",
        readabilityConfig: {
          charThreshold: 500,
          debug: true
        }
      })

      expect(result.metadata["extraction:mode"]).toBeDefined()
    })
  })

  describe("Hybrid Mode", () => {
    test("should handle hybrid mode and compare results", async () => {
      const result = await scrapeWebpageContent({
        mode: "hybrid"
      })

      expect(result.metadata["extraction:mode"]).toBeDefined()
      expect(result.articleContent).toBeDefined()
      expect(result.metadata).toHaveProperty("evaluation:selectorScore")
      expect(result.metadata).toHaveProperty("evaluation:readabilityScore")
      expect(result.metadata).toHaveProperty("evaluation:reason")
    })

    test("should include both method results in metadata", async () => {
      const result = await scrapeWebpageContent({
        mode: "hybrid"
      })

      // Hybrid mode should provide information about both methods
      expect(result.metadata["extraction:mode"]).toBe("hybrid")
      expect(result.metadata["evaluation:reason"]).toBeDefined()
      expect(result.metadata["evaluation:selectorScore"]).toBeDefined()
      expect(result.metadata["evaluation:readabilityScore"]).toBeDefined()
    })
  })

  describe("Mode Comparison", () => {
    test("should provide consistent basic structure across all modes", async () => {
      const modes: ExtractionMode[] = ["selector", "readability", "hybrid"]

      for (const mode of modes) {
        const result = await scrapeWebpageContent({ mode })

        expect(result).toHaveProperty("title")
        expect(result).toHaveProperty("articleContent")
        expect(result).toHaveProperty("cleanedContent")
        expect(result).toHaveProperty("metadata")
        expect(result).toHaveProperty("images")
        expect(result.metadata).toHaveProperty("extraction:mode")
      }
    })
  })

  describe("Fallback Behavior", () => {
    test("should default to selector mode when no mode specified", async () => {
      const result = await scrapeWebpageContent()

      expect(result.metadata["extraction:mode"]).toBe("selector")
    })

    test("should handle invalid mode gracefully", async () => {
      const result = await scrapeWebpageContent({
        mode: "invalid" as ExtractionMode
      })

      expect(result.metadata["extraction:mode"]).toBe("selector")
    })
  })

  describe("Complex Content Scenarios", () => {
    beforeEach(() => {
      // Setup complex content for testing
      document.body.innerHTML = `
        <div class="page-wrapper">
          <header class="site-header">
            <nav>Navigation items</nav>
          </header>
          <main class="main-content">
            <article class="blog-post">
              <h1>Complex Article with Multiple Sections</h1>
              <div class="article-meta">
                <span class="author">Jane Doe</span>
                <time>2024-01-15</time>
              </div>
              <div class="article-body">
                <p>Introduction paragraph with important information.</p>
                <h2>Section 1</h2>
                <p>Content of section 1 with detailed explanations.</p>
                <ul>
                  <li>List item 1</li>
                  <li>List item 2</li>
                </ul>
                <h2>Section 2</h2>
                <p>Content of section 2 with more information.</p>
                <blockquote>
                  <p>This is an important quote that should be preserved.</p>
                </blockquote>
              </div>
            </article>
          </main>
          <aside class="sidebar">
            <div class="widget">
              <h3>Related Posts</h3>
              <ul><li>Related post 1</li></ul>
            </div>
          </aside>
          <footer class="site-footer">
            <p>Footer content</p>
          </footer>
        </div>
      `
    })

    test("should extract structured content with headings and lists", async () => {
      const result = await scrapeWebpageContent({
        mode: "selector"
      })

      expect(result.articleContent).toContain("Section 1")
      expect(result.articleContent).toContain("Section 2")
      expect(result.articleContent).toContain("List item 1")
      expect(result.articleContent).toContain("important quote")
    })

    test("hybrid mode should handle complex content", async () => {
      const result = await scrapeWebpageContent({
        mode: "hybrid"
      })

      expect(result.articleContent).toBeTruthy()
      expect(result.metadata["extraction:mode"]).toBe("hybrid")
      expect(result.cleanedContent.length).toBeGreaterThan(0)
    })
  })
})
