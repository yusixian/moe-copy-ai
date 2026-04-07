import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { parseHtmlToMarkdown } from "../htmlParser"

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
