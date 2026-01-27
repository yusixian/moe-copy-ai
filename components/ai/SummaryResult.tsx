import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"

import { Button } from "~/components/ui/button"
import ContentDisplay from "~components/ContentDisplay"
import { useI18n } from "~utils/i18n"

// 摘要结果组件
export const SummaryResult = ({
  summary,
  streamingText
}: {
  summary: string
  streamingText?: string
}) => {
  const { t } = useI18n()
  // 显示流式文本或完整摘要
  const displayText = summary || streamingText || ""
  const { copy, copied } = useClipboard({ timeout: 2000 })

  const handleCopy = () => {
    if (!displayText) return
    copy(displayText)
  }

  return (
    <div className="mt-4 rounded-xl border-2 border-accent-blue/30 border-dashed bg-content-solid p-4 shadow-sm transition-all hover:border-accent-blue/50 hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center font-medium text-accent-blue text-sm">
          <Icon
            icon="line-md:lightbulb-twotone"
            className="mr-1 text-amber-400"
            width="18"
            height="18"
          />
          {t("ai.panel.title")}
        </h3>
        <Button variant="secondary" size="xs" onClick={handleCopy}>
          <Icon
            icon={copied ? "line-md:check-all" : "line-md:clipboard-arrow"}
            className="mr-1.5"
            width="14"
            height="14"
          />
          {copied ? t("extraction.copy.copied") : t("extraction.copy.copy")}
        </Button>
      </div>
      <ContentDisplay content={displayText} isMarkdown isPreviewMode />
    </div>
  )
}
