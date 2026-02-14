import { marked } from "marked"

// Configure marked: GFM enabled (default), breaks off
marked.use({ gfm: true, breaks: false })

/**
 * Render markdown string to HTML.
 * `as string` is safe because no async extensions are registered.
 */
export function renderMarkdown(content: string): string {
  if (!content) return ""
  return marked.parse(content) as string
}
