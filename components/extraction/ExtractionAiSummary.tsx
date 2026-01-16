import { memo, useMemo } from "react"

import type { ExtractedContent } from "~constants/types"
import type { TabInfo } from "~hooks/useContentExtraction"
import { createScrapedDataFromExtraction } from "~utils/content-extractor"
import { useI18n } from "~utils/i18n"

import AiSummaryPanel from "../ai/AiSummaryPanel"

interface ExtractionAiSummaryProps {
  content: ExtractedContent
  tabInfo: TabInfo
}

// 内容提取专用占位符 - 使用 t 函数生成
const getExtractionPlaceholders = (t: (key: string) => string) => [
  {
    placeholder: "{{content}}",
    description: t("extraction.ai.placeholder.content")
  },
  {
    placeholder: "{{cleanedContent}}",
    description: t("extraction.ai.placeholder.cleaned")
  },
  {
    placeholder: "{{title}}",
    description: t("extraction.ai.placeholder.title")
  },
  { placeholder: "{{url}}", description: t("extraction.ai.placeholder.url") },
  {
    placeholder: "{{meta.extraction:tagName}}",
    description: t("extraction.ai.placeholder.tagName")
  },
  {
    placeholder: "{{meta.extraction:id}}",
    description: t("extraction.ai.placeholder.id")
  },
  {
    placeholder: "{{meta.extraction:class}}",
    description: t("extraction.ai.placeholder.class")
  }
]

const ExtractionAiSummary = memo(function ExtractionAiSummary({
  content,
  tabInfo
}: ExtractionAiSummaryProps) {
  const { t } = useI18n()

  // 转换数据格式
  const scrapedData = useMemo(
    () => createScrapedDataFromExtraction(content, tabInfo),
    [content, tabInfo]
  )

  return (
    <AiSummaryPanel
      content={content.markdown}
      scrapedData={scrapedData}
      placeholders={getExtractionPlaceholders(t)}
      defaultOpen={false}
    />
  )
})

export default ExtractionAiSummary
