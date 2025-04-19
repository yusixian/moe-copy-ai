import { Icon } from "@iconify/react"
import { useCallback, useState } from "react"

import ContentDisplay from "~components/ContentDisplay"

// 摘要结果组件
export const SummaryResult = ({
  summary,
  streamingText,
  onCopy
}: {
  summary: string
  streamingText?: string
  onCopy: () => void
}) => {
  // 显示流式文本或完整摘要
  const displayText = summary || streamingText || ""
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (copied) return
    onCopy()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [onCopy])

  return (
    <div className="mt-4 rounded-xl border-2 border-dashed border-sky-200 bg-white p-4 shadow-sm transition-all hover:border-sky-300 hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center text-sm font-medium text-sky-600">
          <Icon
            icon="line-md:lightbulb-twotone"
            className="mr-1 text-amber-400"
            width="18"
            height="18"
          />
          摘要结果 (｡･ω･｡)
        </h3>
        <button
          onClick={handleCopy}
          className="flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-600 shadow-sm transition-all hover:bg-sky-200 hover:shadow">
          <Icon
            icon={copied ? "line-md:check-all" : "line-md:clipboard-arrow"}
            className="mr-1.5"
            width="14"
            height="14"
          />
          {copied ? "已复制 (●ˇ∀ˇ●)" : "复制摘要 (≧▽≦)"}
        </button>
      </div>
      <ContentDisplay content={displayText} isMarkdown isPreviewMode />
    </div>
  )
}
