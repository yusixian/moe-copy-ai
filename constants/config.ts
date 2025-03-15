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
  ".author-name",
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
  'meta[name="title"]',
  'meta[property="og:title"]',
  'meta[name="twitter:title"]',
  "h1[class*='title']",
  "article h1",
  "main h1",
  "header h1",
  "section h1",
  "h1",
  "div[id*='title']",
  "div[class*='title']"
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

// 图片属性选择器列表 - 用于提取图片的src属性
export const IMAGE_SRC_ATTRIBUTES = [
  "src",
  "data-original",
  "data-src",
  "data-lazy-src",
  "data-lazy",
  "data-original-src",
  "data-source",
  "data-url",
  "data-hi-res",
  "data-fullsize",
  "data-image"
]
