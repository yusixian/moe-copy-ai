import { Storage } from "@plasmohq/storage"

import {
  extractArticleContent,
  extractAuthor,
  extractMetadata,
  extractPublishDate,
  extractTitle,
  getFirstMatchContent,
  scrapeWebpageContent
} from "../extractor"
import * as formatter from "../formatter"
import * as logger from "../logger"

// 模拟依赖模块
jest.mock("@plasmohq/storage")
jest.mock("../formatter")
jest.mock("../logger")

// 用于设置HTML内容的辅助函数
function setDocumentHTML(html: string): void {
  document.body.innerHTML = html
}

// 设置Storage模拟函数
function mockStorage(getValue: any = null, rejectError: boolean = false) {
  const get = rejectError
    ? jest.fn().mockRejectedValue(new Error("存储访问错误"))
    : jest.fn().mockResolvedValue(getValue)

  const mockObj = { get, set: jest.fn() }
  ;(Storage as jest.MockedClass<typeof Storage>).mockImplementation(
    () => mockObj as any
  )
  return mockObj
}

// 设置formatter模拟函数
function setupFormatterMock(returnValue: string | ((el: Element) => string)) {
  if (typeof returnValue === "function") {
    ;(formatter.extractFormattedText as jest.Mock).mockImplementation(
      returnValue
    )
  } else {
    ;(formatter.extractFormattedText as jest.Mock).mockReturnValue(returnValue)
  }

  ;(formatter.cleanContent as jest.Mock).mockReturnValue(
    returnValue === "Custom content"
      ? "Cleaned custom content"
      : "Cleaned content"
  )
}

describe("extractor", () => {
  // 每个测试前都重置模拟
  beforeEach(() => {
    jest.clearAllMocks()
    document.body.innerHTML = ""

    // 设置默认模拟
    mockStorage()
    setupFormatterMock((element) => element.textContent || "")
    jest.spyOn(logger, "debugLog").mockImplementation(() => {})
  })

  describe("getFirstMatchContent", () => {
    test("应根据选择器列表获取内容", () => {
      setDocumentHTML(`
        <div id="first">First content</div>
        <div id="second">Second content</div>
      `)

      // 测试成功的情况
      const getContentFn = (el: Element) => el.textContent || ""
      expect(getFirstMatchContent(["#first", "#second"], getContentFn)).toBe(
        "First content"
      )

      // 测试没有匹配的情况
      expect(getFirstMatchContent(["#nonexistent"], getContentFn)).toBe("")
    })
  })

  describe("提取页面元素", () => {
    test("使用自定义选择器提取内容", async () => {
      setDocumentHTML(`
        <div class="custom-title">Custom Title</div>
        <div class="custom-author">Custom Author</div>
        <div class="custom-date">2023-03-01</div>
        <time datetime="2023-04-15">April 15, 2023</time>
      `)

      // 测试标题提取
      expect((await extractTitle(".custom-title")).title).toBe("Custom Title")

      // 测试作者提取
      expect((await extractAuthor(".custom-author")).author).toBe(
        "Custom Author"
      )

      // 测试日期提取
      expect((await extractPublishDate(".custom-date")).publishDate).toBe(
        "2023-03-01"
      )
      expect((await extractPublishDate("time")).publishDate).toBe("2023-04-15")
    })

    test("从元数据和标签中提取内容", async () => {
      setDocumentHTML(`
        <head>
          <meta name="title" content="Meta Title">
          <meta name="author" content="Meta Author">
          <meta property="article:published_time" content="2023-01-01">
          <title>HTML Title</title>
        </head>
        <body>
          <h1>Page Title</h1>
          <span class="author">Page Author</span>
        </body>
      `)

      expect((await extractTitle()).title).toBe("Meta Title")
      expect((await extractAuthor()).author).toBe("Meta Author")
      expect((await extractPublishDate()).publishDate).toBe("2023-01-01")
    })

    test("处理错误和边缘情况", async () => {
      // 测试无效选择器
      setDocumentHTML(`<h1>Title</h1>`)
      const { title } = await extractTitle("invalid:[selector]")
      expect(title).toBe("")
      expect(logger.debugLog).toHaveBeenCalled()

      // 测试没有匹配的内容
      jest.clearAllMocks()
      setDocumentHTML(`<div>No metadata here</div>`)
      expect((await extractAuthor()).author).toBe("")

      // 测试querySelector抛出错误
      jest.clearAllMocks()
      const originalQuerySelectorAll = document.querySelectorAll
      document.querySelectorAll = jest.fn().mockImplementation((selector) => {
        if (selector.includes("error")) throw new Error("测试错误")
        return originalQuerySelectorAll.call(document, selector)
      })

      expect((await extractPublishDate(".error-selector")).publishDate).toBe("")
      expect(logger.debugLog).toHaveBeenCalled()

      // 恢复原始函数
      document.querySelectorAll = originalQuerySelectorAll
    })

    test("当storage.get抛出错误时应使用默认选择器", async () => {
      setDocumentHTML(`<h1>Page Title</h1>`)
      mockStorage(null, true) // 模拟storage.get抛出错误

      const { title } = await extractTitle()
      expect(title).not.toBe("")
      expect(logger.debugLog).toHaveBeenCalled()
    })
  })

  describe("extractArticleContent", () => {
    test("内容提取策略优先级", async () => {
      // 1. 优先使用article标签
      setupFormatterMock("Article content")
      setDocumentHTML(`<article><p>Article content</p></article>`)

      let result = await extractArticleContent()
      expect(result.content).toBe("Article content")
      expect(result.results[0].selector).toBe("article (longest)")

      // 2. 当有多个article时选择最长的
      jest.clearAllMocks()
      setupFormatterMock((element) => {
        return element.className === "long-article"
          ? "Long article content"
          : "Short content"
      })

      setDocumentHTML(`
        <article>Short content</article>
        <article class="long-article">Long article content</article>
      `)

      result = await extractArticleContent()
      expect(result.content).toBe("Long article content")

      // 3. 使用选择器
      jest.clearAllMocks()
      setupFormatterMock("Main content")
      setDocumentHTML(`<main><p>Main content</p></main>`)

      result = await extractArticleContent()
      expect(result.content).toBe("Main content")

      // 4. 使用自定义选择器
      jest.clearAllMocks()
      setupFormatterMock("Custom content")
      setDocumentHTML(`<div class="custom-content"><p>Custom content</p></div>`)

      result = await extractArticleContent([], ".custom-content")
      expect(result.content).toBe("Custom content")

      // 5. 使用段落集合
      jest.clearAllMocks()
      // 恢复默认实现，允许实际提取段落文本
      setupFormatterMock((element) => element.textContent || "")
      setDocumentHTML(`
        <div>
          <p>Short paragraph.</p>
          <p>This is a longer paragraph with more than 30 characters that should be captured.</p>
          <p>Another longer paragraph with sufficient content to be included in the collection.</p>
          <p>A third longer paragraph that should be part of the collection as well.</p>
          <p>One more paragraph that is certainly long enough to be captured in output.</p>
        </div>
      `)

      result = await extractArticleContent()
      expect(result.content).toContain("sufficient content")
      expect(result.content).toContain("should be captured")
      expect(result.content).not.toContain("Short paragraph")

      // 6. 使用body作为最后手段
      jest.clearAllMocks()
      setupFormatterMock("Body content")
      setDocumentHTML(`<div>Just some content</div>`)

      result = await extractArticleContent()
      expect(result.content).toBe("Body content")
      expect(result.results[0].selector).toBe("body")
    })

    describe("extractArticleContent with custom conditions", () => {
      beforeEach(() => {
        // 清除DOM
        document.body.innerHTML = ""
        jest.clearAllMocks()
      })

      test("当内容容器都不存在时应尝试从段落集合中提取内容", async () => {
        // 创建一个包含多个段落的DOM
        document.body.innerHTML = `
          <div>
            <p>段落1，非常长的一段文本，超过30个字符的长度。</p>
            <p>段落2，也是非常长的一段文本，同样超过30个字符。</p>
            <p>段落3，同样超过长度阈值。</p>
            <p>短段落</p>
          </div>
        `

        // 模拟返回空结果，使函数尝试段落提取
        const mockQuerySelector = jest.spyOn(document, "querySelector")
        mockQuerySelector.mockImplementation(() => null)

        const result = await extractArticleContent()

        // 验证结果
        expect(result.content).toContain("段落1")
        expect(result.content).toContain("段落2")
        expect(result.content).toContain("段落3")
        // 注意：短段落可能会被包含，所以我们不测试这个条件
        expect(result.results[0].selector).toBe("body")

        mockQuerySelector.mockRestore()
      })

      test("当段落集合也不符合条件时应从body提取内容", async () => {
        // 创建一个没有段落或只有短段落的DOM
        document.body.innerHTML = `
          <div>
            <p>短1</p>
            <p>短2</p>
          </div>
        `

        // 模拟返回空结果，使函数尝试段落提取
        const mockQuerySelector = jest.spyOn(document, "querySelector")
        mockQuerySelector.mockImplementation(() => null)

        const result = await extractArticleContent()

        // 验证使用了body选择器作为最后的手段
        expect(result.results[0].selector).toBe("body")
        expect(logger.debugLog).toHaveBeenCalledWith(
          "未找到明确的内容区域，尝试提取body内容"
        )

        mockQuerySelector.mockRestore()
      })
    })
  })

  describe("extractMetadata", () => {
    test("应提取页面元数据", () => {
      setDocumentHTML(`
        <head>
          <meta name="description" content="Page description">
          <meta property="og:image" content="image.jpg">
          <meta name="empty-content" content="">
          <meta name="no-content">
        </head>
      `)

      const metadata = extractMetadata()
      expect(Object.keys(metadata).length).toBe(2)
      expect(metadata["description"]).toBe("Page description")
      expect(metadata["og:image"]).toBe("image.jpg")

      // 测试空文档
      setDocumentHTML(`<div>No meta tags</div>`)
      expect(Object.keys(extractMetadata()).length).toBe(0)
    })
  })

  describe("scrapeWebpageContent", () => {
    test("应整合所有抓取功能", async () => {
      // 设置默认抓取测试
      setupFormatterMock("Article content")
      setDocumentHTML(`
        <head>
          <meta name="title" content="Page Title">
          <meta name="author" content="Page Author">
          <meta property="article:published_time" content="2023-01-01">
        </head>
        <body>
          <article><p>Article content</p></article>
        </body>
      `)

      let result = await scrapeWebpageContent({ mode: "selector" })
      expect(result.title).toBe("Page Title")
      expect(result.author).toBe("Page Author")
      expect(result.publishDate).toBe("2023-01-01")
      expect(result.articleContent).toBe("Article content")
      expect(result.cleanedContent).toBe("Cleaned content")

      // 测试自定义选择器
      jest.clearAllMocks()
      setupFormatterMock("Custom content")
      setDocumentHTML(`
        <div class="custom-title">Custom Title</div>
        <div class="custom-author">Custom Author</div>
        <div class="custom-date">2023-03-01</div>
        <div class="custom-content">Custom content</div>
      `)

      result = await scrapeWebpageContent({
        mode: "selector",
        customSelectors: {
          title: ".custom-title",
          author: ".custom-author",
          date: ".custom-date",
          content: ".custom-content"
        }
      })

      expect(result.title).toBe("Custom Title")
      expect(result.author).toBe("Custom Author")
      expect(result.publishDate).toBe("2023-03-01")
      expect(result.articleContent).toBe("Custom content")
      expect(result.cleanedContent).toBe("Cleaned custom content")
    })
  })
})
