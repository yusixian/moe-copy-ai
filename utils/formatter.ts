import { IMAGE_SRC_ATTRIBUTES, SKIP_TAGS } from "../constants/config"
import type { ImageInfo } from "../constants/types"
import { debugLog } from "./logger"

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

// 从HTML元素中提取格式化的文本
export function extractFormattedText(
  element: Element,
  imagesArray: ImageInfo[] = []
): string {
  let result = ""
  let imageIndex = 0

  // 创建日志跟踪对象 - 用于收集图片处理数据
  const processingSummary = {
    figureElements: 0,
    figureImagesExtracted: 0,
    figureImagesSkipped: 0,
    imgElements: 0,
    imgExtracted: 0,
    imgSkipped: 0,
    anchorImages: 0,
    fancyboxImages: 0,
    totalProcessed: 0,
    totalExtracted: 0,
    totalSkipped: 0
  }

  debugLog("开始提取格式化文本和图片内容")

  // 递归遍历节点
  function traverse(node: Node): void {
    // 如果是文本节点
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || ""
      if (text) {
        result += `${text} `
      }
      return
    }

    // 如果是元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = (node as Element).nodeName.toLowerCase()

      // 跳过不需要的元素
      if (SKIP_TAGS.includes(tagName)) {
        return
      }

      // 处理figure元素（可能包含图片和说明）
      if (tagName === "figure") {
        processingSummary.figureElements++

        const figureElement = node as Element
        const imgElement = figureElement.querySelector("img")
        const figCaption = figureElement.querySelector("figcaption")

        if (imgElement) {
          processingSummary.totalProcessed++

          // 提取图片信息
          const src =
            imgElement.getAttribute("src") ||
            imgElement.getAttribute("data-original") ||
            ""
          const alt = imgElement.getAttribute("alt") || ""
          const title = imgElement.getAttribute("title") || ""
          const caption = figCaption ? figCaption.textContent?.trim() || "" : ""

          // 使用caption作为alt文本（如果alt为空且caption存在）
          const effectiveAlt = alt || caption || `图片#${imageIndex}`

          if (src?.trim() && !src.startsWith("data:image/")) {
            // 将图片信息存储到数组中
            const imageInfo: ImageInfo = {
              src: src,
              alt: effectiveAlt,
              title: title,
              index: imageIndex
            }

            imagesArray.push(imageInfo)
            processingSummary.figureImagesExtracted++
            processingSummary.totalExtracted++

            // 在文本中插入图片引用标记，使用Markdown格式并加入caption作为说明
            result += `\n\n![${effectiveAlt}](${src})`
            if (caption && caption !== alt) {
              result += `\n*${caption}*`
            }
            result += "\n\n"
            imageIndex++
          } else {
            processingSummary.figureImagesSkipped++
            processingSummary.totalSkipped++
          }

          // 已经处理了figure内的内容，避免重复处理
          return
        }
      }

      // 处理独立的图片元素
      if (tagName === "img") {
        processingSummary.imgElements++
        processingSummary.totalProcessed++

        const imgElement = node as HTMLImageElement
        // 从配置的属性列表中提取src
        let src = ""

        // 遍历所有可能的图片属性
        for (const attr of IMAGE_SRC_ATTRIBUTES) {
          const value = imgElement.getAttribute(attr)
          if (value?.trim() && !value.startsWith("data:image/")) {
            src = value
            break
          }
        }

        const alt = imgElement.getAttribute("alt") || ""
        const title = imgElement.getAttribute("title") || ""

        debugLog(
          `处理图片元素: ${src.substring(0, 100)}${src.length > 100 ? "..." : ""}`
        )

        if (src) {
          // 将图片信息存储到数组中
          const imageInfo: ImageInfo = {
            src: src,
            alt: alt,
            title: title,
            index: imageIndex
          }

          imagesArray.push(imageInfo)
          processingSummary.imgExtracted++
          processingSummary.totalExtracted++

          // 在文本中插入图片引用标记，使用Markdown格式
          result += `\n\n![${alt || `图片#${imageIndex}`}](${src})\n\n`
          imageIndex++
        } else {
          processingSummary.imgSkipped++
          processingSummary.totalSkipped++
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
        const level = parseInt(tagName.substring(1), 10)
        const headingMd = "#".repeat(level)
        result += `\n\n${headingMd} ${(node as Element).textContent?.trim()}\n\n`
      } else if (tagName === "p") {
        // 段落处理
        const paragraphElement = node as Element

        // 检查段落中是否包含图片
        const imgElements = paragraphElement.querySelectorAll("img")
        if (imgElements.length > 0) {
          debugLog(`在段落中找到 ${imgElements.length} 个图片`)

          // 如果段落中有图片，我们需要手动遍历处理段落的子节点
          for (const child of Array.from(paragraphElement.childNodes)) {
            traverse(child)
          }
          return // 已经处理完子节点，直接返回
        }

        // 如果段落中没有图片，按常规处理
        const text = paragraphElement.textContent?.trim() || ""
        if (text) {
          result += `\n\n${text}\n`
        }
      } else if (tagName === "blockquote") {
        // 引用处理
        result += `\n\n> ${(node as Element).textContent?.trim()}\n\n`
      } else if (tagName === "li") {
        // 列表项处理
        result += `\n- ${(node as Element).textContent?.trim()}`
      } else if (tagName === "br") {
        // 换行处理
        result += "\n"
      } else if (
        tagName === "div" ||
        tagName === "section" ||
        tagName === "article"
      ) {
        // 对于容器元素，递归处理其子节点
        for (const child of Array.from(node.childNodes)) {
          traverse(child)
        }
        return // 已经处理完子节点，直接返回
      } else if (tagName === "pre" || tagName === "code") {
        // 代码块处理
        result += `\n\n\`\`\`\n${(node as Element).textContent?.trim()}\n\`\`\`\n\n`
      } else if (tagName === "table") {
        // 表格处理 - 以Markdown格式输出表格
        handleTable(node as HTMLTableElement)
      } else if (tagName === "a") {
        // 链接处理
        handleLink(node as HTMLAnchorElement)
      } else if (tagName === "strong" || tagName === "b") {
        // 加粗文本
        const text = (node as Element).textContent?.trim() || ""
        if (text) {
          result += `**${text}** `
        }
      } else if (tagName === "em" || tagName === "i") {
        // 斜体文本
        const text = (node as Element).textContent?.trim() || ""
        if (text) {
          result += `*${text}* `
        }
      } else {
        // 处理其他标签的子节点
        for (const child of Array.from(node.childNodes)) {
          traverse(child)
        }
      }
    }
  }

  // 表格处理函数
  function handleTable(tableElement: HTMLTableElement): void {
    const rows = tableElement.querySelectorAll("tr")
    if (rows.length > 0) {
      result += "\n\n"

      // 添加表头
      const headerRow = rows[0]
      const headerCells = headerRow.querySelectorAll("th, td")

      rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll("th, td")
        let rowText = "|"
        cells.forEach((cell) => {
          rowText += ` ${cell.textContent?.trim() || ""} |`
        })

        // 添加行
        result += `${rowText}\n`

        // 在第一行后添加分隔符
        if (rowIndex === 0) {
          let separatorRow = "|"
          headerCells.forEach(() => {
            separatorRow += " --- |"
          })
          result += `${separatorRow}\n`
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
          rowText += `${cell.textContent?.trim() || ""} | `
        })
        if (rowText) {
          result += `${rowText.slice(0, -3)}\n` // 移除最后一个 " | "
        }
      })
      result += "\n\n"
    }
  }

  // 链接处理函数
  function handleLink(anchorElement: HTMLAnchorElement): void {
    // 检查是否是fancybox类型的链接
    const isFancybox =
      anchorElement.classList.contains("fancybox") ||
      anchorElement.hasAttribute("data-fancybox")

    // 首先检查链接内是否包含图片
    const imgElement = anchorElement.querySelector("img")

    if (imgElement || isFancybox) {
      // 图片处理
      processingSummary.imgElements++
      processingSummary.totalProcessed++

      // 对于fancybox类型的链接，链接的href通常是大图，而内部img的src可能是缩略图
      // 优先使用链接href作为图片源（如果存在）
      let src = ""
      if (isFancybox && anchorElement.getAttribute("href")) {
        src = anchorElement.getAttribute("href") || ""
        debugLog(`处理fancybox链接，使用href作为图片源: ${src}`)
        processingSummary.fancyboxImages++
      } else if (imgElement) {
        // 从配置的属性列表中提取src
        for (const attr of IMAGE_SRC_ATTRIBUTES) {
          const value = imgElement.getAttribute(attr)
          if (value?.trim() && !value.startsWith("data:image/")) {
            src = value
            break
          }
        }
        processingSummary.anchorImages++
      }

      // 获取alt和title
      const alt = imgElement ? imgElement.getAttribute("alt") || "" : ""
      const title = imgElement ? imgElement.getAttribute("title") || "" : ""

      if (src) {
        // 将图片信息存储到数组中
        const imageInfo: ImageInfo = {
          src: src,
          alt: alt,
          title: title,
          index: imageIndex
        }

        imagesArray.push(imageInfo)
        processingSummary.imgExtracted++
        processingSummary.totalExtracted++

        const linkType = isFancybox ? "fancybox链接" : "普通链接"
        debugLog(`从${linkType}中提取图片: ${src}`)

        // 在文本中插入图片引用标记，使用Markdown格式
        result += `\n\n![${alt || `图片#${imageIndex}`}](${src})\n\n`
        imageIndex++
      } else {
        processingSummary.imgSkipped++
        processingSummary.totalSkipped++
      }
      return // 已处理完图片，不再处理链接文本
    }

    // 如果链接不包含图片，按原逻辑处理链接文本
    const href = anchorElement.getAttribute("href") || ""
    const text = anchorElement.textContent?.trim() || ""
    if (text) {
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        result += `[${text}](${href}) `
      } else {
        result += `${text} `
      }
    }
  }

  traverse(element)

  // 输出图片处理统计信息
  debugLog("图片处理统计:", {
    figureImages: `${processingSummary.figureImagesExtracted}/${processingSummary.figureElements}`,
    imgElements: `${processingSummary.imgExtracted}/${processingSummary.imgElements}`,
    anchorImages: processingSummary.anchorImages,
    fancyboxImages: processingSummary.fancyboxImages,
    totalExtracted: processingSummary.totalExtracted,
    totalSkipped: processingSummary.totalSkipped
  })

  // 清理结果：规范化空白和换行
  return result
    .trim()
    .replace(/[ \t]+/g, " ") // 仅替换连续的空格和制表符为单个空格，保留换行
    .replace(/\n\s+/g, "\n") // 删除换行后的前导空格
    .replace(/\n{4,}/g, "\n\n\n") // 将四个或以上连续换行替换为三个换行
    .replace(/\s+\./g, ".") // 修复句号前的空格
    .replace(/\s+,/g, ",") // 修复逗号前的空格
}

export { cleanContent } from "./text/clean-content"
