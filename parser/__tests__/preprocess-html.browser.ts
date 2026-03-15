import { describe, expect, it } from "vitest"

import { preprocessHtml } from "../plugins/preprocess-html"

describe("preprocessHtml — math/tex script conversion", () => {
  it("removes regular script tags", () => {
    const html = '<script>console.log("test")</script><p>Content</p>'
    const result = preprocessHtml(html)
    expect(result).not.toContain("console.log")
    expect(result).toContain("Content")
  })

  it("converts inline math/tex script to span marker", () => {
    const html = '<script type="math/tex">x^2</script><p>Content</p>'
    const result = preprocessHtml(html)
    // Script is converted to a span with data-math-type
    expect(result).toContain("data-math-type")
    expect(result).toContain("x^2")
    expect(result).not.toContain("<script")
  })

  it("converts block math/tex script to div marker", () => {
    const html = '<script type="math/tex; mode=display">\\frac{a}{b}</script>'
    const result = preprocessHtml(html)
    expect(result).toContain("data-math-type")
    expect(result).toContain("block")
    expect(result).toContain("\\frac{a}{b}")
    expect(result).not.toContain("<script")
  })

  it("removes text/javascript but converts math/tex", () => {
    const html = `
      <script type="text/javascript">var x = 1;</script>
      <script type="math/tex">y = 2</script>
      <p>Text</p>
    `
    const result = preprocessHtml(html)
    expect(result).not.toContain("var x = 1")
    expect(result).toContain("data-math-type")
    expect(result).toContain("y = 2")
  })

  it("removes script with no type attribute", () => {
    const html = "<script>alert(1)</script><p>OK</p>"
    const result = preprocessHtml(html)
    expect(result).not.toContain("alert")
    expect(result).toContain("OK")
  })

  it("converts multiple math/tex scripts", () => {
    const html = `
      <p>
        <script type="math/tex">a</script>
        <script type="math/tex; mode=display">b</script>
        <script type="math/tex">c</script>
      </p>
    `
    const result = preprocessHtml(html)
    // All three should be converted to markers
    const markerCount = (result.match(/data-math-type/g) || []).length
    expect(markerCount).toBe(3)
    expect(result).not.toContain("<script")
  })

  it("inline math/tex becomes span, block becomes div", () => {
    const html = `
      <script type="math/tex">inline</script>
      <script type="math/tex; mode=display">block</script>
    `
    const result = preprocessHtml(html)
    // Check the inline marker is a span
    expect(result).toMatch(/<span[^>]*data-math-type="inline"[^>]*>/)
    // Check the block marker is a div
    expect(result).toMatch(/<div[^>]*data-math-type="block"[^>]*>/)
  })
})

describe("preprocessHtml — SVG handling for math", () => {
  it("removes standalone SVG elements", () => {
    const html = '<svg viewBox="0 0 100 100"><circle r="50"/></svg><p>Text</p>'
    const result = preprocessHtml(html)
    expect(result).not.toContain("<svg")
    expect(result).toContain("Text")
  })

  it("preserves SVG inside MathJax container", () => {
    const html = `
      <mjx-container class="MathJax" jax="SVG">
        <svg viewBox="0 0 100 50"><path d="M0,0"/></svg>
        <mjx-assistive-mml>
          <math><semantics><mi>x</mi><annotation encoding="application/x-tex">x</annotation></semantics></math>
        </mjx-assistive-mml>
      </mjx-container>
    `
    const result = preprocessHtml(html)
    expect(result).toContain("mjx-container")
  })

  it("preserves SVG inside KaTeX container", () => {
    const html = `
      <span class="katex">
        <svg><use href="#svg-path"/></svg>
        <span class="katex-mathml"><math><semantics><mrow></mrow><annotation encoding="application/x-tex">x</annotation></semantics></math></span>
      </span>
    `
    const result = preprocessHtml(html)
    expect(result).toContain("katex")
  })

  it("removes standalone SVG while preserving math SVG", () => {
    const html = `
      <svg class="icon"><rect/></svg>
      <mjx-container class="MathJax" jax="SVG">
        <svg viewBox="0 0 100 50"><path/></svg>
        <mjx-assistive-mml>
          <math><annotation encoding="application/x-tex">y</annotation></math>
        </mjx-assistive-mml>
      </mjx-container>
    `
    const result = preprocessHtml(html)
    expect(result).toContain("mjx-container")
    expect(result).not.toContain('class="icon"')
  })
})

describe("preprocessHtml — other tag handling unchanged", () => {
  it("removes style tags", () => {
    const html = "<style>.red { color: red }</style><p>Text</p>"
    const result = preprocessHtml(html)
    expect(result).not.toContain(".red")
    expect(result).toContain("Text")
  })

  it("removes noscript tags", () => {
    // Note: DOMParser in browser may treat noscript content differently,
    // but the tag itself should be removed
    const html = "<noscript><p>Please enable JS</p></noscript><p>Text</p>"
    const result = preprocessHtml(html)
    expect(result).toContain("Text")
  })

  it("removes meta and link tags", () => {
    const html =
      '<meta charset="utf-8"><link rel="stylesheet" href="style.css"><p>Text</p>'
    const result = preprocessHtml(html)
    expect(result).not.toContain("stylesheet")
    expect(result).toContain("Text")
  })

  it("removes plasmo elements", () => {
    const html = '<div id="plasmo-overlay">overlay</div><p>Text</p>'
    const result = preprocessHtml(html)
    expect(result).not.toContain("overlay")
    expect(result).toContain("Text")
  })

  it("resolves relative image URLs", () => {
    const html = '<img src="/images/photo.jpg">'
    const result = preprocessHtml(html, "https://example.com")
    expect(result).toContain("https://example.com/images/photo.jpg")
  })
})
