import { Icon } from "@iconify/react"
import MarkdownIt from "markdown-it"
import { useEffect, useMemo, useRef } from "react"

import { Button } from "~/components/ui/button"
import { useI18n } from "~utils/i18n"

interface ContentDisplayProps {
  content: string
  isMarkdown: boolean
  isPreviewMode: boolean
  isEditable?: boolean
  isFullscreen?: boolean
  onContentChange?: (newContent: string) => void
}

/**
 * 内容显示组件，支持纯文本和Markdown渲染
 */
export const ContentDisplay: React.FC<ContentDisplayProps> = ({
  content,
  isMarkdown,
  isPreviewMode,
  isEditable = false,
  isFullscreen = false,
  onContentChange
}) => {
  const { t } = useI18n()
  // 文本区域引用
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 初始化 markdown-it 实例
  const md = useMemo(
    () =>
      new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
      }),
    []
  )

  // 处理文本格式，保留必要的换行
  const formatContent = (text: string): string => {
    if (!text) return ""

    // 保留段落间的空行（通常是连续两个换行）
    // 但移除过多的连续空行（3个以上的换行替换为2个）
    return text
      .replace(/\n{3,}/g, "\n\n") // 将3个以上连续换行替换为2个
      .replace(/\r\n/g, "\n") // 统一换行符
  }

  // 渲染 Markdown 内容
  const renderMarkdown = (text: string) => {
    // 在渲染前确保内容格式正确
    const formattedContent = formatContent(text)
    return { __html: md.render(formattedContent || "") }
  }

  // 处理内容变更
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onContentChange) {
      onContentChange(e.target.value)
    }
  }

  // 当切换到编辑模式时，自动聚焦文本区域
  useEffect(() => {
    if (isEditable && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditable])

  if (isMarkdown && isPreviewMode) {
    if (isFullscreen) {
      return (
        <div className="fixed inset-0 z-50 flex h-full w-full flex-col bg-content-solid">
          {/* 全屏模式顶部栏 */}
          <div className="flex items-center justify-between border-line-1 border-b bg-content-solid px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue-ghost">
                <svg
                  className="h-4 w-4 text-accent-blue"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-lg text-text-1">
                  {t("content.fullscreen.title")}
                </h2>
                <p className="text-text-3 text-xs">
                  {t("content.fullscreen.help")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                // 通过事件冒泡通知父组件退出全屏
                const event = new CustomEvent("exitFullscreen")
                document.dispatchEvent(event)
              }}>
              <Icon icon="mdi:close" className="mr-1.5 h-4 w-4" />
              {t("common.close")}
            </Button>
          </div>
          {/* 全屏内容区域 */}
          <div
            className="markdown-preview markdown-preview-fullscreen flex-1 overflow-auto bg-content-solid px-6 py-4"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown sanitizes output
            dangerouslySetInnerHTML={renderMarkdown(content)}
          />
        </div>
      )
    }

    return (
      <div
        className="markdown-preview"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdown sanitizes output
        dangerouslySetInnerHTML={renderMarkdown(content)}
      />
    )
  }

  if (isEditable) {
    return (
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        className="min-h-[300px] w-full resize-y rounded bg-transparent p-1 font-normal text-sm focus:outline-none focus:ring-1 focus:ring-sky-300"
        placeholder={t("content.placeholder")}
      />
    )
  }

  return (
    <pre className="whitespace-pre-wrap font-normal text-sm">{content}</pre>
  )
}

export default ContentDisplay
