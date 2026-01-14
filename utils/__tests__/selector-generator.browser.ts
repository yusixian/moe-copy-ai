import { afterEach, describe, expect, it } from "vitest"

import {
  generateNextPageButtonSelector,
  getStableClasses,
  isDynamicValue
} from "../selector-generator"

// Helper to get element or throw test error
function getTestElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector)
  if (!element) {
    throw new Error(`Test setup error: element "${selector}" not found`)
  }
  return element
}

// Global cleanup after each test
afterEach(() => {
  document.body.innerHTML = ""
})

describe("isDynamicValue", () => {
  it("detects dynamic values (hash, UUID, React IDs, long numbers)", () => {
    expect(isDynamicValue("a1b2c3d4")).toBe(true) // Hex hash (8+ chars)
    expect(isDynamicValue("button-a1b2c3d4")).toBe(true) // Dynamic suffix
    expect(isDynamicValue("r:0")).toBe(true) // React IDs
    expect(isDynamicValue("radix-dropdown")).toBe(true) // Radix IDs
    expect(isDynamicValue("550e8400-e29b-41d4-a716-446655440000")).toBe(true) // UUID
    expect(isDynamicValue("123456")).toBe(true) // Long numeric
  })

  it("rejects static values", () => {
    expect(isDynamicValue("button")).toBe(false)
    expect(isDynamicValue("btn-primary")).toBe(false)
    expect(isDynamicValue("abc123")).toBe(false) // short hex
    expect(isDynamicValue("12345")).toBe(false) // short numeric
  })
})

describe("getStableClasses", () => {
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
  it("generates XPath for rel='next' attribute", () => {
    document.body.innerHTML = '<a rel="next" href="/page2">Next</a>'
    const result = generateNextPageButtonSelector(
      getTestElement<HTMLAnchorElement>("a")
    )
    expect(result.xpath).toBe("//a[@rel='next']")
    expect(result.description).toBe('rel="next"')
  })

  it("generates XPath for aria-label attribute", () => {
    document.body.innerHTML = '<a aria-label="Next page" href="/page2">→</a>'
    const result = generateNextPageButtonSelector(
      getTestElement<HTMLAnchorElement>("a")
    )
    expect(result.xpath).toContain("aria-label")
    expect(result.description).toBe('aria-label="Next page"')
  })

  it("uses text matching for unique short text", () => {
    document.body.innerHTML = "<button>Next</button>"
    const result = generateNextPageButtonSelector(
      getTestElement<HTMLButtonElement>("button")
    )
    expect(result.xpath).toContain("Next")
    expect(result.textContent).toBe("Next")
  })

  it("uses class containing 'next' when text is not unique", () => {
    document.body.innerHTML = `
      <a class="btn-next" href="/page2">Next</a>
      <a href="/other">Next</a>
    `
    const result = generateNextPageButtonSelector(
      getTestElement<HTMLAnchorElement>("a.btn-next")
    )
    expect(result.xpath).toContain("next")
  })

  it("uses data attribute when text is not unique", () => {
    document.body.innerHTML = `
      <button data-next-page="2">Go</button>
      <button>Go</button>
    `
    const result = generateNextPageButtonSelector(
      getTestElement<HTMLButtonElement>("button[data-next-page]")
    )
    expect(result.xpath).toContain("data-next-page")
  })

  it("falls back to XPath path when no semantic attributes", () => {
    document.body.innerHTML =
      '<div><span><a href="/page2">Very long text that exceeds twenty chars without attributes</a></span></div>'
    const result = generateNextPageButtonSelector(
      getTestElement<HTMLAnchorElement>("a")
    )
    expect(result.xpath).toMatch(/^\/\//)
    expect(result.description).toBe("路径定位")
  })
})
