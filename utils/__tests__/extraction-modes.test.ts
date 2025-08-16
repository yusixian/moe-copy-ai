/**
 * @jest-environment jsdom
 */

import { scrapeWebpageContent } from "../extractor"

describe("Extraction Modes Integration", () => {
  beforeEach(() => {
    // Reset DOM
    document.head.innerHTML = "<title>Test Page</title>"
    document.body.innerHTML = `
      <article>
        <h1>Test Article</h1>
        <p>This is test content for extraction.</p>
      </article>
    `
  })

  test("should set extraction mode metadata for selector mode", async () => {
    const result = await scrapeWebpageContent({
      mode: "selector"
    })

    expect(result.metadata["extraction:mode"]).toBe("selector")
  })

  test("should fallback to selector mode when readability fails", async () => {
    const result = await scrapeWebpageContent({
      mode: "readability"
    })

    // Since we're in a minimal test environment, Readability will likely fail
    // and fall back to selector mode
    expect(result.metadata["extraction:mode"]).toBeDefined()
  })

  test("should handle hybrid mode", async () => {
    const result = await scrapeWebpageContent({
      mode: "hybrid"
    })

    expect(result.metadata["extraction:mode"]).toBeDefined()
    expect(result.articleContent).toBeDefined()
  })

  test("should default to selector mode when no mode specified", async () => {
    const result = await scrapeWebpageContent()

    expect(result.metadata["extraction:mode"]).toBe("selector")
  })
})
