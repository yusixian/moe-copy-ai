import { SKIP_TAGS } from "./config"
import type { ImageInfo } from "./types"

// 从HTML元素中提取格式化的文本
export function extractFormattedText(
  element: Element,
  imagesArray: ImageInfo[] = []
): string {
  let result = ""
  let imageIndex = 0

  // 递归遍历节点
  function traverse(node: Node): void {
    // 如果是文本节点
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || ""
      if (text) {
        result += text + " "
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

      // 处理图片元素
      if (tagName === "img") {
        const imgElement = node as HTMLImageElement
        const src = imgElement.getAttribute("src") || ""
        const alt = imgElement.getAttribute("alt") || ""
        const title = imgElement.getAttribute("title") || ""

        if (src && src.trim() && !src.startsWith("data:image/")) {
          // 将图片信息存储到数组中
          const imageInfo: ImageInfo = {
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
        result += `\n\n${headingMd} ${(node as Element).textContent?.trim()}\n\n`
      } else if (tagName === "p") {
        // 段落处理
        const text = (node as Element).textContent?.trim() || ""
        if (text) {
          result += "\n\n" + text + "\n"
        }
      } else if (tagName === "blockquote") {
        // 引用处理
        result += "\n\n> " + (node as Element).textContent?.trim() + "\n\n"
      } else if (tagName === "li") {
        // 列表项处理
        result += "\n- " + (node as Element).textContent?.trim()
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
        result +=
          "\n\n```\n" + (node as Element).textContent?.trim() + "\n```\n\n"
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
        result += rowText + "\n"

        // 在第一行后添加分隔符
        if (rowIndex === 0) {
          let separatorRow = "|"
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
          rowText += (cell.textContent?.trim() || "") + " | "
        })
        if (rowText) {
          result += rowText.slice(0, -3) + "\n" // 移除最后一个 " | "
        }
      })
      result += "\n\n"
    }
  }

  // 链接处理函数
  function handleLink(anchorElement: HTMLAnchorElement): void {
    const href = anchorElement.getAttribute("href") || ""
    const text = anchorElement.textContent?.trim() || ""
    if (text) {
      if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
        result += `[${text}](${href}) `
      } else {
        result += text + " "
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
export function cleanContent(content: string): string {
  if (!content) return ""

  // 临时存储代码块
  const codeBlocks: string[] = []
  let tempContent = content

  // 提取并保存代码块
  const codeBlockRegex = /```[\s\S]*?```/g
  let match: RegExpExecArray | null
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
