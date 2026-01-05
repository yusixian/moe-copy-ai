import {
  isDynamicValue,
  getStableClasses,
  countMatches,
  generateUniqueSelector,
  generateSelectorWithInfo
} from "~utils/selector-generator"
import { setDocumentHTML, createMockElement } from "./helpers"

describe("selector-generator", () => {
  beforeEach(() => {
    setDocumentHTML("")
  })

  describe("isDynamicValue", () => {
    test("should detect hash values", () => {
      expect(isDynamicValue("a1b2c3d4")).toBe(true)
      expect(isDynamicValue("1234ABCD")).toBe(true)
      expect(isDynamicValue("abcdef12")).toBe(true)
    })

    test("should detect values with dynamic suffixes", () => {
      expect(isDynamicValue("button-a1b2")).toBe(true)
      expect(isDynamicValue("item_1234")).toBe(true)
      expect(isDynamicValue("element:abcd")).toBe(true)
    })

    test("should detect React portal IDs", () => {
      expect(isDynamicValue("r:0")).toBe(true)
      expect(isDynamicValue("r-1")).toBe(true)
      expect(isDynamicValue("r123")).toBe(true)
    })

    test("should detect Radix IDs", () => {
      expect(isDynamicValue("radix-1")).toBe(true)
      expect(isDynamicValue("radix-button")).toBe(true)
    })

    test("should detect UUIDs", () => {
      expect(
        isDynamicValue("550e8400-e29b-41d4-a716-446655440000")
      ).toBe(true)
    })

    test("should detect long numeric IDs", () => {
      expect(isDynamicValue("123456")).toBe(true)
      expect(isDynamicValue("1234567890")).toBe(true)
    })

    test("should not detect stable values", () => {
      expect(isDynamicValue("my-button")).toBe(false)
      expect(isDynamicValue("header")).toBe(false)
      expect(isDynamicValue("nav-item")).toBe(false)
      expect(isDynamicValue("12345")).toBe(false) // Less than 6 digits
    })
  })

  describe("getStableClasses", () => {
    test("should filter out hash classes", () => {
      const el = createMockElement("div", {
        className: "my-class a1b2c3d4 another-class"
      })
      document.body.appendChild(el)

      const stable = getStableClasses(el)

      expect(stable).toEqual(["my-class", "another-class"])
      expect(stable).not.toContain("a1b2c3d4")
    })

    test("should filter out CSS-in-JS classes", () => {
      const el = createMockElement("div", {
        className: "css-abc123 my-class sc-Button-xyz normal"
      })
      document.body.appendChild(el)

      const stable = getStableClasses(el)

      expect(stable).toEqual(["my-class", "normal"])
    })

    test("should filter out classes with dynamic suffixes", () => {
      const el = createMockElement("div", {
        className: "button btn-a1b2 menu normal"
      })
      document.body.appendChild(el)

      const stable = getStableClasses(el)

      expect(stable).toEqual(["button", "menu", "normal"])
    })

    test("should filter out CSS Modules classes", () => {
      const el = createMockElement("div", {
        className: "_abc12 Component_Button__xyz normal"
      })
      document.body.appendChild(el)

      const stable = getStableClasses(el)

      expect(stable).toEqual(["normal"])
    })

    test("should filter out Tailwind dynamic classes", () => {
      const el = createMockElement("div", {
        className: "[arbitrary-value] normal"
      })
      document.body.appendChild(el)

      const stable = getStableClasses(el)

      expect(stable).toEqual(["normal"])
    })

    test("should filter out empty classes", () => {
      const el = createMockElement("div", {
        className: "normal   "
      })
      document.body.appendChild(el)

      const stable = getStableClasses(el)

      expect(stable).toEqual(["normal"])
    })

    test("should return empty array if no stable classes", () => {
      const el = createMockElement("div", {
        className: "css-abc _xyz123"
      })
      document.body.appendChild(el)

      const stable = getStableClasses(el)

      expect(stable).toEqual([])
    })
  })

  describe("countMatches", () => {
    test("should count matching elements", () => {
      setDocumentHTML(`
        <div class="item">1</div>
        <div class="item">2</div>
        <div class="item">3</div>
      `)

      const count = countMatches(".item")

      expect(count).toBe(3)
    })

    test("should return 0 for no matches", () => {
      setDocumentHTML("<div></div>")

      const count = countMatches(".nonexistent")

      expect(count).toBe(0)
    })

    test("should return 0 for invalid selector", () => {
      const count = countMatches("[invalid")

      expect(count).toBe(0)
    })

    test("should count single element", () => {
      setDocumentHTML('<div id="unique"></div>')

      const count = countMatches("#unique")

      expect(count).toBe(1)
    })
  })

  describe("generateUniqueSelector", () => {
    test("should use ID selector when available", () => {
      const el = createMockElement("button", {
        id: "submit-btn",
        className: "btn primary"
      })
      document.body.appendChild(el)

      const selector = generateUniqueSelector(el)

      expect(selector).toBe("#submit-btn")
    })

    test("should skip dynamic ID", () => {
      const el = createMockElement("div", {
        id: "a1b2c3d4", // Dynamic hash
        className: "my-class"
      })
      document.body.appendChild(el)

      const selector = generateUniqueSelector(el)

      // Should use class instead
      expect(selector).not.toContain("a1b2c3d4")
      expect(selector).toContain("my-class")
    })

    test("should use semantic attributes", () => {
      const el = createMockElement("button", {
        "data-testid": "login-button"
      })
      document.body.appendChild(el)

      const selector = generateUniqueSelector(el)

      expect(selector).toBe('button[data-testid="login-button"]')
    })

    test("should use stable classes", () => {
      const el = createMockElement("div", {
        className: "container main-content"
      })
      document.body.appendChild(el)

      const selector = generateUniqueSelector(el)

      expect(selector).toMatch(/div\.container\.main-content|div\.main-content/)
    })

    test("should escape special characters in ID", () => {
      const el = createMockElement("div", {
        id: "my:id.with-special"
      })
      document.body.appendChild(el)

      const selector = generateUniqueSelector(el)

      // Should escape special characters
      expect(selector).toContain("#my")
      expect(selector).not.toBe("#my:id.with-special")
    })

    test("should allow multiple matches when allowMultiple is true", () => {
      setDocumentHTML(`
        <div class="item">1</div>
        <div class="item">2</div>
      `)

      const el = document.querySelector(".item")!
      const selector = generateUniqueSelector(el, { allowMultiple: true })

      expect(selector).toContain("item")
      expect(countMatches(selector)).toBeGreaterThan(1)
    })

    test("should use role attribute", () => {
      const el = createMockElement("button", {
        role: "navigation"
      })
      document.body.appendChild(el)

      const selector = generateUniqueSelector(el)

      expect(selector).toBe('button[role="navigation"]')
    })

    test("should use custom attributes", () => {
      const el = createMockElement("input", {
        name: "email",
        type: "email"
      })
      document.body.appendChild(el)

      const selector = generateUniqueSelector(el)

      // Should use name or type attribute
      expect(selector).toMatch(/input\[name="email"\]|input\[type="email"\]/)
    })

    test("should skip multiline attribute values", () => {
      const el = createMockElement("div", {
        "aria-label": "Line 1\nLine 2"
      })
      el.className = "my-class"
      document.body.appendChild(el)

      const selector = generateUniqueSelector(el)

      // Should not use multiline attribute
      expect(selector).not.toContain("\n")
    })

    test("should generate path selector as fallback", () => {
      setDocumentHTML(`
        <div>
          <div>
            <div></div>
          </div>
        </div>
      `)

      const el = document.querySelector("div div div")!
      const selector = generateUniqueSelector(el)

      // Should generate some path selector when no better option
      expect(selector).toBeTruthy()
      expect(selector).toMatch(/div/)
    })
  })

  describe("generateSelectorWithInfo", () => {
    test("should return selector with stability score", () => {
      const el = createMockElement("div", {
        id: "my-id"
      })
      document.body.appendChild(el)

      const result = generateSelectorWithInfo(el)

      expect(result.selector).toBe("#my-id")
      expect(result.matchCount).toBe(1)
      expect(result.stability).toBe(95) // ID has highest stability
      expect(result.type).toBe("id")
    })

    test("should return semantic selector info", () => {
      const el = createMockElement("button", {
        "data-testid": "submit"
      })
      document.body.appendChild(el)

      const result = generateSelectorWithInfo(el)

      expect(result.type).toBe("semantic")
      expect(result.stability).toBe(85)
    })

    test("should return class selector info", () => {
      const el = createMockElement("div", {
        className: "unique-class"
      })
      document.body.appendChild(el)

      const result = generateSelectorWithInfo(el)

      expect(result.type).toBe("class")
      expect(result.stability).toBe(80)
    })

    test("should return attribute selector info", () => {
      const el = createMockElement("input", {
        type: "checkbox",
        name: "agree"
      })
      document.body.appendChild(el)

      const result = generateSelectorWithInfo(el)

      expect(result.type).toMatch(/semantic|attribute/)
      expect(result.stability).toBeGreaterThan(60)
    })

    test("should return nth-path info as fallback", () => {
      setDocumentHTML("<div><span></span></div>")
      const el = document.querySelector("span")!

      const result = generateSelectorWithInfo(el)

      expect(result.type).toBe("nth-path")
      expect(result.stability).toBe(30) // Lowest stability
      expect(result.matchCount).toBe(1)
    })

    test("should respect maxAncestorDepth option", () => {
      setDocumentHTML(`
        <div>
          <div>
            <div>
              <div>
                <span class="target"></span>
              </div>
            </div>
          </div>
        </div>
      `)

      const el = document.querySelector(".target")!
      const result1 = generateSelectorWithInfo(el, { maxAncestorDepth: 1 })
      const result2 = generateSelectorWithInfo(el, { maxAncestorDepth: 5 })

      // Both should work, but depths may differ
      expect(result1.selector).toBeTruthy()
      expect(result2.selector).toBeTruthy()
    })

    test("should prefer ID over other attributes", () => {
      const el = createMockElement("div", {
        id: "main",
        className: "container",
        "data-testid": "wrapper"
      })
      document.body.appendChild(el)

      const result = generateSelectorWithInfo(el)

      expect(result.selector).toBe("#main")
      expect(result.type).toBe("id")
    })

    test("should handle multiple elements with allowMultiple", () => {
      setDocumentHTML(`
        <div class="item">1</div>
        <div class="item">2</div>
      `)

      const el = document.querySelector(".item")!
      const result = generateSelectorWithInfo(el, { allowMultiple: true })

      expect(result.matchCount).toBe(2)
      expect(result.selector).toContain("item")
    })

    test("should try multiple class combinations", () => {
      const el = createMockElement("div", {
        className: "a b c d"
      })
      document.body.appendChild(el)

      // Add another element with partial overlap
      const el2 = createMockElement("div", {
        className: "a b c"
      })
      document.body.appendChild(el2)

      const result = generateSelectorWithInfo(el)

      // Should use all classes to uniquely identify
      expect(result.selector).toMatch(/div\.a\.b\.c\.d/)
      expect(result.matchCount).toBe(1)
    })

    test("should skip non-semantic attributes with spaces", () => {
      const el = createMockElement("div", {
        "data-custom": "multi word value"
      })
      el.className = "my-class"
      document.body.appendChild(el)

      const result = generateSelectorWithInfo(el)

      // Should not use custom attribute with spaces (will use class instead)
      expect(result.selector).toContain("my-class")
    })

    test("should skip very long attribute values", () => {
      const longValue = "a".repeat(60)
      const el = createMockElement("div", {
        "data-id": longValue
      })
      el.className = "my-class"
      document.body.appendChild(el)

      const result = generateSelectorWithInfo(el)

      // Should not use long attribute
      expect(result.selector).not.toContain(longValue)
    })
  })

  describe("edge cases", () => {
    test("should handle nested elements", () => {
      setDocumentHTML(`
        <div class="parent">
          <div class="child">
            <span id="target"></span>
          </div>
        </div>
      `)

      const el = document.querySelector("#target")!
      const selector = generateUniqueSelector(el)

      expect(selector).toBe("#target")
    })

    test("should handle SVG elements", () => {
      setDocumentHTML('<svg><circle id="my-circle"></circle></svg>')

      const el = document.querySelector("#my-circle")!
      const selector = generateUniqueSelector(el)

      expect(selector).toBe("#my-circle")
    })

    test("should escape complex CSS characters", () => {
      const el = createMockElement("div", {
        className: "my.class:special[test]"
      })
      document.body.appendChild(el)

      const selector = generateUniqueSelector(el)

      // Should escape special CSS characters
      expect(selector).toBeTruthy()
    })
  })
})
