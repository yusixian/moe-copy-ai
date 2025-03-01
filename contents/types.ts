// 图片信息接口
export interface ImageInfo {
  src: string
  alt: string
  title: string
  index: number
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
