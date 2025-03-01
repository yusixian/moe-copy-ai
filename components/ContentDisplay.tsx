import MarkdownIt from "markdown-it"
import { useMemo } from "react"

import type { ContentDisplayProps } from "./types"

/**
 * 内容显示组件，支持纯文本和Markdown渲染
 */
export const ContentDisplay: React.FC<ContentDisplayProps> = ({
  content,
  isMarkdown,
  isPreviewMode
}) => {
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

  if (isMarkdown && isPreviewMode) {
    return (
      <div
        className="markdown-preview"
        dangerouslySetInnerHTML={renderMarkdown(content)}
      />
    )
  }

  return (
    <pre className="whitespace-pre-wrap text-sm font-normal">{content}</pre>
  )
}

export default ContentDisplay
