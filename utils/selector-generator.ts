/**
 * 检查值是否看起来像动态生成的（hash、随机字符串等）
 */
export function isDynamicValue(value: string): boolean {
  // 纯 hash 值 (8位以上的十六进制)
  if (/^[a-f0-9]{8,}$/i.test(value)) return true
  // 带有动态后缀 (如 button-a1b2c3)
  if (/[-_:][0-9a-f]{4,}$/i.test(value)) return true
  // React portal/radix IDs (如 r:0, radix-1)
  if (/^r[:-]?\d+$/.test(value)) return true
  if (/^radix-/i.test(value)) return true
  // UUID 格式
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  )
    return true
  // 纯数字 ID (可能是动态生成的)
  if (/^\d{6,}$/.test(value)) return true

  return false
}

/**
 * 获取元素的稳定类名（过滤掉动态生成的类名）
 */
export function getStableClasses(element: Element): string[] {
  return Array.from(element.classList).filter((c) => {
    // 排除空类名
    if (!c.trim()) return false
    // 排除纯 hash 类名
    if (/^[a-f0-9]{8,}$/i.test(c)) return false
    // 排除带动态后缀的类名
    if (/[-_][0-9a-f]{4,}$/i.test(c)) return false
    // 排除 CSS-in-JS 生成的类名 (emotion, styled-components, etc.)
    if (/^css-[a-z0-9]+$/i.test(c)) return false
    if (/^sc-[a-zA-Z]+-[a-zA-Z0-9]+$/.test(c)) return false
    // 排除 CSS Modules 生成的类名
    if (/^_[a-zA-Z0-9]{5,}$/.test(c)) return false
    if (/^[a-zA-Z]+_[a-zA-Z]+__[a-zA-Z0-9]+$/.test(c)) return false
    // 排除 Tailwind 的动态类名
    if (/^\[.*\]$/.test(c)) return false

    return true
  })
}

/**
 * 统计选择器匹配的元素数量
 */
export function countMatches(selector: string): number {
  try {
    return document.querySelectorAll(selector).length
  } catch {
    return 0
  }
}

export interface SelectorOptions {
  /**
   * 是否允许选择器匹配多个元素
   * - true: 用于链接提取区域，允许匹配相似元素
   * - false: 用于下一页按钮，必须精确匹配单个元素
   */
  allowMultiple?: boolean
  /**
   * 最大向上查找的祖先层级数
   */
  maxAncestorDepth?: number
}

export interface SelectorResult {
  /** 生成的选择器 */
  selector: string
  /** 该选择器匹配的元素数量 */
  matchCount: number
  /** 选择器的稳定性评分 (0-100)，越高越稳定 */
  stability: number
  /** 选择器类型描述 */
  type:
    | "id"
    | "class"
    | "attribute"
    | "semantic"
    | "parent-limited"
    | "nth-path"
}

/**
 * 生成元素的稳定 CSS 选择器
 * 优先生成唯一且稳定的选择器，避免误伤其他元素
 */
export function generateUniqueSelector(
  element: Element,
  options: SelectorOptions = {}
): string {
  const result = generateSelectorWithInfo(element, options)
  return result.selector
}

/**
 * 生成选择器并返回详细信息
 */
export function generateSelectorWithInfo(
  element: Element,
  options: SelectorOptions = {}
): SelectorResult {
  const { allowMultiple = false, maxAncestorDepth = 3 } = options
  const tag = element.tagName.toLowerCase()

  // 策略 1: ID 选择器（最稳定，通常唯一）
  if (element.id && !isDynamicValue(element.id)) {
    const selector = `#${CSS.escape(element.id)}`
    const matchCount = countMatches(selector)
    if (matchCount === 1 || allowMultiple) {
      return { selector, matchCount, stability: 95, type: "id" }
    }
  }

  // 策略 2: 语义属性选择器 (data-testid, aria-label 等)
  const semanticResult = trySemanticSelector(element, tag, allowMultiple)
  if (semanticResult) return semanticResult

  // 策略 3: 稳定类名组合
  const stableClasses = getStableClasses(element)
  if (stableClasses.length > 0) {
    // 尝试不同数量的类名组合
    for (let count = stableClasses.length; count >= 1; count--) {
      const classes = stableClasses.slice(0, count)
      const selector = `${tag}.${classes.map((c) => CSS.escape(c)).join(".")}`
      const matchCount = countMatches(selector)
      if (matchCount === 1) {
        return { selector, matchCount, stability: 80, type: "class" }
      }
      if (allowMultiple && matchCount > 0) {
        return { selector, matchCount, stability: 70, type: "class" }
      }
    }
  }

  // 策略 4: 通用属性选择器
  const attrResult = tryAttributeSelector(element, tag, allowMultiple)
  if (attrResult) return attrResult

  // 策略 5: 父元素限定选择器
  const parentResult = tryParentLimitedSelector(
    element,
    tag,
    stableClasses,
    allowMultiple,
    maxAncestorDepth
  )
  if (parentResult) return parentResult

  // 策略 6: nth-child 路径（最后手段，稳定性最差但保证唯一）
  const nthPath = generateNthChildPath(element)
  return {
    selector: nthPath,
    matchCount: 1,
    stability: 30,
    type: "nth-path"
  }
}

/**
 * 尝试使用语义属性生成选择器
 */
function trySemanticSelector(
  element: Element,
  tag: string,
  allowMultiple: boolean
): SelectorResult | null {
  // 优先级从高到低的语义属性
  const semanticAttrs = [
    "data-testid",
    "data-test-id",
    "data-cy",
    "data-id",
    "aria-label",
    "name",
    "title"
  ]

  for (const attrName of semanticAttrs) {
    const value = element.getAttribute(attrName)
    if (value && !isDynamicValue(value) && !value.includes("\n")) {
      const escapedValue = CSS.escape(value)
      const selector = `${tag}[${attrName}="${escapedValue}"]`
      const matchCount = countMatches(selector)
      if (matchCount === 1 || allowMultiple) {
        return { selector, matchCount, stability: 85, type: "semantic" }
      }
    }
  }

  // 尝试 role 属性
  const role = element.getAttribute("role")
  if (role) {
    const selector = `${tag}[role="${CSS.escape(role)}"]`
    const matchCount = countMatches(selector)
    if (matchCount === 1) {
      return { selector, matchCount, stability: 75, type: "semantic" }
    }
  }

  return null
}

/**
 * 尝试使用通用属性生成选择器
 */
function tryAttributeSelector(
  element: Element,
  tag: string,
  allowMultiple: boolean
): SelectorResult | null {
  // 可用于选择的属性（排除常见的动态属性）
  const skipAttrs = new Set([
    "id",
    "class",
    "style",
    "src",
    "href",
    "onclick",
    "onload",
    "onerror"
  ])

  for (const attr of Array.from(element.attributes)) {
    if (skipAttrs.has(attr.name)) continue
    if (!attr.value || attr.value.includes(" ") || attr.value.length > 50)
      continue
    if (isDynamicValue(attr.value)) continue

    const selector = `${tag}[${attr.name}="${CSS.escape(attr.value)}"]`
    const matchCount = countMatches(selector)
    if (matchCount === 1 || allowMultiple) {
      return { selector, matchCount, stability: 65, type: "attribute" }
    }
  }

  return null
}

/**
 * 尝试使用父元素限定的选择器
 */
function tryParentLimitedSelector(
  element: Element,
  tag: string,
  stableClasses: string[],
  allowMultiple: boolean,
  maxDepth: number
): SelectorResult | null {
  let current = element.parentElement
  let depth = 0

  while (current && depth < maxDepth) {
    depth++
    const parentSelector = buildElementSelector(current)

    if (parentSelector) {
      // 尝试 父选择器 > 子标签
      const directChild = `${parentSelector} > ${tag}`
      let matchCount = countMatches(directChild)
      if (matchCount === 1 || allowMultiple) {
        return {
          selector: directChild,
          matchCount,
          stability: 60,
          type: "parent-limited"
        }
      }

      // 尝试 父选择器 > 子标签.类名
      if (stableClasses.length > 0) {
        const withClass = `${parentSelector} > ${tag}.${CSS.escape(stableClasses[0])}`
        matchCount = countMatches(withClass)
        if (matchCount === 1 || allowMultiple) {
          return {
            selector: withClass,
            matchCount,
            stability: 65,
            type: "parent-limited"
          }
        }
      }

      // 尝试 父选择器 子标签（后代选择器）
      const descendant = `${parentSelector} ${tag}`
      matchCount = countMatches(descendant)
      if (matchCount === 1 || allowMultiple) {
        return {
          selector: descendant,
          matchCount,
          stability: 55,
          type: "parent-limited"
        }
      }
    }

    current = current.parentElement
  }

  return null
}

/**
 * 为单个元素构建简单选择器（用于父元素）
 */
function buildElementSelector(element: Element): string | null {
  const tag = element.tagName.toLowerCase()

  // 优先使用 ID
  if (element.id && !isDynamicValue(element.id)) {
    return `#${CSS.escape(element.id)}`
  }

  // 使用稳定类名
  const stableClasses = getStableClasses(element)
  if (stableClasses.length > 0) {
    return `${tag}.${stableClasses
      .slice(0, 2)
      .map((c) => CSS.escape(c))
      .join(".")}`
  }

  // 使用语义属性
  const semanticAttrs = ["data-testid", "role", "aria-label"]
  for (const attrName of semanticAttrs) {
    const value = element.getAttribute(attrName)
    if (value && !isDynamicValue(value)) {
      return `${tag}[${attrName}="${CSS.escape(value)}"]`
    }
  }

  return null
}

/**
 * 生成 nth-child 路径选择器（最后手段）
 */
function generateNthChildPath(element: Element): string {
  const path: string[] = []
  let current: Element | null = element
  let foundAnchor = false

  while (
    current &&
    current !== document.body &&
    current !== document.documentElement
  ) {
    const tag = current.tagName.toLowerCase()
    const parent = current.parentElement

    if (!parent) break

    // 如果找到有稳定 ID 的祖先，以它为锚点
    if (current.id && !isDynamicValue(current.id)) {
      path.unshift(`#${CSS.escape(current.id)}`)
      foundAnchor = true
      break
    }

    // 计算当前元素在同类兄弟中的索引
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === current?.tagName
    )
    const index = siblings.indexOf(current) + 1

    if (siblings.length === 1) {
      path.unshift(tag)
    } else {
      path.unshift(`${tag}:nth-of-type(${index})`)
    }

    current = parent

    // 限制路径深度
    if (path.length >= 5 && !foundAnchor) {
      break
    }
  }

  return path.join(" > ")
}

/**
 * 验证选择器是否能匹配到目标元素
 */
export function validateSelector(
  selector: string,
  targetElement: Element
): boolean {
  try {
    const matches = document.querySelectorAll(selector)
    return Array.from(matches).includes(targetElement)
  } catch {
    return false
  }
}

/**
 * 获取选择器的匹配信息
 */
export function getSelectorMatchInfo(selector: string): {
  isValid: boolean
  matchCount: number
  elements: Element[]
} {
  try {
    const elements = Array.from(document.querySelectorAll(selector))
    return {
      isValid: true,
      matchCount: elements.length,
      elements
    }
  } catch {
    return {
      isValid: false,
      matchCount: 0,
      elements: []
    }
  }
}

/**
 * 下一页按钮选择器结果
 */
export interface NextPageSelectorResult {
  /** XPath 表达式 */
  xpath: string
  /** 用于显示的描述 */
  description: string
  /** 元素的文本内容（用于显示） */
  textContent?: string
}

/**
 * 转义 XPath 字符串中的引号
 */
function escapeXPathString(str: string): string {
  if (!str.includes("'")) {
    return `'${str}'`
  }
  if (!str.includes('"')) {
    return `"${str}"`
  }
  // 包含两种引号，使用 concat
  return `concat('${str.replace(/'/g, "',\"'\",'")}')`
    .replace(/'',/g, "")
    .replace(/,''$/g, "")
}

/**
 * 使用 XPath 统计匹配的元素数量
 */
function countXPathMatches(xpath: string): number {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null
    )
    return result.snapshotLength
  } catch {
    return 0
  }
}

/**
 * 获取元素的简洁文本内容（去除多余空白）
 */
function getElementText(element: Element): string {
  return (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 50)
}

/**
 * 专门为下一页按钮生成稳定的 XPath 选择器
 * 使用多种策略确保选择器的稳定性和唯一性，包含文本内容匹配
 */
export function generateNextPageButtonSelector(
  element: Element
): NextPageSelectorResult {
  const tag = element.tagName.toLowerCase()
  const textContent = getElementText(element)

  // 策略 1: rel="next" (最标准的分页标识)
  if (element.getAttribute("rel") === "next") {
    const xpath = `//${tag}[@rel='next']`
    if (countXPathMatches(xpath) === 1) {
      return { xpath, description: 'rel="next"', textContent }
    }
  }

  // 策略 2: aria-label 匹配
  const ariaLabel = element.getAttribute("aria-label")
  if (ariaLabel && !isDynamicValue(ariaLabel)) {
    const xpath = `//${tag}[@aria-label=${escapeXPathString(ariaLabel)}]`
    if (countXPathMatches(xpath) === 1) {
      return { xpath, description: `aria-label="${ariaLabel}"`, textContent }
    }
  }

  // 策略 3: 精确文本匹配
  if (textContent && textContent.length <= 20) {
    const xpath = `//${tag}[normalize-space(text())=${escapeXPathString(textContent)}]`
    if (countXPathMatches(xpath) === 1) {
      return { xpath, description: `text="${textContent}"`, textContent }
    }
  }

  // 策略 4: title 属性匹配
  const title = element.getAttribute("title")
  if (title && !isDynamicValue(title)) {
    const xpath = `//${tag}[@title=${escapeXPathString(title)}]`
    if (countXPathMatches(xpath) === 1) {
      return { xpath, description: `title="${title}"`, textContent }
    }
  }

  // 策略 5: class 包含 next 相关词 + 文本
  const classList = Array.from(element.classList)
  const nextClass = classList.find(
    (c) => /next|forward/i.test(c) && !isDynamicValue(c)
  )
  if (nextClass && textContent) {
    const xpath = `//${tag}[contains(@class, '${nextClass}') and normalize-space()=${escapeXPathString(textContent)}]`
    if (countXPathMatches(xpath) === 1) {
      return { xpath, description: `class="${nextClass}" + text`, textContent }
    }
  }
  if (nextClass) {
    const xpath = `//${tag}[contains(@class, '${nextClass}')]`
    if (countXPathMatches(xpath) === 1) {
      return { xpath, description: `class="${nextClass}"`, textContent }
    }
  }

  // 策略 6: data 属性
  for (const attr of Array.from(element.attributes)) {
    if (attr.name.startsWith("data-") && /next|page/i.test(attr.name)) {
      if (attr.value && !isDynamicValue(attr.value)) {
        const xpath = `//${tag}[@${attr.name}=${escapeXPathString(attr.value)}]`
        if (countXPathMatches(xpath) === 1) {
          return {
            xpath,
            description: `${attr.name}="${attr.value}"`,
            textContent
          }
        }
      }
    }
  }

  // 策略 7: 稳定类名 + 文本内容组合
  const stableClasses = getStableClasses(element)
  if (stableClasses.length > 0 && textContent) {
    const classCondition = stableClasses
      .slice(0, 2)
      .map((c) => `contains(@class, '${c}')`)
      .join(" and ")
    const xpath = `//${tag}[${classCondition} and normalize-space()=${escapeXPathString(textContent)}]`
    if (countXPathMatches(xpath) === 1) {
      return {
        xpath,
        description: `class + text="${textContent}"`,
        textContent
      }
    }
  }

  // 策略 8: 生成 XPath 路径
  const xpathPath = generateXPathFromElement(element)
  return { xpath: xpathPath, description: "路径定位", textContent }
}

/**
 * 根据元素生成 XPath 路径
 */
function generateXPathFromElement(element: Element): string {
  const parts: string[] = []
  let current: Element | null = element

  while (
    current &&
    current !== document.body &&
    current !== document.documentElement
  ) {
    const tag = current.tagName.toLowerCase()
    const parent = current.parentElement

    if (!parent) break

    // 如果有稳定 ID，以它为锚点
    if (current.id && !isDynamicValue(current.id)) {
      parts.unshift(`//${tag}[@id='${current.id}']`)
      break
    }

    // 计算同名兄弟中的索引
    const siblings = Array.from(parent.children).filter(
      (child) => child.tagName === current?.tagName
    )
    const index = siblings.indexOf(current) + 1

    if (siblings.length === 1) {
      parts.unshift(tag)
    } else {
      parts.unshift(`${tag}[${index}]`)
    }

    current = parent

    if (parts.length >= 5) break
  }

  if (parts[0]?.startsWith("//")) {
    return parts.join("/")
  }
  return `//${parts.join("/")}`
}

/**
 * 根据 XPath 查找元素
 */
export function findElementByXPath(xpath: string): Element | null {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    )
    return result.singleNodeValue as Element | null
  } catch {
    return null
  }
}

/**
 * 根据选择器结果查找元素
 */
export function findElementBySelector(
  selectorResult: NextPageSelectorResult
): Element | null {
  return findElementByXPath(selectorResult.xpath)
}
