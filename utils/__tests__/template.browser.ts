import { describe, expect, it } from "vitest"

import type { ScrapedContent } from "~constants/types"

import {
  extractPlaceholders,
  hasAnyPlaceholder,
  hasPlaceholder,
  processTemplate
} from "../template"

describe("processTemplate", () => {
  const mockData: ScrapedContent = {
    url: "https://example.com/article",
    title: "Test Article Title",
    author: "John Doe",
    publishDate: "2024-01-15",
    articleContent: "Full article content here",
    cleanedContent: "Cleaned content here",
    metadata: {
      description: "Article description",
      keywords: "test, article"
    }
  }

  it("replaces basic placeholders", () => {
    const template = "Title: {{title}}\nURL: {{url}}"
    const result = processTemplate(template, mockData)

    expect(result).toBe(
      "Title: Test Article Title\nURL: https://example.com/article"
    )
  })

  it("replaces metadata placeholders", () => {
    const template =
      "Description: {{meta.description}}\nKeywords: {{meta.keywords}}"
    const result = processTemplate(template, mockData)

    expect(result).toBe(
      "Description: Article description\nKeywords: test, article"
    )
  })

  it("replaces multiple occurrences of same placeholder", () => {
    const template = "{{title}} - {{title}}"
    const result = processTemplate(template, mockData)

    expect(result).toBe("Test Article Title - Test Article Title")
  })

  it("handles missing data with empty strings", () => {
    const emptyData: ScrapedContent = {
      url: "https://example.com",
      title: "",
      articleContent: ""
    }
    const template = "Title: {{title}}\nAuthor: {{author}}"
    const result = processTemplate(template, emptyData)

    expect(result).toBe("Title: \nAuthor: ")
  })

  it("returns original template when empty", () => {
    const result = processTemplate("", mockData)

    expect(result).toBe("")
  })
})

describe("hasPlaceholder", () => {
  it("returns true when placeholder exists", () => {
    const template = "Content: {{content}}"

    expect(hasPlaceholder(template, "{{content}}")).toBe(true)
  })

  it("returns false when placeholder does not exist", () => {
    const template = "Content: {{content}}"

    expect(hasPlaceholder(template, "{{title}}")).toBe(false)
  })
})

describe("extractPlaceholders", () => {
  it("extracts multiple unique placeholders", () => {
    const template = "{{title}} by {{author}} on {{publishDate}}"
    const placeholders = extractPlaceholders(template)

    expect(placeholders).toEqual(["{{title}}", "{{author}}", "{{publishDate}}"])
  })

  it("removes duplicate placeholders", () => {
    const template = "{{title}} - {{title}}"
    const placeholders = extractPlaceholders(template)

    expect(placeholders).toEqual(["{{title}}"])
  })

  it("returns empty array when no placeholders found", () => {
    const template = "Just plain text"
    const placeholders = extractPlaceholders(template)

    expect(placeholders).toEqual([])
  })
})

describe("hasAnyPlaceholder", () => {
  it("returns true when template has placeholders", () => {
    const template = "Article: {{title}}"

    expect(hasAnyPlaceholder(template)).toBe(true)
  })

  it("returns false when template has no placeholders", () => {
    const template = "Just plain text"

    expect(hasAnyPlaceholder(template)).toBe(false)
  })
})
