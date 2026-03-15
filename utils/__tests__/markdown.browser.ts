import { describe, expect, it } from "vitest"

import { renderMarkdown } from "../markdown"

describe("renderMarkdown — basic", () => {
  it("returns empty string for empty input", () => {
    expect(renderMarkdown("")).toBe("")
  })

  it("renders paragraphs", () => {
    const html = renderMarkdown("Hello world")
    expect(html).toContain("<p>Hello world</p>")
  })

  it("renders bold and italic", () => {
    const html = renderMarkdown("**bold** and *italic*")
    expect(html).toContain("<strong>bold</strong>")
    expect(html).toContain("<em>italic</em>")
  })

  it("renders headings", () => {
    const html = renderMarkdown("# Title\n\n## Subtitle")
    expect(html).toContain("<h1>Title</h1>")
    expect(html).toContain("<h2>Subtitle</h2>")
  })

  it("renders links", () => {
    const html = renderMarkdown("[link](https://example.com)")
    expect(html).toContain('href="https://example.com"')
    expect(html).toContain("link")
  })

  it("renders code blocks", () => {
    const html = renderMarkdown("```js\nconst x = 1\n```")
    expect(html).toContain("<code")
    expect(html).toContain("const x = 1")
  })

  it("renders inline code", () => {
    const html = renderMarkdown("Use `code` here")
    expect(html).toContain("<code>code</code>")
  })

  it("renders GFM tables", () => {
    const html = renderMarkdown("| A | B |\n|---|---|\n| 1 | 2 |")
    expect(html).toContain("<table>")
    expect(html).toContain("<td>1</td>")
  })
})

describe("renderMarkdown — math formulas (KaTeX)", () => {
  it("renders inline math with $ delimiters", () => {
    const html = renderMarkdown("The formula $E = mc^2$ is famous.")
    expect(html).toContain("katex")
    expect(html).toContain("The formula")
    expect(html).toContain("is famous.")
    // KaTeX output should contain the rendered formula
    expect(html).not.toContain("$E = mc^2$")
  })

  it("renders block math with $$ delimiters", () => {
    const html = renderMarkdown("$$\nx = \\frac{-b}{2a}\n$$")
    expect(html).toContain("katex")
    // Block formulas get katex-display class
    expect(html).toContain("display")
  })

  it("renders inline math with simple variable", () => {
    const html = renderMarkdown("Let $x$ be a variable.")
    expect(html).toContain("katex")
    expect(html).toContain("Let")
    expect(html).toContain("be a variable.")
  })

  it("renders multiple inline math formulas", () => {
    const html = renderMarkdown("Given $a$ and $b$, compute $a + b$.")
    expect(html).toContain("katex")
    // Should have rendered all three formulas
    const katexCount = (html.match(/class="katex"/g) || []).length
    expect(katexCount).toBeGreaterThanOrEqual(3)
  })

  it("renders complex block formula", () => {
    const html = renderMarkdown(
      "$$\n\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}\n$$"
    )
    expect(html).toContain("katex")
  })

  it("renders sum notation", () => {
    const html = renderMarkdown("$$\n\\sum_{i=1}^{n} a_i\n$$")
    expect(html).toContain("katex")
  })

  it("renders matrix", () => {
    const html = renderMarkdown(
      "$$\n\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}\n$$"
    )
    expect(html).toContain("katex")
  })

  it("does not treat single $ in text as math delimiter", () => {
    // markdown-it-texmath requires $ to be adjacent to content
    const html = renderMarkdown("The price is $ 100.")
    // Should NOT render as math
    expect(html).not.toContain("katex")
    expect(html).toContain("$ 100")
  })

  it("handles inline math with subscript and superscript", () => {
    const html = renderMarkdown("$x_i^2$")
    expect(html).toContain("katex")
  })

  it("handles Greek letters", () => {
    const html = renderMarkdown("$\\alpha + \\beta = \\gamma$")
    expect(html).toContain("katex")
  })

  it("renders math alongside GFM features", () => {
    const md = `# Math Document

The formula $E = mc^2$ is famous.

$$
\\frac{d}{dx} f(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}
$$

| Symbol | Meaning |
|--------|---------|
| $\\alpha$ | alpha |
| $\\beta$ | beta |

- Item with $x^2$
- Item with $y^2$`

    const html = renderMarkdown(md)
    expect(html).toContain("<h1>Math Document</h1>")
    expect(html).toContain("katex")
    expect(html).toContain("<table>")
    expect(html).toContain("<li>")
  })
})

describe("renderMarkdown — math edge cases", () => {
  it("handles escaped dollar signs", () => {
    const html = renderMarkdown("Price is \\$100")
    expect(html).toContain("$100")
  })

  it("handles adjacent inline formulas", () => {
    const html = renderMarkdown("$a$$b$")
    // Should render both as separate inline formulas or handle gracefully
    expect(html).toContain("katex")
  })

  it("handles block formula after paragraph", () => {
    const html = renderMarkdown("Text.\n\n$$\nx = 1\n$$\n\nMore text.")
    expect(html).toContain("Text.")
    expect(html).toContain("More text.")
    expect(html).toContain("katex")
  })

  it("handles empty math delimiters gracefully", () => {
    // Empty $$ should not crash
    const html = renderMarkdown("Text $$ text")
    expect(html).toBeDefined()
  })
})
