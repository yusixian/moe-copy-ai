// 网页内容抓取器
import type { PlasmoCSConfig } from "plasmo"

// 指定内容脚本应该运行的页面
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// 判断浏览器是否处于开发模式
function isDevelopment() {
  return (
    process.env.NODE_ENV === "development" ||
    !("update_url" in chrome.runtime.getManifest())
  )
}

// 增强的日志输出
function debugLog(...args) {
  if (isDevelopment()) {
    console.log("[网页抓取器]", ...args)
  }
}

// 辅助函数：从HTML元素中提取格式化的文本
function extractFormattedText(element, imagesArray = []) {
  let result = ""
  let imageIndex = 0

  // 递归遍历节点
  function traverse(node) {
    // 如果是文本节点
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim()
      if (text) {
        result += text + " "
      }
      return
    }

    // 如果是元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.nodeName.toLowerCase()

      // 跳过不需要的元素
      if (
        [
          "script",
          "style",
          "noscript",
          "iframe",
          "nav",
          "footer",
          "header",
          "aside",
          "form",
          "button",
          "input"
        ].includes(tagName)
      ) {
        return
      }

      // 处理图片元素
      if (tagName === "img") {
        const src = node.getAttribute("src")
        const alt = node.getAttribute("alt") || ""
        const title = node.getAttribute("title") || ""

        if (src && src.trim() && !src.startsWith("data:image/")) {
          // 将图片信息存储到数组中
          const imageInfo = {
            src: src,
            alt: alt,
            title: title,
            index: imageIndex
          }

          imagesArray.push(imageInfo)

          // 在文本中插入图片引用标记，使用Markdown格式
          result += `\n\n![${alt || "图片#" + imageIndex}](${src})\n\n`
          imageIndex++
        }
        return
      }

      // 针对特定标签进行特殊处理
      if (
        tagName === "h1" ||
        tagName === "h2" ||
        tagName === "h3" ||
        tagName === "h4" ||
        tagName === "h5" ||
        tagName === "h6"
      ) {
        // 将标题转换为Markdown格式的标题
        const level = parseInt(tagName.substring(1))
        const headingMd = "#".repeat(level)
        result += `\n\n${headingMd} ${node.textContent.trim()}\n\n`
      } else if (tagName === "p") {
        // 段落处理
        const text = node.textContent.trim()
        if (text) {
          result += "\n\n" + text + "\n"
        }
      } else if (tagName === "blockquote") {
        // 引用处理
        result += "\n\n> " + node.textContent.trim() + "\n\n"
      } else if (tagName === "li") {
        // 列表项处理
        result += "\n- " + node.textContent.trim()
      } else if (tagName === "br") {
        // 换行处理
        result += "\n"
      } else if (
        tagName === "div" ||
        tagName === "section" ||
        tagName === "article"
      ) {
        // 对于容器元素，递归处理其子节点
        for (const child of node.childNodes) {
          traverse(child)
        }
        return // 已经处理完子节点，直接返回
      } else if (tagName === "pre" || tagName === "code") {
        // 代码块处理
        result += "\n\n```\n" + node.textContent.trim() + "\n```\n\n"
      } else if (tagName === "table") {
        // 表格处理 - 以Markdown格式输出表格
        const rows = node.querySelectorAll("tr")
        if (rows.length > 0) {
          result += "\n\n"

          // 添加表头
          const headerRow = rows[0]
          const headerCells = headerRow.querySelectorAll("th, td")
          let headerText = "|"
          let separatorRow = "|"

          headerCells.forEach(() => {
            headerText += " --- |"
          })

          rows.forEach((row, rowIndex) => {
            const cells = row.querySelectorAll("th, td")
            let rowText = "|"
            cells.forEach((cell) => {
              rowText += ` ${cell.textContent.trim()} |`
            })

            // 添加行
            result += rowText + "\n"

            // 在第一行后添加分隔符
            if (rowIndex === 0) {
              headerCells.forEach(() => {
                separatorRow += " --- |"
              })
              result += separatorRow + "\n"
            }
          })
          result += "\n"
        } else {
          // 退化为简单文本表示
          result += "\n\n表格内容:\n"
          rows.forEach((row) => {
            const cells = row.querySelectorAll("th, td")
            let rowText = ""
            cells.forEach((cell) => {
              rowText += cell.textContent.trim() + " | "
            })
            if (rowText) {
              result += rowText.slice(0, -3) + "\n" // 移除最后一个 " | "
            }
          })
          result += "\n\n"
        }
      } else if (tagName === "a") {
        // 链接处理
        const href = node.getAttribute("href")
        const text = node.textContent.trim()
        if (text) {
          if (
            href &&
            !href.startsWith("#") &&
            !href.startsWith("javascript:")
          ) {
            result += `[${text}](${href}) `
          } else {
            result += text + " "
          }
        }
      } else if (tagName === "strong" || tagName === "b") {
        // 加粗文本
        const text = node.textContent.trim()
        if (text) {
          result += `**${text}** `
        }
      } else if (tagName === "em" || tagName === "i") {
        // 斜体文本
        const text = node.textContent.trim()
        if (text) {
          result += `*${text}* `
        }
      } else {
        // 处理其他标签的子节点
        for (const child of node.childNodes) {
          traverse(child)
        }
      }
    }
  }

  traverse(element)

  // 清理结果：规范化空白和换行
  return result
    .trim()
    .replace(/[ \t]+/g, " ") // 仅替换连续的空格和制表符为单个空格，保留换行
    .replace(/\n\s+/g, "\n") // 删除换行后的前导空格
    .replace(/\n{4,}/g, "\n\n\n") // 将四个或以上连续换行替换为三个换行
    .replace(/\s+\./g, ".") // 修复句号前的空格
    .replace(/\s+,/g, ",") // 修复逗号前的空格
}

// 清理内容，移除无用空格和空行的函数
function cleanContent(content) {
  if (!content) return ""

  // 临时存储代码块
  const codeBlocks = []
  let tempContent = content

  // 提取并保存代码块
  const codeBlockRegex = /```[\s\S]*?```/g
  let match
  let index = 0

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const placeholder = `__CODE_BLOCK_${index}__`
    tempContent = tempContent.replace(match[0], placeholder)
    codeBlocks.push(match[0])
    index++
  }

  // 清理非代码块部分
  tempContent = tempContent
    .replace(/\n+/g, " ") // 将所有换行替换为空格
    .replace(/[ \t]+/g, " ") // 替换连续空格为单个空格
    .replace(/^\s+|\s+$/g, "") // 移除开头和结尾的空白
    .replace(/\s+([.,;:!?])/g, "$1") // 修复标点符号(句号、逗号、分号、冒号、感叹号、问号)前的空格
    .replace(/\s*-\s*/g, "-") // 修复破折号周围的空格
    .replace(/\(\s+|\s+\)/g, (m) => m.replace(/\s+/g, "")) // 修复圆括号前后的空格
    .replace(/\s+"|"\s+/g, '"') // 修复引号前后的空格
    .replace(/\s*\[\s*|\s*\]\s*/g, (m) => m.replace(/\s+/g, "")) // 修复方括号内外的空格
    .replace(/\s*\{\s*|\s*\}\s*/g, (m) => m.replace(/\s+/g, "")) // 修复花括号内外的空格
    .replace(/([.!?:;]) +/g, "$1 ") // 确保标点符号后只有一个空格

  // 保留Markdown标题格式
  tempContent = tempContent.replace(/# +/g, "# ")
  tempContent = tempContent.replace(/## +/g, "## ")
  tempContent = tempContent.replace(/### +/g, "### ")
  tempContent = tempContent.replace(/#### +/g, "#### ")
  tempContent = tempContent.replace(/##### +/g, "##### ")
  tempContent = tempContent.replace(/###### +/g, "###### ")

  // 恢复代码块
  for (let i = 0; i < codeBlocks.length; i++) {
    tempContent = tempContent.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i])
  }

  return tempContent
}

// 增强抓取文章内容的函数
function extractArticleContent(imagesArray = []) {
  // 首先检查是否有article标签
  const articleElements = document.querySelectorAll("article")
  if (articleElements.length > 0) {
    debugLog(`找到了 ${articleElements.length} 个article标签`)

    // 如果有多个article元素，选择最长的那个
    let longestArticle = articleElements[0]
    let maxLength = articleElements[0].textContent.length

    articleElements.forEach((article, index) => {
      debugLog(`article [${index}] 内容长度: ${article.textContent.length}`)
      if (article.textContent.length > maxLength) {
        longestArticle = article
        maxLength = article.textContent.length
      }
    })

    debugLog("使用最长的article元素, 长度:", maxLength)
    return extractFormattedText(longestArticle, imagesArray)
  }

  // 如果没有article标签，尝试其他常见内容容器
  const contentSelectors = [
    "main",
    "#content",
    ".content",
    "#main",
    ".main",
    ".post-content",
    ".entry-content",
    ".article-content",
    ".story-body",
    '[itemprop="articleBody"]',
    ".post-body",
    ".entry",
    ".blog-post",
    "#article-body"
  ]

  for (const selector of contentSelectors) {
    const contentEl = document.querySelector(selector)
    if (contentEl) {
      debugLog(`找到内容容器: ${selector}`)
      return extractFormattedText(contentEl, imagesArray)
    }
  }

  // 如果仍然没有找到内容，尝试查找带有大量文本的段落集合
  const paragraphs = document.querySelectorAll("p")
  if (paragraphs.length > 3) {
    // 如果有至少3个段落，可能是文章的主体
    debugLog(`使用段落集合: ${paragraphs.length} 个段落`)
    const contentArray = Array.from(paragraphs)
      .filter((p) => p.textContent.trim().length > 30) // 筛选出较长的段落
      .map((p) => p.textContent.trim())

    if (contentArray.length > 0) {
      return contentArray.join("\n\n")
    }
  }

  // 最后的fallback：尝试获取body中的主要文本内容
  debugLog("未找到明确的内容区域，尝试提取body内容")
  return extractFormattedText(document.body, imagesArray)
}

// 抓取网页内容的主函数
function scrapeWebpageContent() {
  debugLog("开始抓取网页内容")

  // 创建一个对象存储抓取的内容
  const scrapedContent = {
    title: document.title || "无标题",
    url: window.location.href,
    articleContent: "",
    cleanedContent: "", // 添加清洁版内容字段
    author: "",
    publishDate: "",
    metadata: {},
    images: [] // 添加图片数组
  }

  // 抓取标题 (除了document.title还可能有h1或特定meta标签)
  const headingEl = document.querySelector("h1")
  if (headingEl) {
    scrapedContent.title = headingEl.textContent.trim()
    debugLog("从h1标签获取标题:", scrapedContent.title)
  }

  // 检查是否有更精确的标题元素
  const titleMetaTags = [
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
    'meta[name="title"]'
  ]

  for (const selector of titleMetaTags) {
    const metaTitle = document.querySelector(selector)
    if (metaTitle) {
      const content = metaTitle.getAttribute("content")
      if (content && content.trim()) {
        scrapedContent.title = content.trim()
        debugLog(`从${selector}获取标题:`, scrapedContent.title)
        break
      }
    }
  }

  // 抓取作者信息
  const possibleAuthorSelectors = [
    'meta[name="author"]',
    'meta[property="article:author"]',
    'meta[property="og:author"]',
    'a[rel="author"]',
    ".author",
    ".byline",
    ".writer",
    ".by-line",
    '[itemprop="author"]',
    '[class*="author"]',
    '[class*="byline"]',
    'span[class*="author"]',
    ".post-meta a", // 常见的博客作者链接
    'address[class*="author"]',
    ".entry-meta .author"
  ]

  for (const selector of possibleAuthorSelectors) {
    const authorEl = document.querySelector(selector)
    if (authorEl) {
      if (authorEl.tagName.toLowerCase() === "meta") {
        scrapedContent.author = authorEl.getAttribute("content")
      } else {
        scrapedContent.author = authorEl.textContent.trim()
      }
      if (scrapedContent.author) {
        debugLog(`从${selector}获取作者:`, scrapedContent.author)
        break
      }
    }
  }

  // 抓取发布日期
  const possibleDateSelectors = [
    'meta[property="article:published_time"]',
    'meta[property="og:published_time"]',
    'meta[name="date"]',
    "time[datetime]",
    "time[pubdate]",
    '[itemprop="datePublished"]',
    ".published-date",
    ".post-date",
    ".entry-date",
    '[class*="publish"]',
    '[class*="date"]'
  ]

  for (const selector of possibleDateSelectors) {
    const dateEl = document.querySelector(selector)
    if (dateEl) {
      if (dateEl.tagName.toLowerCase() === "meta") {
        scrapedContent.publishDate = dateEl.getAttribute("content")
      } else if (dateEl.tagName.toLowerCase() === "time") {
        scrapedContent.publishDate =
          dateEl.getAttribute("datetime") || dateEl.textContent.trim()
      } else {
        scrapedContent.publishDate = dateEl.textContent.trim()
      }
      if (scrapedContent.publishDate) {
        debugLog(`从${selector}获取发布日期:`, scrapedContent.publishDate)
        break
      }
    }
  }

  // 使用增强的函数抓取文章内容
  debugLog("开始抓取文章内容")
  scrapedContent.articleContent = extractArticleContent(scrapedContent.images)
  // 生成清洁版内容
  scrapedContent.cleanedContent = cleanContent(scrapedContent.articleContent)
  debugLog("文章内容抓取完成，长度:", scrapedContent.articleContent.length)
  debugLog("清洁版内容生成完成，长度:", scrapedContent.cleanedContent.length)
  debugLog("图片抓取完成，数量:", scrapedContent.images.length)

  // 抓取元数据
  const metaTags = document.querySelectorAll("meta")
  let metaCount = 0
  metaTags.forEach((meta) => {
    const name = meta.getAttribute("name") || meta.getAttribute("property")
    const content = meta.getAttribute("content")
    if (name && content) {
      scrapedContent.metadata[name] = content
      metaCount++
    }
  })
  debugLog(`抓取了 ${metaCount} 个元数据标签`)

  // 将结果输出到控制台
  debugLog("抓取完成，结果概览:", {
    title: scrapedContent.title,
    url: scrapedContent.url,
    author: scrapedContent.author,
    publishDate: scrapedContent.publishDate,
    contentLength: scrapedContent.articleContent.length,
    cleanedContentLength: scrapedContent.cleanedContent.length,
    metadataCount: Object.keys(scrapedContent.metadata).length,
    imageCount: scrapedContent.images.length
  })

  // 返回结果以便发送到popup
  return scrapedContent
}

// 在页面加载完成后执行一次抓取，并在控制台输出结果
window.addEventListener("load", () => {
  debugLog("页面加载完成，执行初始抓取")
  const initialData = scrapeWebpageContent()
  debugLog("初始抓取结果:", initialData)
})

// 监听来自后台脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debugLog("内容脚本收到消息:", message)

  if (message.action === "scrapeContent") {
    debugLog("收到抓取内容请求，开始执行抓取")
    // 执行抓取并返回结果
    const scrapedData = scrapeWebpageContent()
    debugLog("抓取完成，准备发送响应")
    sendResponse(scrapedData)
    debugLog("响应已发送")
  }

  // 返回true表示异步响应
  return true
})
