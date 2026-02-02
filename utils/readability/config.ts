import type DOMPurify from "dompurify"

export const DOMPURIFY_CONFIG: DOMPurify.Config = {
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  ADD_TAGS: [
    "article",
    "section",
    "aside",
    "nav",
    "header",
    "footer",
    "main",
    "time"
  ],
  ADD_ATTR: ["datetime", "pubdate", "itemscope", "itemtype", "itemprop"],
  ALLOW_DATA_ATTR: true,
  KEEP_CONTENT: true,
  FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
  FORBID_ATTR: ["onload", "onerror", "onclick", "onmouseover", "style"],
  CUSTOM_ELEMENT_HANDLING: {
    tagNameCheck: (tagName) => !tagName.toLowerCase().includes("plasmo"),
    attributeNameCheck: (attr) => !attr.toLowerCase().includes("plasmo")
  }
}

export const CLASSES_TO_PRESERVE: string[] = [
  "newsletter",
  "newsletter-section",
  "newsletter-article",
  "newsletter-header",
  "article-title",
  "section-title",
  "content",
  "article",
  "main",
  "box"
]

export const READABILITY_OPTIONS = {
  charThreshold: 0,
  maxElemsToParse: 0,
  nbTopCandidates: 50,
  keepClasses: true,
  classesToPreserve: CLASSES_TO_PRESERVE
}
