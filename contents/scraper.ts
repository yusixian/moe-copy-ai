// 网页内容抓取器
import { Storage } from "@plasmohq/storage"

import type {
  ExtractionMode,
  ExtractorOptions,
  Message,
  SelectorType
} from "../constants/types"
import { scrapeWebpageContent } from "../utils/extractor"
import { debugLog } from "../utils/logger"
import { getExtractionMode, getReadabilityConfig } from "../utils/storage"

// 创建存储实例
const storage = new Storage({ area: "sync" })

// 抓取数据类型
interface CachedScrapeData {
  articleContent?: string
  cleanedContent?: string
  title?: string
  metadata: Record<string, string>
  success?: boolean
  error?: string
}

// 缓存抓取结果，避免重复抓取
let cachedScrapedData: CachedScrapeData | null = null
let cacheUrl: string = ""

// 在页面加载完成后，检查用户配置决定是否自动抓取
window.addEventListener("load", async () => {
  // 获取用户配置的抓取时机
  const scrapeTiming = (await storage.get<string>("scrape_timing")) || "auto"

  debugLog(`页面加载完成，抓取时机配置: ${scrapeTiming}`)

  // 如果配置为自动抓取，则执行抓取
  if (scrapeTiming === "auto") {
    debugLog("根据配置执行自动抓取")
    try {
      // 获取当前的抓取模式和配置
      const extractionMode = await getExtractionMode()

      const extractorOptions: ExtractorOptions = {
        mode: extractionMode,
        readabilityConfig: getReadabilityConfig()
      }

      const initialData = await scrapeWebpageContent(extractorOptions)
      debugLog("初始抓取结果:", initialData)

      // 缓存抓取结果
      cachedScrapedData = initialData
      cacheUrl = window.location.href
      debugLog(
        "已缓存自动抓取结果，内容长度:",
        initialData.articleContent?.length || 0
      )
    } catch (error) {
      debugLog("自动抓取过程中出错:", error)
    }
  } else {
    debugLog("根据配置跳过自动抓取，等待用户手动触发")
  }
})

// 测试选择器
function testSelector(selector: string) {
  debugLog(`测试选择器: ${selector}`)

  try {
    // 尝试查询选择器
    const elements = document.querySelectorAll(selector)
    const matches = elements.length

    debugLog(`选择器匹配到 ${matches} 个元素`)

    // 如果有匹配元素，获取第一个元素的内容
    let content = ""
    if (matches > 0) {
      const element = elements[0]

      // 根据元素类型获取内容
      if (element.tagName.toLowerCase() === "meta") {
        content = element.getAttribute("content") || ""
      } else if (element.tagName.toLowerCase() === "time") {
        content =
          element.getAttribute("datetime") || element.textContent?.trim() || ""
      } else {
        // 对于普通元素，获取文本内容
        content = element.textContent?.trim() || ""

        // 如果是大型内容容器，限制内容长度
        if (content.length > 1000) {
          content = `${content.substring(0, 1000)}...`
        }
      }

      debugLog(`获取到内容: ${content.substring(0, 100)}...`)
    }

    return {
      matches,
      content: content || undefined
    }
  } catch (error) {
    debugLog(`测试选择器时出错: ${error.message}`)
    return {
      matches: 0,
      error: error.message
    }
  }
}

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    debugLog("内容脚本收到消息:", message)

    if (message.action === "scrapeContent") {
      debugLog("收到抓取内容请求，开始执行抓取")

      // 获取抓取选项
      const customSelectors = message.customSelectors as
        | Partial<Record<SelectorType, string>>
        | undefined
      const mode = message.mode as ExtractionMode | undefined
      const readabilityConfig = message.readabilityConfig

      debugLog("抓取选项:", { customSelectors, mode, readabilityConfig })

      // 检查是否可以使用缓存结果
      const currentUrl = window.location.href
      const canUseCache =
        cachedScrapedData &&
        cacheUrl === currentUrl &&
        !customSelectors && // 没有自定义选择器
        (!mode || mode === cachedScrapedData.metadata["extraction:mode"]) // 模式匹配

      if (canUseCache) {
        debugLog("使用缓存的抓取结果，避免重复抓取")
        debugLog(
          "缓存结果内容长度:",
          cachedScrapedData.articleContent?.length || 0
        )
        sendResponse(cachedScrapedData)
        debugLog("已发送缓存结果")
        return true
      }

      debugLog("无法使用缓存，执行新的抓取")

      // 构建抓取器选项
      const buildExtractorOptions = async (): Promise<ExtractorOptions> => {
        // 如果消息中指定了模式，使用指定的模式；否则从存储中获取
        const extractionMode = mode || (await getExtractionMode())

        return {
          mode: extractionMode,
          customSelectors,
          readabilityConfig: getReadabilityConfig()
        }
      }

      // 执行异步抓取并返回结果
      buildExtractorOptions()
        .then((options) => {
          debugLog("使用抓取选项:", options)
          return scrapeWebpageContent(options)
        })
        .then((scrapedData) => {
          debugLog("抓取完成，准备发送响应")

          // 更新缓存
          if (!customSelectors) {
            cachedScrapedData = scrapedData
            cacheUrl = currentUrl
            debugLog("已更新缓存结果")
          }

          sendResponse(scrapedData)
          debugLog("响应已发送")
        })
        .catch((error) => {
          debugLog("抓取过程中出错:", error)
          sendResponse({
            success: false,
            error: error.message || "抓取内容时出错"
          })
        })

      // 返回true表示异步响应
      return true
    }

    // 处理测试选择器请求
    if (message.action === "testSelector" && message.selector) {
      debugLog("收到测试选择器请求")
      const result = testSelector(message.selector)
      sendResponse(result)
    }

    // 返回true表示异步响应
    return true
  }
)
