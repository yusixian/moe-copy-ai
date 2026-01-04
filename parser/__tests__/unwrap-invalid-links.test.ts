/**
 * @jest-environment jsdom
 */

import { rehypeUnwrapInvalidLinks } from "../plugins/unwrap-invalid-links"
import type { HastElement, HastNode } from "../types"

describe("rehypeUnwrapInvalidLinks", () => {
  const plugin = rehypeUnwrapInvalidLinks()

  function createLinkElement(
    href: string | undefined,
    text: string
  ): HastElement {
    return {
      type: "element",
      tagName: "a",
      properties: href !== undefined ? { href } : {},
      children: [{ type: "text", value: text }]
    }
  }

  function createParentElement(children: HastNode[]): HastElement {
    return {
      type: "element",
      tagName: "div",
      properties: {},
      children
    }
  }

  test("should unwrap links with empty href", () => {
    const tree = createParentElement([
      createLinkElement("", "Empty Link"),
      { type: "text", value: " and " },
      createLinkElement(undefined, "No Href Link")
    ])

    plugin(tree)

    expect(tree.children).toHaveLength(3)
    expect(tree.children[0]).toEqual({ type: "text", value: "Empty Link" })
    expect(tree.children[1]).toEqual({ type: "text", value: " and " })
    expect(tree.children[2]).toEqual({ type: "text", value: "No Href Link" })
  })

  test("should unwrap links with javascript: protocol", () => {
    const tree = createParentElement([
      createLinkElement("javascript:void(0)", "JS Link"),
      { type: "text", value: " and " },
      createLinkElement("JavaScript:alert('xss')", "JS Alert")
    ])

    plugin(tree)

    expect(tree.children).toHaveLength(3)
    expect(tree.children[0]).toEqual({ type: "text", value: "JS Link" })
    expect(tree.children[1]).toEqual({ type: "text", value: " and " })
    expect(tree.children[2]).toEqual({ type: "text", value: "JS Alert" })
  })

  test("should unwrap links with hash-only href", () => {
    const tree = createParentElement([
      createLinkElement("#", "Hash Link"),
      { type: "text", value: " and " },
      createLinkElement("#section", "Section Link")
    ])

    plugin(tree)

    expect(tree.children).toHaveLength(3)
    expect(tree.children[0]).toEqual({ type: "text", value: "Hash Link" })
    expect(tree.children[1]).toEqual({ type: "text", value: " and " })
    expect(tree.children[2]).toEqual({ type: "text", value: "Section Link" })
  })

  test("should preserve valid links", () => {
    const validLink = createLinkElement("https://example.com", "Valid Link")
    const tree = createParentElement([validLink])

    plugin(tree)

    expect(tree.children).toHaveLength(1)
    expect(tree.children[0]).toEqual(validLink)
  })

  test("should preserve relative links", () => {
    const relativeLink = createLinkElement("/path/to/page", "Relative Link")
    const tree = createParentElement([relativeLink])

    plugin(tree)

    expect(tree.children).toHaveLength(1)
    expect(tree.children[0]).toEqual(relativeLink)
  })

  test("should handle nested elements in unwrapped links", () => {
    const linkWithNested: HastElement = {
      type: "element",
      tagName: "a",
      properties: { href: "javascript:void(0)" },
      children: [
        { type: "text", value: "Text with " },
        {
          type: "element",
          tagName: "strong",
          properties: {},
          children: [{ type: "text", value: "bold" }]
        },
        { type: "text", value: " content" }
      ]
    }

    const tree = createParentElement([linkWithNested])

    plugin(tree)

    expect(tree.children).toHaveLength(3)
    expect(tree.children[0]).toEqual({ type: "text", value: "Text with " })
    expect(tree.children[1]).toEqual({
      type: "element",
      tagName: "strong",
      properties: {},
      children: [{ type: "text", value: "bold" }]
    })
    expect(tree.children[2]).toEqual({ type: "text", value: " content" })
  })

  test("should handle multiple invalid links in sequence", () => {
    const tree = createParentElement([
      createLinkElement("#", "First"),
      createLinkElement("javascript:void(0)", "Second"),
      createLinkElement("", "Third"),
      createLinkElement("https://valid.com", "Valid")
    ])

    plugin(tree)

    expect(tree.children).toHaveLength(4)
    expect(tree.children[0]).toEqual({ type: "text", value: "First" })
    expect(tree.children[1]).toEqual({ type: "text", value: "Second" })
    expect(tree.children[2]).toEqual({ type: "text", value: "Third" })
    expect(tree.children[3].type).toBe("element")
    expect((tree.children[3] as HastElement).tagName).toBe("a")
  })

  test("should handle deeply nested structures", () => {
    const tree: HastElement = {
      type: "element",
      tagName: "div",
      properties: {},
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [
            { type: "text", value: "Paragraph with " },
            createLinkElement("#anchor", "anchor link"),
            { type: "text", value: " inside" }
          ]
        }
      ]
    }

    plugin(tree)

    const pElement = tree.children[0] as HastElement
    expect(pElement.children).toHaveLength(3)
    expect(pElement.children[0]).toEqual({
      type: "text",
      value: "Paragraph with "
    })
    expect(pElement.children[1]).toEqual({ type: "text", value: "anchor link" })
    expect(pElement.children[2]).toEqual({ type: "text", value: " inside" })
  })

  test("should handle whitespace-only href", () => {
    const tree = createParentElement([
      createLinkElement("   ", "Whitespace Link")
    ])

    plugin(tree)

    expect(tree.children).toHaveLength(1)
    expect(tree.children[0]).toEqual({ type: "text", value: "Whitespace Link" })
  })

  test("should handle non-string href values", () => {
    const linkWithNumberHref: HastElement = {
      type: "element",
      tagName: "a",
      properties: { href: 123 as unknown },
      children: [{ type: "text", value: "Number Href" }]
    }

    const tree = createParentElement([linkWithNumberHref])

    plugin(tree)

    expect(tree.children).toHaveLength(1)
    expect(tree.children[0]).toEqual({ type: "text", value: "Number Href" })
  })

  test("should not affect non-link elements", () => {
    const tree = createParentElement([
      {
        type: "element",
        tagName: "p",
        properties: {},
        children: [{ type: "text", value: "Paragraph" }]
      },
      {
        type: "element",
        tagName: "strong",
        properties: {},
        children: [{ type: "text", value: "Bold" }]
      }
    ])

    const originalChildren = JSON.parse(JSON.stringify(tree.children))
    plugin(tree)

    expect(tree.children).toEqual(originalChildren)
  })
})
