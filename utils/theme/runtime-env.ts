/**
 * 运行时环境检测工具
 * 用于区分 content script 和 extension page 环境
 */

/**
 * 检测当前是否运行在 content script 环境
 *
 * Content scripts 运行在用户网页上下文，需要避免污染宿主页面
 * Extension pages 运行在 chrome-extension:// 协议
 *
 * @returns true 表示当前在 content script 环境
 */
export function isContentScript(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  // chrome-extension:// = extension page
  // http/https/file 等 = content script
  return !window.location.href.startsWith("chrome-extension://")
}

/**
 * 检测当前是否运行在扩展页面环境
 *
 * @returns true 表示当前在扩展页面环境（Popup/Options/Sidepanel）
 */
export function isExtensionPage(): boolean {
  return !isContentScript()
}
