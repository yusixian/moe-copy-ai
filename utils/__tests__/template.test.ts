import type { ScrapedContent } from "../../constants/types"
import {
  extractPlaceholders,
  hasAnyPlaceholder,
  hasPlaceholder,
  processTemplate
} from "../template"

describe("template", () => {
  describe("processTemplate", () => {
    let mockData: ScrapedContent

    beforeEach(() => {
      mockData = {
        articleContent: "文章内容",
        title: "文章标题",
        url: "https://example.com/article",
        author: "测试作者",
        publishDate: "2023-05-01",
        cleanedContent: "清理后的内容",
        metadata: {
          description: "文章描述",
          keywords: "关键词1,关键词2"
        },
        images: []
      }
    })

    test("应替换基本占位符", () => {
      const template = "标题：{{title}}，作者：{{author}}"
      const result = processTemplate(template, mockData)
      expect(result).toBe("标题：文章标题，作者：测试作者")
    })

    test("应替换多个相同的占位符", () => {
      const template = "标题：{{title}}，再次显示标题：{{title}}"
      const result = processTemplate(template, mockData)
      expect(result).toBe("标题：文章标题，再次显示标题：文章标题")
    })

    test("应处理元数据占位符", () => {
      const template = "描述：{{meta.description}}，关键词：{{meta.keywords}}"
      const result = processTemplate(template, mockData)
      expect(result).toBe("描述：文章描述，关键词：关键词1,关键词2")
    })

    test("应处理不存在的占位符", () => {
      const template = "不存在的占位符：{{nonexistent}}"
      const result = processTemplate(template, mockData)
      expect(result).toBe("不存在的占位符：{{nonexistent}}")
    })

    test("应处理空模板", () => {
      expect(processTemplate("", mockData)).toBe("")
      expect(processTemplate(null as unknown as string, mockData)).toBe(
        null as unknown as string
      )
      expect(processTemplate(undefined as unknown as string, mockData)).toBe(
        undefined as unknown as string
      )
    })

    test("应处理缺失的数据", () => {
      const template = "标题：{{title}}，作者：{{author}}"
      const incompleteData: Partial<ScrapedContent> = {
        title: "只有标题"
      }
      const result = processTemplate(template, incompleteData as ScrapedContent)
      expect(result).toBe("标题：只有标题，作者：")
    })

    test("应处理metadata为null或undefined的情况", () => {
      const template = "描述：{{meta.description}}"

      // 测试metadata为null的情况
      const nullMetadata = { ...mockData, metadata: null }
      let result = processTemplate(template, nullMetadata)
      expect(result).toBe("描述：{{meta.description}}")

      // 测试metadata为undefined的情况
      const undefinedMetadata = { ...mockData }
      delete undefinedMetadata.metadata
      result = processTemplate(template, undefinedMetadata)
      expect(result).toBe("描述：{{meta.description}}")
    })

    test("当模板为空时应原样返回", () => {
      const result = processTemplate(null, {
        url: "https://example.com"
      } as ScrapedContent)

      expect(result).toBeNull()
    })

    test("当模板为undefined时应原样返回", () => {
      const result = processTemplate(undefined, {
        url: "https://example.com"
      } as ScrapedContent)

      expect(result).toBeUndefined()
    })

    test("当数据对象中存在null值时应将其替换为空字符串", () => {
      const template = "标题: {{title}}, 内容: {{content}}, 作者: {{author}}"
      const data = {
        title: null,
        content: null, // 这里内容也为null
        author: undefined
      } as unknown as ScrapedContent

      const result = processTemplate(template, data)

      expect(result).toBe("标题: , 内容: , 作者: ")
    })
  })

  describe("hasPlaceholder", () => {
    test("应检测到占位符", () => {
      expect(hasPlaceholder("这里有{{title}}占位符", "{{title}}")).toBe(true)
    })

    test("应返回false当占位符不存在", () => {
      expect(hasPlaceholder("这里没有占位符", "{{title}}")).toBe(false)
    })

    test("应处理空输入", () => {
      expect(hasPlaceholder("", "{{title}}")).toBe(false)
      expect(hasPlaceholder(null as unknown as string, "{{title}}")).toBe(false)
      expect(hasPlaceholder(undefined as unknown as string, "{{title}}")).toBe(
        false
      )
    })

    test("应正确处理特殊字符的占位符", () => {
      const templateWithSpecialChars = "这里有一个{{special.chars}}占位符"
      expect(
        hasPlaceholder(templateWithSpecialChars, "{{special.chars}}")
      ).toBe(true)
      expect(hasPlaceholder(templateWithSpecialChars, "{{incorrect}}")).toBe(
        false
      )
    })

    test("当模板为空时应返回false", () => {
      expect(hasPlaceholder(null, "{{content}}")).toBe(false)
      expect(hasPlaceholder(undefined, "{{content}}")).toBe(false)
      expect(hasPlaceholder("", "{{content}}")).toBe(false)
    })
  })

  describe("extractPlaceholders", () => {
    test("应提取所有占位符", () => {
      const template = "标题：{{title}}，作者：{{author}}，URL：{{url}}"
      const placeholders = extractPlaceholders(template)
      expect(placeholders).toEqual(["{{title}}", "{{author}}", "{{url}}"])
    })

    test("应去重重复的占位符", () => {
      const template = "标题：{{title}}，重复标题：{{title}}"
      const placeholders = extractPlaceholders(template)
      expect(placeholders).toEqual(["{{title}}"])
    })

    test("应处理没有占位符的情况", () => {
      expect(extractPlaceholders("没有占位符的文本")).toEqual([])
    })

    test("应处理空输入", () => {
      expect(extractPlaceholders("")).toEqual([])
      expect(extractPlaceholders(null as unknown as string)).toEqual([])
      expect(extractPlaceholders(undefined as unknown as string)).toEqual([])
    })
  })

  describe("hasAnyPlaceholder", () => {
    test("当有占位符时应返回true", () => {
      expect(hasAnyPlaceholder("标题：{{title}}")).toBe(true)
    })

    test("当没有占位符时应返回false", () => {
      expect(hasAnyPlaceholder("没有占位符的文本")).toBe(false)
    })

    test("应处理空输入", () => {
      expect(hasAnyPlaceholder("")).toBe(false)
      expect(hasAnyPlaceholder(null as unknown as string)).toBe(false)
      expect(hasAnyPlaceholder(undefined as unknown as string)).toBe(false)
    })
  })
})
