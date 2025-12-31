import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"
import { encode } from "gpt-tokenizer"
import { memo, useMemo, useState } from "react"

import type { ContentOutputFormat, ExtractedContent } from "~constants/types"
import { cn } from "~utils"

import ContentDisplay from "../ContentDisplay"

interface ContentFormatTabsProps {
  content: ExtractedContent
  defaultFormat?: ContentOutputFormat
}

const formatTabs: { id: ContentOutputFormat; label: string; icon: string }[] = [
  { id: "html", label: "HTML", icon: "mdi:language-html5" },
  { id: "markdown", label: "Markdown", icon: "mdi:language-markdown" },
  { id: "text", label: "纯文本", icon: "mdi:text" }
]

const ContentFormatTabs = memo(function ContentFormatTabs({
  content,
  defaultFormat = "markdown"
}: ContentFormatTabsProps) {
  const [activeFormat, setActiveFormat] =
    useState<ContentOutputFormat>(defaultFormat)
  const [isPreviewMode, setIsPreviewMode] = useState(true)
  const { copy, copied } = useClipboard({ timeout: 2000 })

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
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {formatTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFormat(tab.id)}
              className={cn(
                "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeFormat === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}>
              <Icon icon={tab.icon} width={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Markdown 预览切换 */}
        {activeFormat === "markdown" && (
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-100">
            <Icon
              icon={isPreviewMode ? "mdi:code-tags" : "mdi:eye"}
              width={14}
            />
            {isPreviewMode ? "源码" : "预览"}
          </button>
        )}
      </div>

      {/* 内容显示区域 */}
      <div className="max-h-[400px] min-h-[200px] overflow-auto rounded-lg border border-gray-200 bg-white p-3">
        {activeFormat === "markdown" ? (
          <ContentDisplay
            content={currentContent}
            isMarkdown={true}
            isPreviewMode={isPreviewMode}
          />
        ) : activeFormat === "html" ? (
          <pre className="whitespace-pre-wrap break-all font-mono text-xs text-gray-700">
            {currentContent}
          </pre>
        ) : (
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {currentContent}
          </pre>
        )}
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {stats.chars.toLocaleString()} 字符 · {stats.words.toLocaleString()}{" "}
          词 · {stats.tokens.toLocaleString()} tokens
        </div>
        <button
          onClick={() => copy(currentContent)}
          className={cn(
            "flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            copied
              ? "bg-green-100 text-green-700"
              : "bg-sky-100 text-sky-700 hover:bg-sky-200"
          )}>
          <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} width={14} />
          {copied ? "已复制" : "复制"}
        </button>
      </div>
    </div>
  )
})

export default ContentFormatTabs
