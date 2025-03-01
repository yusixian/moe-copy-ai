/**
 * 剪贴板和链接操作工具函数
 */

import { logger } from "~contents/utils"

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
 * 创建带有延迟重置的状态工具
 * 用于在操作后提供反馈，然后在一段时间后重置
 * @param setState 状态设置函数
 * @param resetValue 重置值
 * @param delayMs 延迟毫秒数，默认为2000ms
 * @returns 设置状态并自动重置的函数
 */
export const createTemporaryState = <T>(
  setState: (value: T) => void,
  resetValue: T,
  delayMs: number = 2000
) => {
  return (value: T) => {
    setState(value)
    setTimeout(() => setState(resetValue), delayMs)
  }
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
