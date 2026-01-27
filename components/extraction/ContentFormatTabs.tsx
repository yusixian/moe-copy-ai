import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"
import { encode } from "gpt-tokenizer"
import { memo, useMemo, useState } from "react"

import type { ContentOutputFormat, ExtractedContent } from "~constants/types"
import { cn } from "~utils"
import { getIntlLocale, useI18n } from "~utils/i18n"

import ContentDisplay from "../ContentDisplay"

interface ContentFormatTabsProps {
  content: ExtractedContent
  defaultFormat?: ContentOutputFormat
}

const ContentFormatTabs = memo(function ContentFormatTabs({
  content,
  defaultFormat = "markdown"
}: ContentFormatTabsProps) {
  const { t, locale } = useI18n()
  const intlLocale = getIntlLocale(locale)
  const [activeFormat, setActiveFormat] =
    useState<ContentOutputFormat>(defaultFormat)
  const [isPreviewMode, setIsPreviewMode] = useState(true)
  const { copy, copied } = useClipboard({ timeout: 2000 })

  // 格式选项
  const formatTabs = useMemo(
    () => [
      {
        id: "html" as ContentOutputFormat,
        label: t("extraction.format.html"),
        icon: "mdi:language-html5"
      },
      {
        id: "markdown" as ContentOutputFormat,
        label: t("extraction.format.markdown"),
        icon: "mdi:language-markdown"
      },
      {
        id: "text" as ContentOutputFormat,
        label: t("extraction.format.text"),
        icon: "mdi:text"
      }
    ],
    [t]
  )

  // 获取当前格式的内容
  const currentContent = useMemo(() => {
    switch (activeFormat) {
      case "html":
        return content.html
      case "markdown":
        return content.markdown
      case "text":
        return content.text
      default:
        return content.markdown
    }
  }, [activeFormat, content])

  // 获取内容统计
  const stats = useMemo(() => {
    const chars = currentContent.length
    const words = currentContent.split(/\s+/).filter(Boolean).length
    const tokens = encode(currentContent).length
    return { chars, words, tokens }
  }, [currentContent])

  return (
    <div className="flex flex-col gap-2">
      {/* Tab 切换 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-content-alt p-1">
          {formatTabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveFormat(tab.id)}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 font-medium text-xs transition-colors",
                activeFormat === tab.id
                  ? "bg-content-solid text-text-1 shadow-sm"
                  : "text-text-2 hover:text-text-1"
              )}>
              <Icon icon={tab.icon} width={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Markdown 预览切换 */}
        {activeFormat === "markdown" && (
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-text-3 text-xs hover:bg-content-alt">
            <Icon
              icon={isPreviewMode ? "mdi:code-tags" : "mdi:eye"}
              width={14}
            />
            {isPreviewMode
              ? t("extraction.format.source")
              : t("extraction.format.preview")}
          </button>
        )}
      </div>

      {/* 内容显示区域 */}
      <div className="max-h-[400px] min-h-[200px] overflow-auto rounded-lg border border-line-1 bg-content-solid p-3">
        {activeFormat === "markdown" ? (
          <ContentDisplay
            content={currentContent}
            isMarkdown={true}
            isPreviewMode={isPreviewMode}
          />
        ) : activeFormat === "html" ? (
          <pre className="whitespace-pre-wrap break-all font-mono text-text-2 text-xs">
            {currentContent}
          </pre>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-text-2">
            {currentContent}
          </pre>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="text-text-4 text-xs">
          {stats.chars.toLocaleString(intlLocale)} {t("extraction.stats.chars")}{" "}
          · {stats.words.toLocaleString(intlLocale)}{" "}
          {t("extraction.stats.words")} ·{" "}
          {stats.tokens.toLocaleString(intlLocale)}{" "}
          {t("extraction.stats.tokens")}
        </div>
        <button
          type="button"
          onClick={() => copy(currentContent)}
          className={cn(
            "flex items-center gap-1 rounded-md px-3 py-1.5 font-medium text-xs transition-colors",
            copied
              ? "bg-green-100 text-green-700"
              : "bg-sky-100 text-sky-700 hover:bg-sky-200"
          )}>
          <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} width={14} />
          {copied ? t("extraction.copy.copied") : t("extraction.copy.copy")}
        </button>
      </div>
    </div>
  )
})

export default ContentFormatTabs
