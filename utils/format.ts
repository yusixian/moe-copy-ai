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
