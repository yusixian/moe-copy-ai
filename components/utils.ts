/**
 * 检测内容是否为 Markdown
 */
export const detectMarkdown = (content: string): boolean => {
  if (!content) return false

  // 常见的 Markdown 标记
  const markdownPatterns = [
    /^#+ .+$/m, // 标题
    /\[.+\]\(.+\)/, // 链接
    /!\[.+\]\(.+\)/, // 图片
    /^- .+$/m, // 无序列表
    /^[0-9]+\. .+$/m, // 有序列表
    /^>.+$/m, // 引用
    /`{1,3}[^`]+`{1,3}/, // 代码块或行内代码
    /^\s*```[\s\S]+?```\s*$/m, // 代码块
    /^\|(.+\|)+$/m, // 表格
    /^-{3,}$/m, // 水平线
    /\*\*.+\*\*/, // 粗体
    /\*.+\*/, // 斜体
    /~~.+~~/ // 删除线
  ]

  // 如果匹配到任意一个 Markdown 标记，则认为是 Markdown 内容
  return markdownPatterns.some((pattern) => pattern.test(content))
}

/**
 * 处理文本格式，保留必要的换行
 */
export const formatContent = (content: string): string => {
  if (!content) return ""

  // 保留段落间的空行（通常是连续两个换行）
  // 但移除过多的连续空行（3个以上的换行替换为2个）
  return content
    .replace(/\n{3,}/g, "\n\n") // 将3个以上连续换行替换为2个
    .replace(/\r\n/g, "\n") // 统一换行符
}

/**
 * 截断长文本显示
 */
export const truncateText = (text: string, maxLength = 300): string => {
  if (!text) return ""
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
}
