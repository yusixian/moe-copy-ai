import { describe, expect, it } from "vitest"

import { cleanContent, formatContent } from "../formatter"

describe("formatContent", () => {
  it("returns empty string for empty input", () => {
    expect(formatContent("")).toBe("")
  })

  it("normalizes multiple newlines to maximum 2", () => {
    expect(formatContent("a\n\n\n\nb")).toBe("a\n\nb")
    expect(formatContent("a\n\n\n\n\n\nb")).toBe("a\n\nb")
  })

  it("preserves double newlines (paragraph breaks)", () => {
    expect(formatContent("para1\n\npara2")).toBe("para1\n\npara2")
  })

  it("converts CRLF to LF", () => {
    expect(formatContent("line1\r\nline2")).toBe("line1\nline2")
    expect(formatContent("a\r\nb\r\nc")).toBe("a\nb\nc")
  })

  it("handles mixed line endings", () => {
    expect(formatContent("a\r\n\n\n\nb")).toBe("a\n\nb")
  })
})

describe("cleanContent", () => {
  it("returns empty string for empty input", () => {
    expect(cleanContent("")).toBe("")
  })

  it("preserves code blocks during cleaning", () => {
    const input =
      "text\n\n```js\nconst x = 1;\nconsole.log(x);\n```\n\nmore text"
    const result = cleanContent(input)
    expect(result).toContain("```js\nconst x = 1;\nconsole.log(x);\n```")
  })

  it("preserves multiple code blocks", () => {
    const input =
      "```python\nprint('hello')\n```\n\ntext\n\n```bash\necho hi\n```"
    const result = cleanContent(input)
    expect(result).toContain("```python\nprint('hello')\n```")
    expect(result).toContain("```bash\necho hi\n```")
  })

  it("collapses multiple newlines outside code blocks", () => {
    const input = "text\n\n\n\nmore text"
    const result = cleanContent(input)
    expect(result).not.toContain("\n\n")
  })

  it("normalizes whitespace", () => {
    const input = "text   with    multiple   spaces"
    const result = cleanContent(input)
    expect(result).toBe("text with multiple spaces")
  })

  it("fixes punctuation spacing", () => {
    const input = "Hello  .  World  !"
    const result = cleanContent(input)
    expect(result).toBe("Hello. World!")
  })

  it("preserves Markdown heading format", () => {
    const input = "#   Title\n##   Subtitle"
    const result = cleanContent(input)
    expect(result).toContain("# Title")
    expect(result).toContain("## Subtitle")
  })

  it("handles content with brackets and quotes", () => {
    const input = "[ item ] and ( value ) and { data }"
    const result = cleanContent(input)
    expect(result).toContain("[item]")
    expect(result).toContain("(value)")
    expect(result).toContain("{data}")
  })
})
