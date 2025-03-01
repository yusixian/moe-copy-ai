import MarkdownIt from "markdown-it"
import { useEffect, useMemo, useRef } from "react"

interface ContentDisplayProps {
  content: string
  isMarkdown: boolean
  isPreviewMode: boolean
  isEditable?: boolean
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
