import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { parseHtmlToMarkdown } from "../htmlParser"

async function toMarkdown(html: string): Promise<string> {
  return parseHtmlToMarkdown(html)
}

describe("Math Formula Extraction — Edge Cases", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("handles content with no math formulas (passthrough)", async () => {
    const html = "<p>Hello <strong>world</strong>! No math here.</p>"
    const md = await toMarkdown(html)
    expect(md).toContain("Hello")
    expect(md).toContain("**world**")
    expect(md).not.toContain("$")
  })

  it("handles empty input", async () => {
    const md = await toMarkdown("")
    expect(md).toBe("")
  })

  it("handles empty KaTeX annotation (fallback: no marker)", async () => {
    const html = `
      <span class="katex">
        <span class="katex-mathml">
          <math><semantics>
            <mrow></mrow>
            <annotation encoding="application/x-tex"></annotation>
          </semantics></math>
        </span>
        <span class="katex-html" aria-hidden="true">rendered</span>
      </span>
    `
    const md = await toMarkdown(html)
    // Empty annotation should not produce an empty $$ marker
    expect(md).not.toContain("$$")
  })

  it("handles formula with data-formula attribute", async () => {
    const html = `
      <span class="katex" data-formula="\\alpha + \\beta">
        <span class="katex-html" aria-hidden="true">αβ</span>
      </span>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$\\alpha + \\beta$")
  })

  it("handles mixed content: text, inline math, block math", async () => {
    const html = `
      <p>Inline formula: <span class="katex">
        <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">a + b</annotation></semantics></math></span>
        <span class="katex-html" aria-hidden="true"></span>
      </span> in text.</p>
      <span class="katex-display">
        <span class="katex">
          <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">c = d</annotation></semantics></math></span>
          <span class="katex-html" aria-hidden="true"></span>
        </span>
      </span>
      <p>More text here.</p>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$a + b$")
    expect(md).toContain("$$")
    expect(md).toContain("c = d")
    expect(md).toContain("More text here.")
  })

  it("handles deeply nested KaTeX inside other HTML elements", async () => {
    const html = `
      <article>
        <section>
          <div class="content">
            <p>The equation <span class="katex">
              <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">F = ma</annotation></semantics></math></span>
              <span class="katex-html" aria-hidden="true"></span>
            </span> is Newton's second law.</p>
          </div>
        </section>
      </article>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$F = ma$")
    expect(md).toContain("Newton's second law")
  })

  it("handles LaTeX with dollar signs in the formula itself", async () => {
    // Edge case: LaTeX that contains literal dollar signs shouldn't break
    const html = `
      <span class="katex">
        <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">\\text{price} = \\$100</annotation></semantics></math></span>
        <span class="katex-html" aria-hidden="true"></span>
      </span>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$\\text{price} = \\$100$")
  })

  it("handles multiple block formulas in sequence", async () => {
    const makeBlock = (latex: string) => `
      <span class="katex-display">
        <span class="katex">
          <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">${latex}</annotation></semantics></math></span>
          <span class="katex-html" aria-hidden="true"></span>
        </span>
      </span>
    `
    const html = `<div>${makeBlock("a = 1")}${makeBlock("b = 2")}${makeBlock("c = 3")}</div>`
    const md = await toMarkdown(html)
    expect(md).toContain("a = 1")
    expect(md).toContain("b = 2")
    expect(md).toContain("c = 3")
    // Each should be in $$ delimiters
    const blockMatches = md.match(/\$\$/g)
    expect(blockMatches?.length).toBeGreaterThanOrEqual(6) // 3 formulas × 2 $$ each
  })

  it("handles whitespace-only annotation gracefully", async () => {
    const html = `
      <span class="katex">
        <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">   </annotation></semantics></math></span>
        <span class="katex-html" aria-hidden="true"></span>
      </span>
    `
    const md = await toMarkdown(html)
    // Whitespace-only annotation should be treated as empty (no marker)
    expect(md).not.toMatch(/\$\s+\$/)
  })

  it("preserves non-math SVG removal", async () => {
    const html = `
      <p>Text content</p>
      <svg viewBox="0 0 100 100"><circle r="50"/></svg>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("Text content")
    expect(md).not.toContain("svg")
    expect(md).not.toContain("circle")
  })

  it("preserves normal scripts removal while keeping math/tex", async () => {
    const html = `
      <script>console.log("removed")</script>
      <script type="math/tex">x^2</script>
      <p>Content</p>
    `
    const md = await toMarkdown(html)
    expect(md).not.toContain("console.log")
    expect(md).toContain("$x^2$")
    expect(md).toContain("Content")
  })
})

describe("Math Formula Extraction — Preprocessing", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("preserves math/tex script through preprocessing", async () => {
    const html = `
      <div>
        <script type="text/javascript">var x = 1;</script>
        <script type="math/tex">y = 2</script>
        <script type="math/tex; mode=display">z = 3</script>
        <p>Text</p>
      </div>
    `
    const md = await toMarkdown(html)
    expect(md).not.toContain("var x")
    expect(md).toContain("$y = 2$")
    expect(md).toContain("$$")
    expect(md).toContain("z = 3")
  })

  it("preserves SVG inside MathJax container through preprocessing", async () => {
    // SVGs inside MathJax containers should be preserved during preprocessing
    // so the math extractor can find the annotation
    const html = `
      <mjx-container class="MathJax" jax="SVG">
        <svg viewBox="0 0 100 50"><path d="M0,0"/></svg>
        <mjx-assistive-mml>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <semantics>
              <mi>x</mi>
              <annotation encoding="application/x-tex">x</annotation>
            </semantics>
          </math>
        </mjx-assistive-mml>
      </mjx-container>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$x$")
  })
})
