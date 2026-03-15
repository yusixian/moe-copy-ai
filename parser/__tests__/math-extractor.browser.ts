import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { parseHtmlToMarkdown } from "../htmlParser"

// Helper: wrap HTML and parse to markdown
async function toMarkdown(html: string): Promise<string> {
  return parseHtmlToMarkdown(html)
}

describe("Math Formula Extraction — KaTeX", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("extracts inline KaTeX formula from annotation", async () => {
    const html = `
      <span class="katex">
        <span class="katex-mathml">
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <semantics>
              <mrow><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></mrow>
              <annotation encoding="application/x-tex">E = mc^2</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">E=mc2</span>
      </span>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$E = mc^2$")
    // Should NOT contain the rendered HTML text
    expect(md).not.toContain("E=mc2")
  })

  it("extracts block KaTeX formula (katex-display wrapper)", async () => {
    const html = `
      <span class="katex-display">
        <span class="katex">
          <span class="katex-mathml">
            <math xmlns="http://www.w3.org/1998/Math/MathML">
              <semantics>
                <mrow><mi>x</mi><mo>=</mo><mfrac><mrow><mo>-</mo><mi>b</mi></mrow><mrow><mn>2</mn><mi>a</mi></mrow></mfrac></mrow>
                <annotation encoding="application/x-tex">x = \\frac{-b}{2a}</annotation>
              </semantics>
            </math>
          </span>
          <span class="katex-html" aria-hidden="true">rendered</span>
        </span>
      </span>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$$")
    expect(md).toContain("x = \\frac{-b}{2a}")
    expect(md).not.toContain("rendered")
  })

  it("handles KaTeX inline formula surrounded by text", async () => {
    const html = `
      <p>The formula <span class="katex">
        <span class="katex-mathml">
          <math><semantics>
            <mrow><mi>a</mi><mo>+</mo><mi>b</mi></mrow>
            <annotation encoding="application/x-tex">a + b</annotation>
          </semantics></math>
        </span>
        <span class="katex-html" aria-hidden="true">a+b</span>
      </span> is simple.</p>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("The formula")
    expect(md).toContain("$a + b$")
    expect(md).toContain("is simple.")
  })

  it("handles multiple KaTeX formulas in same paragraph", async () => {
    const katex = (latex: string) => `
      <span class="katex">
        <span class="katex-mathml">
          <math><semantics>
            <mrow></mrow>
            <annotation encoding="application/x-tex">${latex}</annotation>
          </semantics></math>
        </span>
        <span class="katex-html" aria-hidden="true"></span>
      </span>
    `
    const html = `<p>Given ${katex("x")} and ${katex("y")}, compute ${katex("x + y")}.</p>`
    const md = await toMarkdown(html)
    expect(md).toContain("$x$")
    expect(md).toContain("$y$")
    expect(md).toContain("$x + y$")
  })

  it("preserves KaTeX formula with special characters", async () => {
    const html = `
      <span class="katex">
        <span class="katex-mathml">
          <math><semantics>
            <mrow></mrow>
            <annotation encoding="application/x-tex">\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}</annotation>
          </semantics></math>
        </span>
        <span class="katex-html" aria-hidden="true"></span>
      </span>
    `
    const md = await toMarkdown(html)
    expect(md).toContain(
      "$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$"
    )
  })
})

describe("Math Formula Extraction — MathJax v3", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("extracts inline MathJax v3 CHTML formula", async () => {
    const html = `
      <mjx-container class="MathJax" jax="CHTML">
        <mjx-math><mjx-mi>x</mjx-mi></mjx-math>
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

  it("extracts block MathJax v3 formula (display=true)", async () => {
    const html = `
      <mjx-container class="MathJax" jax="CHTML" display="true">
        <mjx-math><mjx-mi>E</mjx-mi></mjx-math>
        <mjx-assistive-mml>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <semantics>
              <mrow><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></mrow>
              <annotation encoding="application/x-tex">E = mc^2</annotation>
            </semantics>
          </math>
        </mjx-assistive-mml>
      </mjx-container>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$$")
    expect(md).toContain("E = mc^2")
  })

  it("extracts MathJax v3 SVG output formula", async () => {
    const html = `
      <mjx-container class="MathJax" jax="SVG">
        <svg viewBox="0 0 100 100"><rect/></svg>
        <mjx-assistive-mml>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <semantics>
              <mrow><mi>y</mi><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup></mrow>
              <annotation encoding="application/x-tex">y = x^2</annotation>
            </semantics>
          </math>
        </mjx-assistive-mml>
      </mjx-container>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$y = x^2$")
  })

  it("falls back to mathml-to-latex when no annotation", async () => {
    const html = `
      <mjx-container class="MathJax" jax="CHTML">
        <mjx-math><mjx-mi>x</mjx-mi></mjx-math>
        <mjx-assistive-mml>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <mrow>
              <mi>x</mi>
              <mo>+</mo>
              <mn>1</mn>
            </mrow>
          </math>
        </mjx-assistive-mml>
      </mjx-container>
    `
    const md = await toMarkdown(html)
    // mathml-to-latex should convert <mi>x</mi><mo>+</mo><mn>1</mn> to something like x + 1
    expect(md).toContain("$")
    // Should have some form of x + 1
    expect(md).toMatch(/x\s*\+\s*1/)
  })

  it("handles MathJax v3 with complex formula", async () => {
    const html = `
      <mjx-container class="MathJax" jax="CHTML" display="true">
        <mjx-math></mjx-math>
        <mjx-assistive-mml>
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <semantics>
              <mrow><munderover><mo>∑</mo><mrow><mi>i</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi></munderover><msub><mi>a</mi><mi>i</mi></msub></mrow>
              <annotation encoding="application/x-tex">\\sum_{i=1}^{n} a_i</annotation>
            </semantics>
          </math>
        </mjx-assistive-mml>
      </mjx-container>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$$")
    expect(md).toContain("\\sum_{i=1}^{n} a_i")
  })
})

describe("Math Formula Extraction — MathJax v2", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("extracts inline MathJax v2 from script tag", async () => {
    const html = `<p>Inline: <script type="math/tex">x^2</script> formula.</p>`
    const md = await toMarkdown(html)
    expect(md).toContain("$x^2$")
    expect(md).toContain("Inline:")
    expect(md).toContain("formula.")
  })

  it("extracts block MathJax v2 from script tag with mode=display", async () => {
    const html = `<script type="math/tex; mode=display">\\frac{a}{b}</script>`
    const md = await toMarkdown(html)
    expect(md).toContain("$$")
    expect(md).toContain("\\frac{a}{b}")
  })

  it("handles MathJax v2 rendered span with sibling script", async () => {
    const html = `
      <p>
        <script type="math/tex">x^2</script>
        <span class="MathJax" id="MathJax-Element-1-Frame">
          <span class="math">x²</span>
        </span>
      </p>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$x^2$")
    // The rendered span should be removed (no duplication)
    expect(md).not.toContain("x²")
  })

  it("handles MathJax v2 script with spaces in type attribute", async () => {
    const html = `<script type="math/tex; mode=display">a + b = c</script>`
    const md = await toMarkdown(html)
    expect(md).toContain("$$")
    expect(md).toContain("a + b = c")
  })
})

describe("Math Formula Extraction — Native MathML", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.useRealTimers()
  })

  it("extracts native MathML with annotation", async () => {
    const html = `
      <math xmlns="http://www.w3.org/1998/Math/MathML">
        <semantics>
          <mrow><mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup></mrow>
          <annotation encoding="application/x-tex">E = mc^2</annotation>
        </semantics>
      </math>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$E = mc^2$")
  })

  it("extracts native MathML without annotation via mathml-to-latex", async () => {
    const html = `
      <math xmlns="http://www.w3.org/1998/Math/MathML">
        <mrow>
          <mi>x</mi>
          <mo>+</mo>
          <mn>1</mn>
        </mrow>
      </math>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$")
    expect(md).toMatch(/x\s*\+\s*1/)
  })

  it("detects block MathML with display=block attribute", async () => {
    const html = `
      <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
        <semantics>
          <mrow><mi>y</mi><mo>=</mo><msup><mi>x</mi><mn>2</mn></msup></mrow>
          <annotation encoding="application/x-tex">y = x^2</annotation>
        </semantics>
      </math>
    `
    const md = await toMarkdown(html)
    expect(md).toContain("$$")
    expect(md).toContain("y = x^2")
  })

  it("does NOT extract MathML nested inside KaTeX container", async () => {
    // This <math> is part of KaTeX and should be handled by KaTeX handler, not MathML handler
    const html = `
      <span class="katex">
        <span class="katex-mathml">
          <math xmlns="http://www.w3.org/1998/Math/MathML">
            <semantics>
              <mrow><mi>a</mi></mrow>
              <annotation encoding="application/x-tex">a</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">a</span>
      </span>
    `
    const md = await toMarkdown(html)
    // Should produce exactly one $a$, not duplicated
    const matches = md.match(/\$a\$/g)
    expect(matches).toHaveLength(1)
  })
})

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
