import type { ScrapedContent } from "~contents/types"

// 定义响应类型
export interface ScrapeResponse {
  success: boolean
  data?: ScrapedContent
  error?: string
}

// 图片组件属性
export interface ImageDisplayProps {
  src: string
  alt: string
  title?: string
  className?: string
  onLoadError?: (src: string) => void
}

// 内容显示组件属性
export interface ContentDisplayProps {
  content: string
  isMarkdown: boolean
  isPreviewMode: boolean
}

export interface ContentSectionProps {
  articleContent: string
  cleanedContent: string
  isMarkdown: boolean
}

// 元数据图片组件属性
export interface MetadataImageProps {
  src: string
  alt: string
  label: string
  onLoadError?: (label: string) => void
}

// 元数据表格组件属性
export interface MetadataTableProps {
  metadata: Record<string, string>
  truncateText: (text: string, maxLength?: number) => string
  onLoadError?: (key: string) => void
}
