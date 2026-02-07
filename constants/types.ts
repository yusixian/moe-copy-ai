// 图片信息接口
export interface ImageInfo {
  src: string
  alt: string
  title: string
  index: number
}

// 选择器类型
export type SelectorType = "content" | "author" | "date" | "title"

// 选择器结果项
export interface SelectorResultItem {
  selector: string
  content: string // 选择器抓取到的第一个内容
  allContent?: string[] // 选择器抓取到的所有内容（如有多个）
}

export type SelectorResultsMap = Record<SelectorType, SelectorResultItem[]>

// 抓取内容接口
export interface ScrapedContent {
  title: string
  url: string
  articleContent: string
  cleanedContent: string
  author: string
  publishDate: string
  metadata: Record<string, string>
  images: ImageInfo[]
  // 每种类型的选择器结果，用于显示不同选择器抓取到的内容
  selectorResults?: Record<SelectorType, SelectorResultItem[]>
}

// 消息接口
export interface Message {
  action: string
  [key: string]: unknown
}

export interface ScrapeResponse {
  success: boolean
  data?: ScrapedContent
  error?: string
}

// 选择器测试请求接口
export interface SelectorTestRequest extends Message {
  action: "testSelector"
  selector: string
}

// 选择器测试响应接口
export interface SelectorTestResponse {
  matches: number
  content?: string
  error?: string
}

// AI聊天历史记录条目
export interface AiChatHistoryItem {
  id: string
  timestamp: number
  url: string
  prompt: string
  content: string
  processedPrompt?: string
  usage?: {
    total_tokens?: number
    prompt_tokens?: number
    completion_tokens?: number
  }
}

// AI聊天历史记录列表
export interface AiChatHistory {
  items: AiChatHistoryItem[]
}

// Prompt template
export interface PromptTemplate {
  id: string // preset: "preset:<key>", custom: crypto.randomUUID()
  name: string
  content: string // supports {{placeholders}}
  isPreset: boolean
  description?: string
  icon?: string // Iconify icon name (preset only)
  isModified?: boolean // true if preset has user overrides
  createdAt?: number // custom only
  updatedAt?: number // custom only
}

// 内容抓取模式
export type ExtractionMode = "selector" | "readability" | "hybrid"

// Readability.js 解析结果
export interface ReadabilityResult {
  title: string | null
  content: string | null
  textContent: string | null
  length: number
  excerpt: string | null
  byline: string | null
  dir: string | null
  siteName: string | null
  lang: string | null
  publishedTime: string | null
}

// 抓取器选项
export interface ExtractorOptions {
  mode: ExtractionMode
  customSelectors?: Partial<Record<SelectorType, string>>
  readabilityConfig?: {
    charThreshold?: number
    keepClasses?: string[]
    debug?: boolean
  }
}

// ==================== 批量抓取相关类型 ====================

// 提取的链接
export interface ExtractedLink {
  url: string
  text: string
  index: number
}

// 选中的元素信息
export interface SelectedElementInfo {
  tagName: string
  className: string
  id: string
  linkCount: number
  outerHTML: string
  selector?: string // 用于定位元素的 CSS 选择器
}

// 批量抓取状态模式
export type BatchScrapeMode =
  | "idle"
  | "selecting"
  | "previewing"
  | "scraping"
  | "completed"
  | "error"

// 单页抓取状态
export type PageScrapeStatus =
  | "pending"
  | "fetching"
  | "extracting"
  | "success"
  | "failed"

// 抓取策略类型
export type ScrapeStrategyType = "fetch" | "background-tabs" | "current-tab"

// 单页抓取结果
export interface BatchScrapeResult {
  url: string
  success: boolean
  title: string
  content: string
  error?: string
  method: ScrapeStrategyType
}

// 批量抓取进度
export interface BatchProgress {
  total: number
  completed: number
  current: {
    url: string
    status: PageScrapeStatus
  } | null
  results: Array<{
    url: string
    status: "success" | "failed"
    title?: string
    error?: string
  }>
  startTime: number
  isPaused: boolean
}

// 批量抓取选项
export interface BatchScrapeOptions {
  concurrency: number
  timeout: number
  retryCount: number
  delayBetweenRequests: number
}

// 分页抓取选项
export interface PaginationOptions {
  maxPages: number
  delayBetweenPages: number
}

// 链接过滤选项
export interface LinkFilterOptions {
  sameDomainOnly: boolean
  excludeAnchors: boolean
  excludeJavaScript: boolean
  excludePatterns?: RegExp[]
}

// ZIP 导出选项
export interface ZipExportOptions {
  includeIndex: boolean
  filenameFormat: "title" | "url" | "index"
  maxFilenameLength: number
}

// 聚合内容结果
export interface AggregatedContent {
  toc: string
  content: string
  metadata: {
    totalPages: number
    successCount: number
    failedCount: number
    totalChars: number
    scrapedAt: string
  }
}

// 元素选择器消息类型
export interface ElementSelectorMessage extends Message {
  action:
    | "activateSelector"
    | "deactivateSelector"
    | "elementSelected"
    | "selectionCancelled"
  elementInfo?: SelectedElementInfo
  links?: ExtractedLink[]
  purpose?: ElementSelectorPurpose
  content?: ExtractedContent
}

// ==================== 内容提取相关类型 ====================

// 元素选择器用途
export type ElementSelectorPurpose =
  | "link-extraction"
  | "content-extraction"
  | "next-page-button"

// 下一页按钮信息
export interface NextPageButtonInfo {
  xpath: string
  text: string
  description?: string
}

// 内容输出格式
export type ContentOutputFormat = "html" | "markdown" | "text"

// 内容提取模式
export type ContentExtractionMode = "idle" | "selecting" | "extracted" | "error"

// 提取的内容
export interface ExtractedContent {
  html: string // element.outerHTML (完整)
  markdown: string // 转换后的 Markdown
  text: string // element.textContent
  elementInfo: SelectedElementInfo
}
