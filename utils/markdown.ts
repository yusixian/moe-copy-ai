import katex from "katex"
import MarkdownIt from "markdown-it"
import texmath from "markdown-it-texmath"

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
}).use(texmath, {
  engine: katex,
  delimiters: "dollars"
})

/**
 * Render markdown string to HTML.
 */
export function renderMarkdown(content: string): string {
  if (!content) return ""
  return md.render(content)
}
