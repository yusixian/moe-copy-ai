import type { PlasmoCSConfig } from "plasmo"

// 指定内容脚本应该运行的页面
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// 文章内容选择器列表 - 按优先级排序
export const CONTENT_SELECTORS = [
  "main",
  "#content",
  ".content",
  "#main",
  ".main",
  ".post-content",
  ".entry-content",
  ".article-content",
  ".story-body",
  '[itemprop="articleBody"]',
  ".post-body",
  ".entry",
  ".blog-post",
  "#article-body"
]

// 作者选择器列表 - 按优先级排序
export const AUTHOR_SELECTORS = [
  'meta[name="author"]',
  'meta[property="article:author"]',
  'meta[property="og:author"]',
  'a[rel="author"]',
  ".author",
  ".byline",
  ".writer",
  ".by-line",
  '[itemprop="author"]',
  '[class*="author"]',
  '[class*="byline"]',
  'span[class*="author"]',
  ".post-meta a",
  'address[class*="author"]',
  ".entry-meta .author"
]

// 日期选择器列表 - 按优先级排序
export const DATE_SELECTORS = [
  'meta[property="article:published_time"]',
  'meta[property="og:published_time"]',
  'meta[name="date"]',
  "time[datetime]",
  "time[pubdate]",
  '[itemprop="datePublished"]',
  ".published-date",
  ".post-date",
  ".entry-date",
  '[class*="publish"]',
  '[class*="date"]'
]

// 标题选择器列表 - 按优先级排序
export const TITLE_SELECTORS = [
  'meta[property="og:title"]',
  'meta[name="twitter:title"]',
  'meta[name="title"]'
]

// 不需要处理的元素标签列表
export const SKIP_TAGS = [
  "script",
  "style",
  "noscript",
  "iframe",
  "nav",
  "footer",
  "header",
  "aside",
  "form",
  "button",
  "input"
]
