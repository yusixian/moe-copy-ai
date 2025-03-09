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
  content: string
}

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
  [key: string]: any
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
