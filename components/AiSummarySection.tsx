import { memo, useMemo } from "react"

import type { ScrapedContent } from "~constants/types"
import { useI18n } from "~utils/i18n"

import AiSummaryPanel from "./ai/AiSummaryPanel"

interface AiSummarySectionProps {
  content: string
  onSummaryGenerated?: (summary: string) => void
  scrapedData: ScrapedContent
  enablePortal?: boolean
}

const AiSummarySection = memo(function AiSummarySection({
  content,
  onSummaryGenerated,
  scrapedData,
  enablePortal
}: AiSummarySectionProps) {
  const { t } = useI18n()

  // Popup 专用占位符
  const popupPlaceholders = useMemo(
    () => [
      {
        placeholder: "{{content}}",
        description: t("scrape.placeholders.content")
      },
      {
        placeholder: "{{title}}",
        description: t("scrape.placeholders.title")
      },
      { placeholder: "{{url}}", description: t("scrape.placeholders.url") },
      {
        placeholder: "{{author}}",
        description: t("scrape.placeholders.author")
      },
      {
        placeholder: "{{publishDate}}",
        description: t("scrape.placeholders.publishDate")
      },
      {
        placeholder: "{{cleanedContent}}",
        description: t("scrape.placeholders.cleanedContent")
      },
      {
        placeholder: "{{meta.xxx}}",
        description: t("scrape.placeholders.meta")
      }
    ],
    [t]
  )

  return (
    <div className="mb-4">
      <AiSummaryPanel
        content={content}
        scrapedData={scrapedData}
        placeholders={popupPlaceholders}
        defaultOpen={true}
        showHistory={true}
        title={t("ai.panel.title")}
        onSummaryGenerated={onSummaryGenerated}
        enablePortal={enablePortal}
      />
    </div>
  )
})

export default AiSummarySection
