import {
  extractContentFromElement,
  getContentStats,
  getElementInfo
} from "~utils/content-extractor"
import { setDocumentHTML, createMockElement } from "./helpers"

// Mock readability-extractor
jest.mock("~utils/readability-extractor", () => ({
  convertHtmlToMarkdown: jest
    .fn()
    .mockImplementation((html: string) => Promise.resolve(`# Markdown\n\n${html}`))
}))

describe("content-extractor", () => {
  beforeEach(() => {
    setDocumentHTML("")
  })

  describe("getElementInfo", () => {
    test("should extract basic element information", () => {
      const element = createMockElement("div", {
        id: "test-id",
        className: "test-class another-class",
        innerHTML: '<a href="#">Link 1</a><a href="#">Link 2</a>'
      })

      const info = getElementInfo(element)

      expect(info.tagName).toBe("div")
      expect(info.id).toBe("test-id")
      expect(info.className).toBe("test-class another-class")
      expect(info.linkCount).toBe(2)
      expect(info.outerHTML).toContain("<div")
    })

    test("should handle element without id or className", () => {
      const element = createMockElement("section", {
        innerHTML: "<p>Content</p>"
      })

      const info = getElementInfo(element)

      expect(info.tagName).toBe("section")
      expect(info.id).toBe("")
      expect(info.className).toBe("")
      expect(info.linkCount).toBe(0)
    })

    test("should count links correctly", () => {
      const element = createMockElement("div", {
        innerHTML: `
          <a href="#">Link 1</a>
          <a>Link without href</a>
          <a href="#">Link 2</a>
        `
      })

      const info = getElementInfo(element)

      // Only links with href attribute
      expect(info.linkCount).toBe(2)
    })

    test("should limit outerHTML length to 500 characters", () => {
      const longContent = "x".repeat(1000)
      const element = createMockElement("div", {
        innerHTML: longContent
      })

      const info = getElementInfo(element)

      expect(info.outerHTML.length).toBeLessThanOrEqual(500)
    })
  })

  describe("extractContentFromElement", () => {
    test("should extract text format correctly", async () => {
      const element = createMockElement("article", {
        innerHTML: `
          <h1>Title</h1>
          <p>First paragraph</p>
          <p>Second paragraph</p>
        `
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      expect(content.text).toContain("Title")
      expect(content.text).toContain("First paragraph")
      expect(content.text).toContain("Second paragraph")
      // Headings should have extra spacing
      expect(content.text).toMatch(/Title\n\n/)
    })

    test("should handle block elements with proper line breaks", async () => {
      const element = createMockElement("div", {
        innerHTML: `
          <div>Block 1</div>
          <div>Block 2</div>
        `
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      // Block elements should be separated by newlines
      expect(content.text).toContain("Block 1")
      expect(content.text).toContain("Block 2")
      expect(content.text).toMatch(/Block 1\n/)
    })

    test("should skip script and style tags", async () => {
      const element = createMockElement("div", {
        innerHTML: `
          <p>Visible text</p>
          <script>console.log('hidden')</script>
          <style>.test { color: red; }</style>
        `
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      expect(content.text).toContain("Visible text")
      expect(content.text).not.toContain("console.log")
      expect(content.text).not.toContain("color: red")
    })

    test("should handle table cells with tab separation", async () => {
      const element = createMockElement("table", {
        innerHTML: `
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
            <td>Cell 3</td>
          </tr>
        `
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      // Table cells should be tab-separated
      expect(content.text).toContain("Cell 1")
      expect(content.text).toContain("Cell 2")
      expect(content.text).toContain("Cell 3")
    })

    test("should handle br tags as line breaks", async () => {
      const element = createMockElement("p", {
        innerHTML: `Line 1<br>Line 2<br>Line 3`
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      expect(content.text).toMatch(/Line 1\nLine 2\nLine 3/)
    })

    test("should clean up excessive whitespace", async () => {
      const element = createMockElement("div", {
        innerHTML: `
          <p>Text   with   spaces</p>


          <p>Another paragraph</p>
        `
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      // Multiple spaces should be collapsed
      expect(content.text).toContain("Text with spaces")
      // Maximum two newlines between blocks
      expect(content.text).not.toMatch(/\n{3,}/)
    })

    test("should extract HTML format", async () => {
      const element = createMockElement("div", {
        innerHTML: `<p><strong>Bold</strong> text</p>`
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      expect(content.html).toContain("<div")
      expect(content.html).toContain("<strong>Bold</strong>")
      expect(content.html).toContain("</div>")
    })

    test("should convert to markdown format", async () => {
      const element = createMockElement("article", {
        innerHTML: `<h1>Title</h1><p>Content</p>`
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      // Markdown conversion should be called
      expect(content.markdown).toContain("# Markdown")
    })

    test("should fallback to text when markdown conversion fails", async () => {
      // Mock markdown conversion to throw error
      const { convertHtmlToMarkdown } = require("~utils/readability-extractor")
      convertHtmlToMarkdown.mockRejectedValueOnce(new Error("Conversion failed"))

      const element = createMockElement("div", {
        textContent: "Fallback text"
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      // Should fallback to text content
      expect(content.markdown).toBe("Fallback text")
    })

    test("should include element info", async () => {
      const element = createMockElement("article", {
        id: "main-article",
        className: "content",
        innerHTML: `<p>Text</p>`
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      expect(content.elementInfo).toBeDefined()
      expect(content.elementInfo.tagName).toBe("article")
      expect(content.elementInfo.id).toBe("main-article")
      expect(content.elementInfo.className).toBe("content")
    })

    test("should handle empty element", async () => {
      const element = createMockElement("div", {})
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      expect(content.text).toBe("")
      expect(content.html).toContain("<div")
      expect(content.elementInfo).toBeDefined()
    })

    test("should handle nested headings with proper spacing", async () => {
      const element = createMockElement("div", {
        innerHTML: `
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <h3>Heading 3</h3>
        `
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)

      // Headings should have extra spacing (except last one is trimmed)
      expect(content.text).toMatch(/Heading 1\n\n/)
      expect(content.text).toMatch(/Heading 2\n\n/)
      expect(content.text).toContain("Heading 3")
    })
  })

  describe("getContentStats", () => {
    test("should calculate correct statistics", async () => {
      const element = createMockElement("div", {
        innerHTML: `<p>This is a test with five words</p>`
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)
      const stats = getContentStats(content)

      expect(stats.htmlLength).toBeGreaterThan(0)
      expect(stats.markdownLength).toBeGreaterThan(0)
      expect(stats.textLength).toBeGreaterThan(0)
      expect(stats.wordCount).toBe(7) // "This is a test with five words"
    })

    test("should count words correctly", async () => {
      const element = createMockElement("div", {
        innerHTML: `
          <p>Word1 Word2</p>
          <p>Word3   Word4   Word5</p>
        `
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)
      const stats = getContentStats(content)

      expect(stats.wordCount).toBe(5)
    })

    test("should handle empty content", async () => {
      const element = createMockElement("div", {})
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)
      const stats = getContentStats(content)

      expect(stats.wordCount).toBe(0)
      expect(stats.textLength).toBe(0)
    })

    test("should filter out empty strings when counting words", async () => {
      const element = createMockElement("div", {
        innerHTML: `<p>  Word1    Word2  </p>`
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)
      const stats = getContentStats(content)

      // Multiple spaces should not be counted as words
      expect(stats.wordCount).toBe(2)
    })

    test("should count Chinese characters as words", async () => {
      const element = createMockElement("div", {
        innerHTML: `<p>中文 测试 文本</p>`
      })
      document.body.appendChild(element)

      const content = await extractContentFromElement(element)
      const stats = getContentStats(content)

      expect(stats.wordCount).toBe(3)
    })
  })
})
