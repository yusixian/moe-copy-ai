import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { logger } from "./logger"

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

// UUID生成函数
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 复制文本到剪贴板
 * @param text 要复制的文本
 * @returns Promise，成功时返回true，失败时抛出错误
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    logger.error("复制失败:", err)
    return false
  }
}

/**
 * 在新标签页中打开链接
 * @param url 要打开的URL
 * @param target 目标窗口，默认为_blank
 * @returns 返回window.open的结果（窗口引用或null）
 */
export const openInNewTab = (
  url: string,
  target: string = "_blank"
): Window | null => {
  return window.open(url, target)
}

/**
 * 阻止事件冒泡的辅助函数
 * @param callback 要执行的回调函数
 * @returns 一个新的事件处理函数，会阻止冒泡并执行原回调
 */
export const preventBubbling = <E extends React.SyntheticEvent>(
  callback: (e: E) => void
) => {
  return (e: E) => {
    e.stopPropagation()
    callback(e)
  }
}
