import { describe, expect, it } from "vitest"

import { sanitizeHtmlForDisplay } from "../sanitize-html"

describe("sanitizeHtmlForDisplay", () => {
  describe("allowed tags", () => {
    it("preserves heading tags", () => {
      const html = "<h1>Title</h1><h2>Subtitle</h2><h3>Section</h3>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<h1>Title</h1>")
      expect(result).toContain("<h2>Subtitle</h2>")
      expect(result).toContain("<h3>Section</h3>")
    })

    it("preserves paragraph and div tags", () => {
      const html = "<p>Paragraph text</p><div>Div content</div>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<p>Paragraph text</p>")
      expect(result).toContain("<div>Div content</div>")
    })

    it("preserves list elements", () => {
      const html =
        "<ul><li>Item 1</li><li>Item 2</li></ul><ol><li>First</li></ol>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<ul>")
      expect(result).toContain("<ol>")
      expect(result).toContain("<li>Item 1</li>")
    })

    it("preserves anchor tags with href", () => {
      const html = '<a href="https://example.com">Link</a>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain('<a href="https://example.com">Link</a>')
    })

    it("preserves code and pre tags", () => {
      const html = "<pre><code>const x = 1;</code></pre>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<pre>")
      expect(result).toContain("<code>const x = 1;</code>")
    })

    it("preserves image tags with allowed attributes", () => {
      const html = '<img src="image.png" alt="Description" title="Title">'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("src=")
      expect(result).toContain("alt=")
    })

    it("preserves table elements", () => {
      const html =
        "<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<table>")
      expect(result).toContain("<thead>")
      expect(result).toContain("<tbody>")
      expect(result).toContain("<tr>")
      expect(result).toContain("<th>Header</th>")
      expect(result).toContain("<td>Cell</td>")
    })

    it("preserves inline formatting tags", () => {
      const html =
        "<strong>Bold</strong><em>Italic</em><u>Underline</u><s>Strike</s>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<strong>Bold</strong>")
      expect(result).toContain("<em>Italic</em>")
      expect(result).toContain("<u>Underline</u>")
      expect(result).toContain("<s>Strike</s>")
    })
  })

  describe("forbidden tags", () => {
    it("removes script tags", () => {
      const html = '<p>Content</p><script>alert("XSS")</script>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<p>Content</p>")
      expect(result).not.toContain("<script>")
      expect(result).not.toContain("alert")
    })

    it("removes style tags", () => {
      const html = "<p>Content</p><style>body { color: red; }</style>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<p>Content</p>")
      expect(result).not.toContain("<style>")
      expect(result).not.toContain("color: red")
    })

    it("removes iframe tags", () => {
      const html = '<p>Content</p><iframe src="https://evil.com"></iframe>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<p>Content</p>")
      expect(result).not.toContain("<iframe")
      expect(result).not.toContain("evil.com")
    })

    it("removes form and input tags", () => {
      const html =
        '<form action="/steal"><input type="password" name="pwd"></form>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("<form")
      expect(result).not.toContain("<input")
    })

    it("removes object and embed tags", () => {
      const html = '<object data="malware.swf"></object><embed src="hack.swf">'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("<object")
      expect(result).not.toContain("<embed")
    })
  })

  describe("allowed attributes", () => {
    it("preserves href attribute on anchors", () => {
      const html =
        '<a href="https://example.com" target="_blank" rel="noopener">Link</a>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain('href="https://example.com"')
      expect(result).toContain('target="_blank"')
      expect(result).toContain('rel="noopener"')
    })

    it("preserves class and id attributes", () => {
      const html = '<div class="container" id="main">Content</div>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain('class="container"')
      expect(result).toContain('id="main"')
    })

    it("preserves width and height on images", () => {
      const html = '<img src="img.png" width="100" height="50">'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("width=")
      expect(result).toContain("height=")
    })
  })

  describe("forbidden attributes", () => {
    it("removes onerror attribute", () => {
      const html = '<img src="x" onerror="alert(1)">'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("onerror")
      expect(result).not.toContain("alert")
    })

    it("removes onclick attribute", () => {
      const html = '<button onclick="stealCookies()">Click</button>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("onclick")
      expect(result).not.toContain("stealCookies")
    })

    it("removes onload attribute", () => {
      const html = '<body onload="init()">'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("onload")
    })

    it("removes onmouseover attribute", () => {
      const html = '<div onmouseover="track()">Hover</div>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("onmouseover")
    })

    it("removes style attribute", () => {
      const html = '<div style="background: url(evil.png)">Content</div>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("style=")
      expect(result).not.toContain("background")
    })
  })

  describe("XSS protection", () => {
    it("sanitizes img onerror XSS vector", () => {
      const html = '<img src="x" onerror="alert(document.cookie)">'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("onerror")
      expect(result).not.toContain("alert")
      expect(result).not.toContain("document.cookie")
    })

    it("sanitizes javascript: protocol in href", () => {
      const html = '<a href="javascript:alert(1)">Click</a>'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("javascript:")
    })

    it("sanitizes data: protocol in src", () => {
      const html = '<img src="data:text/html,<script>alert(1)</script>">'
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("<script>")
    })

    it("sanitizes nested script in svg", () => {
      const html = "<svg><script>alert(1)</script></svg>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("<script>")
      expect(result).not.toContain("alert")
    })

    it("sanitizes event handlers in various forms", () => {
      const html = `
        <div onclick="evil()">1</div>
        <div onmouseover="evil()">2</div>
        <img src="x" onerror="evil()">
        <body onload="evil()">
      `
      const result = sanitizeHtmlForDisplay(html)

      expect(result).not.toContain("onclick")
      expect(result).not.toContain("onmouseover")
      expect(result).not.toContain("onerror")
      expect(result).not.toContain("onload")
      expect(result).not.toContain("evil()")
    })
  })

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(sanitizeHtmlForDisplay("")).toBe("")
    })

    it("handles plain text without tags", () => {
      const text = "Just plain text content"
      expect(sanitizeHtmlForDisplay(text)).toBe(text)
    })

    it("handles nested allowed tags", () => {
      const html = "<div><p><strong>Bold <em>and italic</em></strong></p></div>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("<div>")
      expect(result).toContain("<p>")
      expect(result).toContain("<strong>")
      expect(result).toContain("<em>")
    })

    it("preserves text content when removing forbidden tags", () => {
      const html = "<p>Keep this</p><script>remove this</script><p>And this</p>"
      const result = sanitizeHtmlForDisplay(html)

      expect(result).toContain("Keep this")
      expect(result).toContain("And this")
      expect(result).not.toContain("remove this")
    })
  })
})
