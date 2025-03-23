import type { ScrapedContent } from "~constants/types"

/**
 * 替换模板字符串中的占位符
 * 支持的占位符:
 * - {{content}} - 文章内容
 * - {{title}} - 文章标题
 * - {{url}} - 文章URL
 * - {{author}} - 作者
 * - {{publishDate}} - 发布日期
 * - {{cleanedContent}} - 清理后的内容
 *
 * @param template 模板字符串
 * @param data 要替换的数据对象
 * @returns 替换后的字符串
 */
export function processTemplate(
  template: string,
  data: ScrapedContent
): string {
  if (!template) return template

  // 定义替换映射
  const replacements: Record<string, string> = {
    "{{content}}": data.articleContent || "",
    "{{title}}": data.title || "",
    "{{url}}": data.url || "",
    "{{author}}": data.author || "",
    "{{publishDate}}": data.publishDate || "",
    "{{cleanedContent}}": data.cleanedContent || ""
  }

  // 添加metadata中的所有字段作为{{meta.xxx}}
  if (data.metadata) {
    Object.entries(data.metadata).forEach(([key, value]) => {
      replacements[`{{meta.${key}}}`] = value || ""
    })
  }

  // 执行替换
  let result = template
  Object.entries(replacements).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder, "g"), value)
  })

  return result
}

/**
 * 检查模板字符串中是否包含特定的占位符
 *
 * @param template 模板字符串
 * @param placeholder 要检查的占位符，例如 "{{content}}"
 * @returns 是否包含该占位符
 */
export function hasPlaceholder(template: string, placeholder: string): boolean {
  if (!template) return false
  return template.includes(placeholder)
}

/**
 * 获取模板字符串中包含的所有占位符
 *
 * @param template 模板字符串
 * @returns 占位符数组
 */
export function extractPlaceholders(template: string): string[] {
  if (!template) return []

  const placeholderRegex = /{{([^{}]+)}}/g
  const matches = template.match(placeholderRegex)

  return matches ? [...new Set(matches)] : []
}

/**
 * 判断模板字符串是否包含任何占位符
 *
 * @param template 模板字符串
 * @returns 是否包含占位符
 */
export function hasAnyPlaceholder(template: string): boolean {
  return extractPlaceholders(template).length > 0
}
