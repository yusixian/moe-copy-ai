import { describe, expect, it } from "vitest"

import { cleanContent, formatContent } from "../formatter"

describe("formatContent", () => {
  it("normalizes line endings and collapses excess newlines", () => {
    expect(formatContent("")).toBe("")
    expect(formatContent("a\r\nline2")).toBe("a\nline2")
    expect(formatContent("a\n\n\n\nb")).toBe("a\n\nb")
    expect(formatContent("para1\n\npara2")).toBe("para1\n\npara2")
  })
})

describe("cleanContent", () => {
  it("preserves code blocks while cleaning surrounding text", () => {
    const input = "text\n\n```js\nconst x = 1;\n```\n\nmore text"
    const result = cleanContent(input)
    expect(result).toContain("```js\nconst x = 1;\n```")
  })

  it("normalizes whitespace and fixes punctuation", () => {
    expect(cleanContent("text   with    spaces")).toBe("text with spaces")
    expect(cleanContent("Hello  .  World  !")).toBe("Hello. World!")
    expect(cleanContent("[ item ] and ( value )")).toContain("[item]")
  })

  it("preserves markdown heading format", () => {
    const result = cleanContent("#   Title\n##   Subtitle")
    expect(result).toContain("# Title")
    expect(result).toContain("## Subtitle")
  })
})
