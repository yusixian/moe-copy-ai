import { afterEach, describe, expect, it } from "vitest"

import {
  generateNextPageButtonSelector,
  getStableClasses,
  isDynamicValue
} from "../selector-generator"

describe("isDynamicValue", () => {
  it("detects dynamic values (hash, UUID, React IDs, long numbers)", () => {
    // Hex hash (8+ chars)
    expect(isDynamicValue("a1b2c3d4")).toBe(true)
    // Dynamic suffix
    expect(isDynamicValue("button-a1b2c3d4")).toBe(true)
    // React/Radix IDs
    expect(isDynamicValue("r:0")).toBe(true)
    expect(isDynamicValue("radix-dropdown")).toBe(true)
    // UUID
    expect(isDynamicValue("550e8400-e29b-41d4-a716-446655440000")).toBe(true)
    // Long numeric
    expect(isDynamicValue("123456")).toBe(true)
  })

  it("rejects static values", () => {
    expect(isDynamicValue("button")).toBe(false)
    expect(isDynamicValue("btn-primary")).toBe(false)
    expect(isDynamicValue("abc123")).toBe(false) // short hex
    expect(isDynamicValue("12345")).toBe(false) // short numeric
  })
})

describe("getStableClasses", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("filters out dynamic classes and preserves semantic ones", () => {
    const div = document.createElement("div")
    // Mix of: hash, CSS-in-JS, CSS Modules, Tailwind arbitrary, dynamic suffix, stable
    div.className =
      "a1b2c3d4e5f6 css-1a2b3c sc-Button-abc123 _xyz789 [display:flex] btn_abcd1234 nav-link active"
    const result = getStableClasses(div)
    expect(result).toEqual(["nav-link", "active"])
  })

  it("returns empty array when no stable classes exist", () => {
    const div = document.createElement("div")
    div.className = "css-abc123 _xyz789 [display:block]"
    expect(getStableClasses(div)).toEqual([])
  })
})

describe("generateNextPageButtonSelector", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("prioritizes rel='next' and aria-label attributes", () => {
    document.body.innerHTML = '<a rel="next" href="/page2">Next</a>'
    expect(generateNextPageButtonSelector(document.querySelector("a")!).xpath).toBe(
      "//a[@rel='next']"
    )

    document.body.innerHTML = '<a aria-label="Next page" href="/page2">→</a>'
    expect(
      generateNextPageButtonSelector(document.querySelector("a")!).xpath
    ).toContain("aria-label")
  })

  it("uses text matching for unique short text", () => {
    document.body.innerHTML = "<button>Next</button>"
    const result = generateNextPageButtonSelector(document.querySelector("button")!)
    expect(result.xpath).toContain("Next")
    expect(result.textContent).toBe("Next")
  })

  it("uses class/data-attr when text is not unique", () => {
    document.body.innerHTML = `
      <a class="btn-next" href="/page2">Next</a>
      <a href="/other">Next</a>
    `
    expect(
      generateNextPageButtonSelector(document.querySelector("a.btn-next")!).xpath
    ).toContain("next")

    document.body.innerHTML = `
      <button data-next-page="2">Go</button>
      <button>Go</button>
    `
    expect(
      generateNextPageButtonSelector(
        document.querySelector("button[data-next-page]")!
      ).xpath
    ).toContain("data-next-page")
  })

  it("falls back to XPath path when no semantic attributes", () => {
    document.body.innerHTML =
      '<div><span><a href="/page2">Very long text that exceeds twenty chars without attributes</a></span></div>'
    const result = generateNextPageButtonSelector(document.querySelector("a")!)
    expect(result.xpath).toMatch(/^\/\//)
    expect(result.description).toBe("路径定位")
  })
})
