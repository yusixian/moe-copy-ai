import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"
import { memo, useEffect, useMemo, useState } from "react"

import { renderMarkdown } from "~/utils/markdown"
import { sanitizeHtmlForDisplay } from "~/utils/sanitize-html"
import { useI18n } from "~utils/i18n"

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
  const { t } = useI18n()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isViewSource, setIsViewSource] = useState(false)
  const { copy, copied } = useClipboard({ timeout: 2000 })

  // Render and sanitize HTML
  const sanitizedHtml = useMemo(() => {
    if (!content) return ""
    return sanitizeHtmlForDisplay(renderMarkdown(content))
  }, [content])

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
      <div className="fixed inset-0 z-50 flex flex-col bg-content-solid">
        {/* Header bar - compact design */}
        <div className="flex items-center justify-between border-line-1 border-b bg-content-solid px-3 py-2 shadow-sm">
          <span className="flex items-center gap-2 font-medium text-sm text-text-1">
            <Icon
              icon="line-md:lightbulb-twotone"
              className="h-4 w-4 text-amber-500"
            />
            {isViewSource
              ? t("content.preview.source")
              : t("content.preview.markdown")}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsViewSource(!isViewSource)}
              className="rounded p-1.5 text-text-3 hover:bg-content-alt"
              title={
                isViewSource
                  ? t("content.preview.markdown")
                  : t("content.preview.source")
              }>
              <Icon
                icon={isViewSource ? "mdi:eye" : "mdi:code-tags"}
                className="h-5 w-5"
              />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded p-1.5 text-text-3 hover:bg-content-alt"
              title={
                copied ? t("extraction.copy.copied") : t("extraction.copy.copy")
              }>
              <Icon
                icon={copied ? "mdi:check" : "mdi:content-copy"}
                className={`h-5 w-5 ${copied ? "text-success" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="rounded p-1.5 text-text-3 hover:bg-content-alt"
              title={t("content.fullscreen.help")}>
              <Icon icon="mdi:close" className="h-5 w-5" />
            </button>
          </div>
        </div>
        {/* Content area */}
        <div className="flex-1 overflow-auto bg-content-solid p-4">
          {isViewSource ? (
            <pre className="whitespace-pre-wrap rounded-lg bg-content-alt p-4 font-mono text-sm text-text-2">
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
        <span className="flex items-center gap-1 font-medium text-accent-blue text-xs">
          <Icon
            icon="line-md:lightbulb-twotone"
            width={14}
            className="text-amber-400"
          />
          {t("ai.panel.title")}
          {isStreaming && (
            <Icon icon="mdi:loading" width={12} className="ml-1 animate-spin" />
          )}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsViewSource(!isViewSource)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-text-3 text-xs hover:bg-content-alt"
            title={
              isViewSource
                ? t("content.preview.markdown")
                : t("content.preview.source")
            }>
            <Icon
              icon={isViewSource ? "mdi:eye" : "mdi:code-tags"}
              width={14}
            />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-text-3 text-xs hover:bg-content-alt"
            title={t("content.fullscreen.enter")}>
            <Icon icon="mdi:fullscreen" width={14} />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 rounded bg-accent-blue-ghost px-2 py-0.5 text-accent-blue text-xs hover:bg-accent-blue-ghost-hover">
            <Icon icon={copied ? "mdi:check" : "mdi:content-copy"} width={12} />
            {copied ? t("extraction.copy.copied") : t("extraction.copy.copy")}
          </button>
        </div>
      </div>
      {/* Content area - 400px max height */}
      <div className="max-h-[400px] overflow-y-auto text-sm text-text-2">
        {isViewSource ? (
          <pre className="whitespace-pre-wrap rounded bg-content-alt p-2 font-mono text-text-2 text-xs">
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
