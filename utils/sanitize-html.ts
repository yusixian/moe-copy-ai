import DOMPurify from "dompurify"

/**
 * Sanitize HTML for safe display in summary results.
 * Allows common markdown-rendered tags but blocks dangerous ones.
 */
export function sanitizeHtmlForDisplay(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      // Block elements
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "div",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "br",
      // Inline elements
      "a",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "del",
      "span",
      "mark",
      "sup",
      "sub",
      "img",
      // Interactive elements (safe when attributes are controlled)
      "details",
      "summary"
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "title",
      "width",
      "height",
      "class",
      "id",
      "open"
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "object",
      "embed",
      "form",
      "input"
    ],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"]
  })
}
