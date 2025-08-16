/**
 * @jest-environment jsdom
 */

import {
  convertHtmlToMarkdown,
  evaluateContentQuality,
  extractImagesFromMarkdown
} from "../readability-extractor"

describe("Readability Extractor", () => {
  beforeEach(() => {
    // Setup DOM environment
    document.body.innerHTML = ""
  })

  describe("convertHtmlToMarkdown", () => {
    test("should convert basic HTML tags to Markdown", () => {
      const html = "<h1>Title</h1><p>This is a <strong>bold</strong> text.</p>"
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toContain("# Title")
      expect(markdown).toContain("**bold**")
      expect(markdown).toContain("This is a")
    })

    test("should handle empty content", () => {
      const result = convertHtmlToMarkdown("")
      expect(result).toBe("")
    })

    test("should convert links correctly", () => {
      const html = '<a href="https://example.com">Link text</a>'
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toBe("[Link text](https://example.com)")
    })

    test("should ignore javascript and hash links", () => {
      const html =
        '<a href="javascript:void(0)">JS Link</a><a href="#section">Hash Link</a>'
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toBe("JS LinkHash Link")
    })

    test("should convert images to markdown", () => {
      const html = '<img src="image.jpg" alt="Test Image">'
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toContain("![Test Image](image.jpg)")
    })

    test("should handle code blocks", () => {
      const html = '<pre>console.log("Hello");</pre>'
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toContain('```\nconsole.log("Hello");\n```')
    })
  })

  describe("evaluateContentQuality", () => {
    test("should prefer longer content with good structure", () => {
      const shortContent = "Short text"
      const longContent = `
        # Long Article Title
        
        This is a much longer article with multiple paragraphs and good structure that provides substantial value to readers.
        
        ## Subtitle
        
        Another paragraph with substantial content that provides value and demonstrates the quality of the content extraction.
        
        ### Another Heading
        
        More content here to make it longer and more substantial with additional paragraphs and meaningful text.
        
        And yet another paragraph to ensure we have enough content to trigger the quality scoring algorithm properly.
      `

      const evaluation = evaluateContentQuality(shortContent, longContent)

      expect(evaluation.betterContent).toBe(longContent)
      expect(evaluation.scores.readability).toBeGreaterThan(
        evaluation.scores.selector
      )
      // The reason could be either "Readability 内容质量更高" or "质量得分接近，选择更详细的内容"
      expect(evaluation.reason).toMatch(/Readability 内容质量更高|质量得分接近/)
    })

    test("should handle equal quality content", () => {
      const content1 = "Medium length content with some substance"
      const content2 = "Another medium length content with substance"

      const evaluation = evaluateContentQuality(content1, content2)

      expect(evaluation.reason).toContain("质量得分接近")
    })

    test("should penalize content with many HTML tags", () => {
      const cleanContent = "Clean text without markup"
      const htmlContent =
        '<div><span><p>Text with <b>lots</b> of <i>HTML</i> <a href="#">tags</a></p></span></div>'

      const evaluation = evaluateContentQuality(htmlContent, cleanContent)

      expect(evaluation.scores.readability).toBeGreaterThan(
        evaluation.scores.selector
      )
    })
  })

  describe("extractImagesFromMarkdown", () => {
    test("should extract images from markdown", () => {
      const markdown = `
        # Article
        
        ![Image 1](image1.jpg)
        
        Some text here.
        
        ![Image 2](image2.png)
      `

      const images = extractImagesFromMarkdown(markdown)

      expect(images).toHaveLength(2)
      expect(images[0].src).toBe("image1.jpg")
      expect(images[0].alt).toBe("Image 1")
      expect(images[1].src).toBe("image2.png")
      expect(images[1].alt).toBe("Image 2")
    })

    test("should handle empty alt text", () => {
      const markdown = "![](image.jpg)"
      const images = extractImagesFromMarkdown(markdown)

      expect(images).toHaveLength(1)
      expect(images[0].alt).toBe("图片#0")
    })

    test("should handle no images", () => {
      const markdown = "Text without images"
      const images = extractImagesFromMarkdown(markdown)

      expect(images).toHaveLength(0)
    })
  })
})
