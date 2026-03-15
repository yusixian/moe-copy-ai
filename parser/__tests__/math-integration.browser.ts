import { describe, expect, it } from "vitest"

import { parseHtmlToMarkdown } from "../htmlParser"

/**
 * Integration tests: realistic HTML fragments from real websites
 * Tests the full pipeline: preprocess → rehype → math extraction → remark → markdown
 */

describe("Integration — Wikipedia-style MathML", () => {
  it("extracts formula from Wikipedia-style MathML with annotation", async () => {
    const html = `
      <div class="mw-parser-output">
        <p>In physics, the mass–energy equivalence is expressed as</p>
        <dl><dd>
          <math xmlns="http://www.w3.org/1998/Math/MathML" alttext="E=mc^{2}" display="block">
            <semantics>
              <mrow>
                <mi>E</mi><mo>=</mo><mi>m</mi>
                <msup><mi>c</mi><mn>2</mn></msup>
              </mrow>
              <annotation encoding="application/x-tex">E=mc^{2}</annotation>
            </semantics>
          </math>
        </dd></dl>
        <p>where <math xmlns="http://www.w3.org/1998/Math/MathML">
          <semantics>
            <mi>E</mi>
            <annotation encoding="application/x-tex">E</annotation>
          </semantics>
        </math> is energy.</p>
      </div>
    `
    const md = await parseHtmlToMarkdown(html)
    expect(md).toContain("mass–energy equivalence")
    expect(md).toContain("$$")
    expect(md).toContain("E=mc^{2}")
    expect(md).toContain("$E$")
    expect(md).toContain("is energy")
  })

  it("handles Wikipedia inline MathML formula", async () => {
    const html = `
      <p>The quadratic formula <math xmlns="http://www.w3.org/1998/Math/MathML">
        <semantics>
          <mrow>
            <mi>x</mi><mo>=</mo>
            <mfrac>
              <mrow><mo>-</mo><mi>b</mi><mo>±</mo><msqrt><mrow><msup><mi>b</mi><mn>2</mn></msup><mo>-</mo><mn>4</mn><mi>a</mi><mi>c</mi></mrow></msqrt></mrow>
              <mrow><mn>2</mn><mi>a</mi></mrow>
            </mfrac>
          </mrow>
          <annotation encoding="application/x-tex">x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}</annotation>
        </semantics>
      </math> solves any quadratic equation.</p>
    `
    const md = await parseHtmlToMarkdown(html)
    expect(md).toContain("quadratic formula")
    expect(md).toContain("$x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}$")
    expect(md).toContain("solves any quadratic equation")
  })
})

describe("Integration — arXiv-style MathJax v3", () => {
  it("extracts formula from arXiv-like MathJax v3 page", async () => {
    const html = `
      <div class="abstract">
        <p>We study the convergence of
          <mjx-container class="MathJax" jax="CHTML">
            <mjx-math><mjx-mi>f</mjx-mi></mjx-math>
            <mjx-assistive-mml>
              <math xmlns="http://www.w3.org/1998/Math/MathML">
                <semantics>
                  <mrow><mi>f</mi><mo>(</mo><mi>x</mi><mo>)</mo></mrow>
                  <annotation encoding="application/x-tex">f(x)</annotation>
                </semantics>
              </math>
            </mjx-assistive-mml>
          </mjx-container>
          as <mjx-container class="MathJax" jax="CHTML">
            <mjx-math></mjx-math>
            <mjx-assistive-mml>
              <math xmlns="http://www.w3.org/1998/Math/MathML">
                <semantics>
                  <mrow><mi>x</mi><mo>→</mo><mi mathvariant="normal">∞</mi></mrow>
                  <annotation encoding="application/x-tex">x \\to \\infty</annotation>
                </semantics>
              </math>
            </mjx-assistive-mml>
          </mjx-container>.
        </p>
        <mjx-container class="MathJax" jax="CHTML" display="true">
          <mjx-math></mjx-math>
          <mjx-assistive-mml>
            <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
              <semantics>
                <mrow>
                  <munder><mo>lim</mo><mrow><mi>n</mi><mo>→</mo><mi mathvariant="normal">∞</mi></mrow></munder>
                  <msub><mi>a</mi><mi>n</mi></msub>
                  <mo>=</mo><mi>L</mi>
                </mrow>
                <annotation encoding="application/x-tex">\\lim_{n \\to \\infty} a_n = L</annotation>
              </semantics>
            </math>
          </mjx-assistive-mml>
        </mjx-container>
      </div>
    `
    const md = await parseHtmlToMarkdown(html)
    expect(md).toContain("convergence")
    expect(md).toContain("$f(x)$")
    expect(md).toContain("$x \\to \\infty$")
    expect(md).toContain("$$")
    expect(md).toContain("\\lim_{n \\to \\infty} a_n = L")
  })
})

describe("Integration — CSDN/Zhihu-style KaTeX", () => {
  it("extracts KaTeX formulas from blog-style content", async () => {
    const html = `
      <div class="article-content">
        <h2>Euler's Identity</h2>
        <p>The most beautiful equation in mathematics is
          <span class="katex">
            <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">e^{i\\pi} + 1 = 0</annotation></semantics></math></span>
            <span class="katex-html" aria-hidden="true"><span class="strut"></span></span>
          </span>
        </p>
        <p>It connects five fundamental constants:</p>
        <ul>
          <li><span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">e</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"></span></span> — Euler's number</li>
          <li><span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">i</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"></span></span> — imaginary unit</li>
          <li><span class="katex"><span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">\\pi</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"></span></span> — pi</li>
        </ul>
        <p>The proof relies on the Taylor expansion:</p>
        <span class="katex-display">
          <span class="katex">
            <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">e^{ix} = \\cos x + i \\sin x</annotation></semantics></math></span>
            <span class="katex-html" aria-hidden="true"></span>
          </span>
        </span>
      </div>
    `
    const md = await parseHtmlToMarkdown(html)
    expect(md).toContain("## Euler's Identity")
    expect(md).toContain("$e^{i\\pi} + 1 = 0$")
    expect(md).toContain("$e$")
    expect(md).toContain("$i$")
    expect(md).toContain("$\\pi$")
    expect(md).toContain("$$")
    expect(md).toContain("e^{ix} = \\cos x + i \\sin x")
    expect(md).toContain("Euler's number")
  })
})

describe("Integration — MathJax v2 legacy pages", () => {
  it("extracts MathJax v2 script-based formulas", async () => {
    const html = `
      <div class="content">
        <p>Consider the function
          <script type="math/tex">f(x) = x^2 + 2x + 1</script>
          which can be factored as
          <script type="math/tex">(x+1)^2</script>.
        </p>
        <p>Its derivative is:</p>
        <script type="math/tex; mode=display">f'(x) = 2x + 2</script>
      </div>
    `
    const md = await parseHtmlToMarkdown(html)
    expect(md).toContain("$f(x) = x^2 + 2x + 1$")
    expect(md).toContain("$(x+1)^2$")
    expect(md).toContain("$$")
    expect(md).toContain("f'(x) = 2x + 2")
  })
})

describe("Integration — Mixed math environments", () => {
  it("handles page with multiple math sources", async () => {
    const html = `
      <article>
        <h1>Mathematics Review</h1>
        <p>The KaTeX formula: <span class="katex">
          <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">a^2 + b^2 = c^2</annotation></semantics></math></span>
          <span class="katex-html" aria-hidden="true"></span>
        </span></p>
        <p>Native MathML: <math xmlns="http://www.w3.org/1998/Math/MathML">
          <semantics>
            <mrow><mi>x</mi><mo>=</mo><mn>42</mn></mrow>
            <annotation encoding="application/x-tex">x = 42</annotation>
          </semantics>
        </math></p>
      </article>
    `
    const md = await parseHtmlToMarkdown(html)
    expect(md).toContain("# Mathematics Review")
    expect(md).toContain("$a^2 + b^2 = c^2$")
    expect(md).toContain("$x = 42$")
  })

  it("handles page with no math content at all", async () => {
    const html = `
      <article>
        <h1>Regular Article</h1>
        <p>This is a plain text article with <strong>bold</strong> and <em>italic</em>.</p>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
        <blockquote>A quote.</blockquote>
      </article>
    `
    const md = await parseHtmlToMarkdown(html)
    expect(md).toContain("# Regular Article")
    expect(md).toContain("**bold**")
    expect(md).toContain("*italic*")
    expect(md).toContain("- Item 1")
    expect(md).not.toContain("$")
  })
})

describe("Integration — Complex real-world scenarios", () => {
  it("handles long mathematical document", async () => {
    const katexInline = (latex: string) => `
      <span class="katex">
        <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">${latex}</annotation></semantics></math></span>
        <span class="katex-html" aria-hidden="true"></span>
      </span>
    `
    const katexBlock = (latex: string) => `
      <span class="katex-display">
        <span class="katex">
          <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">${latex}</annotation></semantics></math></span>
          <span class="katex-html" aria-hidden="true"></span>
        </span>
      </span>
    `

    const html = `
      <article>
        <h1>Calculus Fundamentals</h1>
        <h2>1. Limits</h2>
        <p>The limit ${katexInline("\\lim_{x \\to a} f(x) = L")} means that...</p>
        ${katexBlock("\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1")}

        <h2>2. Derivatives</h2>
        <p>The derivative of ${katexInline("f(x)")} is defined as:</p>
        ${katexBlock("f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}")}

        <h2>3. Integrals</h2>
        <p>The definite integral ${katexInline("\\int_a^b f(x) dx")} represents the area under the curve.</p>
        ${katexBlock("\\int_0^1 x^2 dx = \\frac{1}{3}")}

        <h2>4. Fundamental Theorem</h2>
        <p>If ${katexInline("F'(x) = f(x)")}, then:</p>
        ${katexBlock("\\int_a^b f(x) dx = F(b) - F(a)")}
      </article>
    `
    const md = await parseHtmlToMarkdown(html)

    // All section headings
    expect(md).toContain("# Calculus Fundamentals")
    expect(md).toContain("## 1. Limits")
    expect(md).toContain("## 2. Derivatives")
    expect(md).toContain("## 3. Integrals")
    expect(md).toContain("## 4. Fundamental Theorem")

    // All inline formulas
    expect(md).toContain("$\\lim_{x \\to a} f(x) = L$")
    expect(md).toContain("$f(x)$")
    expect(md).toContain("$\\int_a^b f(x) dx$")
    expect(md).toContain("$F'(x) = f(x)$")

    // All block formulas (in $$ blocks)
    expect(md).toContain("\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1")
    expect(md).toContain("f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}")
    expect(md).toContain("\\int_0^1 x^2 dx = \\frac{1}{3}")
    expect(md).toContain("\\int_a^b f(x) dx = F(b) - F(a)")
  })

  it("preserves formula with newlines and alignment", async () => {
    const html = `
      <span class="katex-display">
        <span class="katex">
          <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">\\begin{aligned} a &amp;= b + c \\\\ d &amp;= e + f \\end{aligned}</annotation></semantics></math></span>
          <span class="katex-html" aria-hidden="true"></span>
        </span>
      </span>
    `
    const md = await parseHtmlToMarkdown(html)
    expect(md).toContain("$$")
    expect(md).toContain("\\begin{aligned}")
    expect(md).toContain("\\end{aligned}")
  })
})
