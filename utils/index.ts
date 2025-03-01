import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
