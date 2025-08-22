import MarkdownIt from "markdown-it"
import { useEffect, useMemo, useRef } from "react"

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
        <div className="fixed inset-0 z-[9999] flex h-full w-full flex-col bg-white">
          {/* 全屏模式顶部栏 */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100">
                <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Markdown 预览</h2>
                <p className="text-xs text-gray-500">按 ESC 或点击关闭按钮退出</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                // 通过事件冒泡通知父组件退出全屏
                const event = new CustomEvent('exitFullscreen')
                document.dispatchEvent(event)
              }}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              关闭
            </button>
          </div>
          {/* 全屏内容区域 */}
          <div
            className="flex-1 overflow-auto bg-white px-6 py-4 markdown-preview markdown-preview-fullscreen"
            dangerouslySetInnerHTML={renderMarkdown(content)}
          />
        </div>
      )
    }

    return (
      <div
        className="markdown-preview"
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
        className="min-h-[300px] w-full resize-y rounded bg-transparent p-1 text-sm font-normal focus:outline-none focus:ring-1 focus:ring-sky-300"
        placeholder="在此输入或粘贴内容..."
        autoFocus
      />
    )
  }

  return (
    <pre className="whitespace-pre-wrap text-sm font-normal">{content}</pre>
  )
}

export default ContentDisplay
