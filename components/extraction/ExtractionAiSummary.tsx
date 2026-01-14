import { memo, useMemo } from "react"

import type { ExtractedContent } from "~constants/types"
import type { TabInfo } from "~hooks/useContentExtraction"
import { createScrapedDataFromExtraction } from "~utils/content-extractor"

import AiSummaryPanel from "../ai/AiSummaryPanel"

interface ExtractionAiSummaryProps {
  content: ExtractedContent
  tabInfo: TabInfo
}

// 内容提取专用占位符
const extractionPlaceholders = [
  { placeholder: "{{content}}", description: "Markdown内容" },
  { placeholder: "{{cleanedContent}}", description: "纯文本内容" },
  { placeholder: "{{title}}", description: "页面标题" },
  { placeholder: "{{url}}", description: "页面URL" },
  { placeholder: "{{meta.extraction:tagName}}", description: "元素标签" },
  { placeholder: "{{meta.extraction:id}}", description: "元素ID" },
  { placeholder: "{{meta.extraction:class}}", description: "元素类名" }
]

const ExtractionAiSummary = memo(function ExtractionAiSummary({
  content,
  tabInfo
}: ExtractionAiSummaryProps) {
  // 转换数据格式
  const scrapedData = useMemo(
    () => createScrapedDataFromExtraction(content, tabInfo),
    [content, tabInfo]
  )

  return (
    <AiSummaryPanel
      content={content.markdown}
      scrapedData={scrapedData}
      placeholders={extractionPlaceholders}
      defaultOpen={false}
    />
  )
})

export default ExtractionAiSummary
