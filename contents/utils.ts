// 判断浏览器是否处于开发模式
export function isDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    !("update_url" in chrome.runtime.getManifest())
  )
}

// 增强的日志输出
export function debugLog(...args: any[]): void {
  if (isDevelopment()) {
    console.log("[网页抓取器]", ...args)
  }
}

// 从元素中获取属性或文本内容
export function getElementContent(
  element: Element,
  attributeName?: string
): string {
  if (!element) return ""

  if (attributeName) {
    return element.getAttribute(attributeName) || ""
  }

  return element.textContent?.trim() || ""
}

// 使用选择器获取元素内容
export function getContentBySelector(
  selector: string,
  attributeName?: string
): string {
  const element = document.querySelector(selector)
  if (!element) return ""

  return getElementContent(element, attributeName)
}

// 从选择器列表中获取第一个匹配的内容
export function getFirstMatchContent(
  selectors: string[],
  getContentFn: (el: Element) => string
): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) {
      const content = getContentFn(element)
      if (content) {
        debugLog(`从${selector}获取内容:`, content)
        return content
      }
    }
  }
  return ""
}
