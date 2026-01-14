import { memo } from "react"

import type { ScrapedContent } from "~constants/types"

import AiSummaryPanel from "./ai/AiSummaryPanel"

interface AiSummarySectionProps {
  content: string
  onSummaryGenerated?: (summary: string) => void
  scrapedData: ScrapedContent
}

// Popup 专用占位符
const popupPlaceholders = [
  { placeholder: "{{content}}", description: "文章内容" },
  { placeholder: "{{title}}", description: "文章标题" },
  { placeholder: "{{url}}", description: "文章URL" },
  { placeholder: "{{author}}", description: "作者" },
  { placeholder: "{{publishDate}}", description: "发布日期" },
  { placeholder: "{{cleanedContent}}", description: "清理后的内容" },
  { placeholder: "{{meta.xxx}}", description: "元数据中的字段" }
]

const AiSummarySection = memo(function AiSummarySection({
  content,
  onSummaryGenerated,
  scrapedData
}: AiSummarySectionProps) {
  return (
    <div className="mb-4">
      <AiSummaryPanel
        content={content}
        scrapedData={scrapedData}
        placeholders={popupPlaceholders}
        defaultOpen={false}
        showHistory={true}
        title="AI 助手"
        onSummaryGenerated={onSummaryGenerated}
      />
    </div>
  )
})

export default AiSummarySection
