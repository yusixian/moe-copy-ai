import type { ExtractedLink, LinkFilterOptions, SelectedElementInfo } from '~constants/types'

import { debugLog } from './logger'
import { generateUniqueSelector } from './selector-generator'

/**
 * 从 DOM 元素中提取所有链接
 */
export function extractLinksFromElement(element: Element): ExtractedLink[] {
  const links: ExtractedLink[] = []
  let index = 0

  // 检查元素本身是否是 <a> 标签
  if (element.tagName.toLowerCase() === 'a' && element.hasAttribute('href')) {
    const href = element.getAttribute('href')
    if (href) {
      links.push({
        url: href,
        text: element.textContent?.trim() || href,
        index: index++,
      })
    }
  }

  // 搜索子孙元素中的链接
  const anchors = element.querySelectorAll('a[href]')
  anchors.forEach((anchor) => {
    const href = anchor.getAttribute('href')
    if (href) {
      links.push({
        url: href,
        text: anchor.textContent?.trim() || href,
        index: index++,
      })
    }
  })

  return links
}

/**
 * 获取选中元素的信息
 */
export function getElementInfo(element: Element): SelectedElementInfo {
  const isAnchor = element.tagName.toLowerCase() === 'a' && element.hasAttribute('href')
  const descendantAnchors = element.querySelectorAll('a[href]')
  const linkCount = descendantAnchors.length + (isAnchor ? 1 : 0)

  // 生成选择器（使用 selector-generator 中的函数）
  let selector = ''
  try {
    selector = generateUniqueSelector(element, { allowMultiple: true })
  } catch (err) {
    debugLog('[LinkExtractor] 生成选择器失败:', err)
    selector = element.tagName.toLowerCase()
  }

  debugLog('[LinkExtractor] 链接容器选择器:', selector)

  return {
    tagName: element.tagName.toLowerCase(),
    className: element.className || '',
    id: element.id || '',
    linkCount,
    outerHTML: element.outerHTML.substring(0, 500), // 限制长度
    selector,
  }
}

/**
 * 解析相对 URL 为绝对 URL
 */
export function resolveUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href
  } catch {
    return url
  }
}

/**
 * 检查 URL 是否为同域
 */
export function isSameDomain(url: string, baseUrl: string): boolean {
  try {
    const urlObj = new URL(url, baseUrl)
    const baseObj = new URL(baseUrl)
    return urlObj.hostname === baseObj.hostname
  } catch {
    return false
  }
}

/**
 * 检查是否为有效的可抓取 URL
 */
export function isValidScrapableUrl(url: string): boolean {
  // 排除 JavaScript 链接
  if (url.startsWith('javascript:')) {
    return false
  }

  // 排除纯锚点链接
  if (url.startsWith('#')) {
    return false
  }

  // 排除 mailto 和 tel 链接
  if (url.startsWith('mailto:') || url.startsWith('tel:')) {
    return false
  }

  // 排除 data: URL
  if (url.startsWith('data:')) {
    return false
  }

  return true
}

/**
 * 过滤链接
 */
export function filterLinks(
  links: ExtractedLink[],
  baseUrl: string,
  options: LinkFilterOptions
): ExtractedLink[] {
  return links.filter((link) => {
    // 解析为绝对 URL
    const absoluteUrl = resolveUrl(link.url, baseUrl)

    // 检查是否为有效 URL
    if (!isValidScrapableUrl(link.url)) {
      return false
    }

    // 排除纯锚点
    if (options.excludeAnchors) {
      try {
        const urlObj = new URL(absoluteUrl)
        const baseObj = new URL(baseUrl)
        // 如果只有 hash 不同，则排除
        if (
          urlObj.origin === baseObj.origin &&
          urlObj.pathname === baseObj.pathname &&
          urlObj.search === baseObj.search &&
          urlObj.hash !== baseObj.hash
        ) {
          return false
        }
      } catch {
        // URL 解析失败，保留
      }
    }

    // 检查是否同域
    if (options.sameDomainOnly && !isSameDomain(absoluteUrl, baseUrl)) {
      return false
    }

    // 排除 JavaScript 链接
    if (options.excludeJavaScript && link.url.startsWith('javascript:')) {
      return false
    }

    // 自定义排除模式
    if (options.excludePatterns) {
      for (const pattern of options.excludePatterns) {
        if (pattern.test(absoluteUrl)) {
          return false
        }
      }
    }

    return true
  })
}

/**
 * 去重链接（基于 URL）
 */
export function deduplicateLinks(links: ExtractedLink[], baseUrl: string): ExtractedLink[] {
  const seen = new Set<string>()
  const result: ExtractedLink[] = []

  for (const link of links) {
    const absoluteUrl = resolveUrl(link.url, baseUrl)
    // 移除 hash 部分进行去重
    let normalizedUrl: string
    try {
      const urlObj = new URL(absoluteUrl)
      urlObj.hash = ''
      normalizedUrl = urlObj.href
    } catch {
      normalizedUrl = absoluteUrl
    }

    if (!seen.has(normalizedUrl)) {
      seen.add(normalizedUrl)
      result.push({
        ...link,
        url: absoluteUrl, // 使用绝对 URL
      })
    }
  }

  return result
}

/**
 * 完整的链接提取和处理流程
 */
export function extractAndProcessLinks(
  element: Element,
  baseUrl: string,
  filterOptions: LinkFilterOptions = {
    sameDomainOnly: true,
    excludeAnchors: true,
    excludeJavaScript: true,
  }
): ExtractedLink[] {
  // 1. 提取所有链接
  const rawLinks = extractLinksFromElement(element)

  // 2. 过滤链接
  const filteredLinks = filterLinks(rawLinks, baseUrl, filterOptions)

  // 3. 去重
  const uniqueLinks = deduplicateLinks(filteredLinks, baseUrl)

  // 4. 重新编号
  return uniqueLinks.map((link, index) => ({
    ...link,
    index,
  }))
}

/**
 * 默认过滤选项
 */
export const DEFAULT_FILTER_OPTIONS: LinkFilterOptions = {
  sameDomainOnly: false,
  excludeAnchors: true,
  excludeJavaScript: true,
}
