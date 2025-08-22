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

      expect(markdown).toBe("![Test Image](image.jpg)")
    })

    test("should handle nested HTML structures", () => {
      const html = `
        <article>
          <h1>Main Title</h1>
          <div class="content">
            <p>First paragraph with <em>italic</em> and <strong>bold</strong> text.</p>
            <h2>Subtitle</h2>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
            <blockquote>
              <p>This is a quote</p>
            </blockquote>
          </div>
        </article>
      `
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toContain("# Main Title")
      expect(markdown).toContain("## Subtitle")
      expect(markdown).toContain("*italic*")
      expect(markdown).toContain("**bold**")
      expect(markdown).toContain("- List item 1")
      expect(markdown).toContain("> This is a quote")
    })

    test("should clean up extra whitespace", () => {
      const html = "<p>  Multiple   spaces   between   words  </p>"
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown.trim()).toBe("Multiple spaces between words")
    })

    test("should handle code elements", () => {
      const html = "<p>Use <code>console.log()</code> for debugging</p>"
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toContain("`console.log()`")
    })

    test("should convert pre blocks to code blocks", () => {
      const html = "<pre><code>function test() {\n  return true;\n}</code></pre>"
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toContain("```")
      expect(markdown).toContain("function test()")
    })

    test("should handle tables (basic text extraction)", () => {
      const html = `
        <table>
          <thead>
            <tr><th>Header 1</th><th>Header 2</th></tr>
          </thead>
          <tbody>
            <tr><td>Cell 1</td><td>Cell 2</td></tr>
          </tbody>
        </table>
      `
      const markdown = convertHtmlToMarkdown(html)

      // The basic implementation extracts table content as text
      expect(markdown).toContain("Header 1")
      expect(markdown).toContain("Header 2") 
      expect(markdown).toContain("Cell 1")
      expect(markdown).toContain("Cell 2")
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

    test("should assign proper indices to images", () => {
      const markdown = `
        ![First](img1.jpg)
        ![Second](img2.jpg)  
        ![Third](img3.jpg)
      `
      const images = extractImagesFromMarkdown(markdown)

      expect(images).toHaveLength(3)
      expect(images[0].index).toBe(0)
      expect(images[1].index).toBe(1) 
      expect(images[2].index).toBe(2)
    })

    test("should handle images with basic syntax", () => {
      const markdown = '![Alt text](image.jpg)'
      const images = extractImagesFromMarkdown(markdown)

      expect(images).toHaveLength(1)
      expect(images[0].alt).toBe("Alt text")
      expect(images[0].src).toBe("image.jpg")
      expect(images[0].title).toBe("")
    })
  })

  describe("Edge Cases and Error Handling", () => {
    test("should handle malformed HTML gracefully", () => {
      const malformedHtml = "<p>Unclosed paragraph<div>Nested wrongly</p></div>"
      const result = convertHtmlToMarkdown(malformedHtml)

      expect(result).toBeDefined()
      expect(typeof result).toBe("string")
    })

    test("should handle very long content", () => {
      const veryLongContent = "A".repeat(10000)
      const html = `<p>${veryLongContent}</p>`
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown.length).toBeGreaterThan(9900)
      expect(markdown).toContain("A".repeat(100))
    })

    test("should handle content with special characters", () => {
      const html = "<p>Special chars: & < > \" ' © ® ™</p>"
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toContain("&")
      expect(markdown).toContain("<")
      expect(markdown).toContain(">")
    })

    test("should handle mixed content types", () => {
      const html = `
        <div>
          <h1>Title</h1>
          <p>Paragraph with <strong>bold</strong> text</p>
          <ul>
            <li>List item with <a href="https://example.com">link</a></li>
          </ul>
          <blockquote>
            <p>Quote with <em>emphasis</em></p>
          </blockquote>
          <pre><code>Code block</code></pre>
        </div>
      `
      const markdown = convertHtmlToMarkdown(html)

      expect(markdown).toContain("# Title")
      expect(markdown).toContain("**bold**")
      expect(markdown).toContain("- List item")
      expect(markdown).toContain("[link](https://example.com)")
      expect(markdown).toContain("> Quote with")
      expect(markdown).toContain("*emphasis*")
      expect(markdown).toContain("```")
    })
  })

  describe("Content Quality Evaluation Edge Cases", () => {
    test("should handle empty content evaluation", () => {
      const evaluation = evaluateContentQuality("", "")

      expect(evaluation.betterContent).toBe("")
      expect(evaluation.scores.selector).toBe(0)
      expect(evaluation.scores.readability).toBe(0)
    })

    test("should handle one empty content", () => {
      const content = "Some meaningful content here"
      const evaluation = evaluateContentQuality("", content)

      expect(evaluation.betterContent).toBe(content)
      expect(evaluation.reason).toContain("Readability 内容质量更高")
    })

    test("should evaluate content with different markdown structures", () => {
      const simpleContent = "Just plain text without any structure"
      const structuredContent = `
        # Main Title
        
        ## Section 1
        Introduction paragraph
        
        ### Subsection
        - Point 1
        - Point 2
        
        ## Section 2  
        More content here with proper structure
      `

      const evaluation = evaluateContentQuality(simpleContent, structuredContent)

      expect(evaluation.betterContent).toBe(structuredContent)
      expect(evaluation.scores.readability).toBeGreaterThan(evaluation.scores.selector)
    })

    test("should handle content with only HTML tags", () => {
      const tagOnlyContent = "<div><span><p></p></span></div>"
      const textContent = "Actual meaningful text content"

      const evaluation = evaluateContentQuality(tagOnlyContent, textContent)

      expect(evaluation.betterContent).toBe(textContent)
      expect(evaluation.scores.readability).toBeGreaterThan(evaluation.scores.selector)
    })
  })
})
