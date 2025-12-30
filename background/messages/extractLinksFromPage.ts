import type { PlasmoMessaging } from "@plasmohq/messaging"

import type { ExtractedLink } from "~constants/types"
import { debugLog } from "~utils/logger"

export interface ExtractLinksRequest {
  tabId: number
  linkContainerSelector?: string
  sameDomainOnly?: boolean
}

export interface ExtractLinksResponse {
  success: boolean
  links?: ExtractedLink[]
  error?: string
}

/**
 * 从指定标签页提取链接
 */
const handler: PlasmoMessaging.MessageHandler<ExtractLinksRequest, ExtractLinksResponse> = async (req, res) => {
  const { tabId, linkContainerSelector, sameDomainOnly = false } = req.body || {}

  if (!tabId) {
    return res.send({ success: false, error: "tabId 不能为空" })
  }

  try {
    console.log(`[ExtractLinks] 从标签页 ${tabId} 提取链接, 选择器: ${linkContainerSelector}`)

    // 在目标标签页中执行脚本提取链接
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: (containerSelector: string | null, filterSameDomain: boolean) => {
        const currentUrl = window.location.href
        const currentDomain = new URL(currentUrl).hostname

        console.log(`[ExtractLinks] 当前页面: ${currentUrl}`)
        console.log(`[ExtractLinks] 页面所有链接数量: ${document.querySelectorAll('a[href]').length}`)

        // 获取容器元素
        let container: Element | null = null
        if (containerSelector) {
          console.log(`[ExtractLinks] ========== 选择器匹配 ==========`)
          console.log(`[ExtractLinks] 选择器: "${containerSelector}"`)

          try {
            const matched = document.querySelectorAll(containerSelector)
            console.log(`[ExtractLinks] 匹配结果: ${matched.length} 个元素`)

            if (matched.length === 1) {
              // 唯一匹配，直接使用
              container = matched[0]
              const linkCount = container.querySelectorAll('a[href]').length
              console.log(`[ExtractLinks] ✓ 唯一匹配: <${container.tagName.toLowerCase()}> → ${linkCount} 个链接`)
            } else if (matched.length > 1) {
              // 多个匹配，选择包含最多链接的元素
              console.log(`[ExtractLinks] ⚠️ 多个匹配，选择链接最多的容器:`)
              let maxLinks = 0
              let bestContainer: Element | null = null

              Array.from(matched).forEach((el, i) => {
                const linkCount = el.querySelectorAll('a[href]').length
                const classes = el.className ? `.${String(el.className).split(' ').slice(0, 2).join('.')}` : ''
                const id = el.id ? `#${el.id}` : ''
                console.log(`[ExtractLinks]   [${i}] <${el.tagName.toLowerCase()}${id}${classes}> → ${linkCount} 个链接`)

                if (linkCount > maxLinks) {
                  maxLinks = linkCount
                  bestContainer = el
                }
              })

              if (bestContainer && maxLinks > 0) {
                container = bestContainer
                console.log(`[ExtractLinks] ✓ 选中: 包含 ${maxLinks} 个链接的容器`)
              } else {
                console.log(`[ExtractLinks] ✗ 所有匹配元素都没有链接`)
              }
            } else {
              console.log(`[ExtractLinks] ✗ 选择器未匹配到任何元素`)
            }
          } catch (e) {
            console.log(`[ExtractLinks] ✗ 选择器语法错误: ${e}`)
          }
        }

        // 没有选择器时才使用整个 document
        const useDocument = !containerSelector
        console.log(`[ExtractLinks] 使用整个 document: ${useDocument}`)

        // 提取所有链接
        const links: { url: string; text: string; index: number }[] = []
        const seenUrls = new Set<string>()

        const processAnchor = (anchor: Element) => {
          const href = anchor.getAttribute('href')
          if (!href) return

          // 跳过锚点和 javascript
          if (href.startsWith('#') || href.startsWith('javascript:')) return

          // 解析完整 URL
          let fullUrl: string
          try {
            fullUrl = new URL(href, currentUrl).href
          } catch {
            return
          }

          // 去重
          if (seenUrls.has(fullUrl)) return
          seenUrls.add(fullUrl)

          // 同域名过滤
          if (filterSameDomain) {
            try {
              const linkDomain = new URL(fullUrl).hostname
              if (linkDomain !== currentDomain) return
            } catch {
              return
            }
          }

          const text = anchor.textContent?.trim() || fullUrl
          links.push({ url: fullUrl, text, index: links.length })
        }

        if (useDocument) {
          document.querySelectorAll('a[href]').forEach(processAnchor)
        } else if (container) {
          // 检查容器本身是否是链接
          if (container.tagName.toLowerCase() === 'a' && container.hasAttribute('href')) {
            processAnchor(container)
          }
          // 提取容器内的链接
          container.querySelectorAll('a[href]').forEach(processAnchor)
        }

        console.log(`[ExtractLinks] ========== 提取结果 ==========`)
        console.log(`[ExtractLinks] 共提取 ${links.length} 个唯一链接`)
        if (links.length > 0) {
          console.log(`[ExtractLinks] 前 3 个链接:`)
          links.slice(0, 3).forEach((l, i) => {
            console.log(`[ExtractLinks]   [${i}] ${l.text.slice(0, 30)}... → ${l.url.slice(0, 60)}...`)
          })
        }
        return links
      },
      args: [linkContainerSelector || null, sameDomainOnly],
    })

    const links = results[0]?.result || []
    console.log(`[ExtractLinks] 提取到 ${links.length} 个链接`)

    res.send({ success: true, links })
  } catch (error) {
    debugLog(`[ExtractLinks] 提取失败:`, error)
    res.send({
      success: false,
      error: error instanceof Error ? error.message : "提取链接失败",
    })
  }
}

export default handler
