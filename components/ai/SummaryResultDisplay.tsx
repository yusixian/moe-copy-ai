import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"
import MarkdownIt from "markdown-it"
import { memo, useEffect, useMemo, useState } from "react"

import { sanitizeHtmlForDisplay } from "~/utils/sanitize-html"

interface SummaryResultDisplayProps {
  content: string
  isStreaming?: boolean
  className?: string
}

/**
 * Summary result display component with fullscreen, view source, and safe HTML rendering
 */
export const SummaryResultDisplay = memo(function SummaryResultDisplay({
  content,
  isStreaming = false,
  className
}: SummaryResultDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isViewSource, setIsViewSource] = useState(false)
  const { copy, copied } = useClipboard({ timeout: 2000 })

  // Initialize markdown-it instance
  const md = useMemo(
    () =>
      new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
      }),
    []
  )

  // Render and sanitize HTML
  const sanitizedHtml = useMemo(() => {
    if (!content) return ""
    const html = md.render(content)
    return sanitizeHtmlForDisplay(html)
  }, [content, md])

  // ESC key handler for fullscreen
  useEffect(() => {
    if (!isFullscreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  const handleCopy = () => {
    copy(content)
  }

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        {/* Header bar - compact design */}
        <div className="flex items-center justify-between border-gray-200 border-b bg-white px-3 py-2 shadow-sm">
          <span className="flex items-center gap-2 font-medium text-gray-700 text-sm">
            <Icon
              icon="line-md:lightbulb-twotone"
              className="h-4 w-4 text-amber-500"
            />
            {isViewSource ? "源码" : "预览"}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsViewSource(!isViewSource)}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
              title={isViewSource ? "预览" : "查看源码"}>
              <Icon
                icon={isViewSource ? "mdi:eye" : "mdi:code-tags"}
                className="h-5 w-5"
              />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
              title={copied ? "已复制" : "复制"}>
              <Icon
                icon={copied ? "mdi:check" : "mdi:content-copy"}
                className={`h-5 w-5 ${copied ? "text-green-500" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
              title="关闭 (ESC)">
              <Icon icon="mdi:close" className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Content area */}
        <div className="flex-1 overflow-auto bg-white p-4">
          {isViewSource ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 font-mono text-gray-700 text-sm">
              {content}
            </pre>
          ) : (
            <div
              className="markdown-preview"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized with DOMPurify
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          )}
        </div>
      </div>
    )
  }

  // Normal mode
  return (
    <div className={className}>
      {/* Header with buttons */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1 font-medium text-sky-700 text-xs">
          <Icon
            icon="line-md:lightbulb-twotone"
            width={14}
            className="text-amber-400"
          />
          摘要结果
          {isStreaming && (
            <Icon icon="mdi:loading" width={12} className="ml-1 animate-spin" />
          )}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsViewSource(!isViewSource)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-gray-500 text-xs hover:bg-gray-100"
            title={isViewSource ? "预览" : "查看源码"}>
            <Icon
              icon={isViewSource ? "mdi:eye" : "mdi:code-tags"}
              width={14}
            />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-gray-500 text-xs hover:bg-gray-100"
            title="全屏">
            <Icon icon="mdi:fullscreen" width={14} />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded bg-sky-100 px-2 py-0.5 text-sky-600 text-xs hover:bg-sky-200">
            <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} width={12} />
            {copied ? "已复制" : "复制"}
          </button>
        </div>
      </div>
      {/* Content area - 400px max height */}
      <div className="max-h-[400px] overflow-y-auto text-gray-700 text-sm">
        {isViewSource ? (
          <pre className="whitespace-pre-wrap rounded bg-gray-50 p-2 font-mono text-gray-700 text-xs">
            {content}
          </pre>
        ) : (
          <div
            className="markdown-preview"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized with DOMPurify
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        )}
      </div>
    </div>
  )
})

export default SummaryResultDisplay
