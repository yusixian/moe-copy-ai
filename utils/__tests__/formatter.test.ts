import type { ImageInfo } from "~constants/types"
import { cleanContent, extractFormattedText, formatContent } from "../formatter"

describe("formatter", () => {
  describe("formatContent", () => {
    test("应处理空输入", () => {
      expect(formatContent("")).toBe("")
      expect(formatContent(null as unknown as string)).toBe("")
      expect(formatContent(undefined as unknown as string)).toBe("")
    })

    test("应保留段落间的空行", () => {
      expect(formatContent("段落1\n\n段落2")).toBe("段落1\n\n段落2")
    })

    test("应移除过多的连续空行", () => {
      expect(formatContent("段落1\n\n\n\n段落2")).toBe("段落1\n\n段落2")
      expect(formatContent("段落1\n\n\n段落2\n\n\n\n段落3")).toBe(
        "段落1\n\n段落2\n\n段落3"
      )
    })

    test("应统一换行符", () => {
      expect(formatContent("段落1\r\n段落2")).toBe("段落1\n段落2")
    })
  })

  describe("extractFormattedText", () => {
    const mockElement = (html: string): Element => {
      document.body.innerHTML = html
      return document.body.firstElementChild as Element
    }

    beforeEach(() => {
      document.body.innerHTML = ""
    })

    test("应处理文本节点", () => {
      const element = mockElement("<div>简单文本</div>")
      expect(extractFormattedText(element)).toBe("简单文本")
    })

    test("应跳过不需要的元素", () => {
      // 假设SKIP_TAGS包含'script'和'style'
      const element = mockElement(`
        <div>
          <script>console.log('测试')</script>
          <p>可见文本</p>
          <style>.test{color:red;}</style>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).not.toContain("console.log")
      expect(result).not.toContain("color:red")
      expect(result).toContain("可见文本")
    })

    test("应处理标题", () => {
      const element = mockElement(`
        <div>
          <h1>一级标题</h1>
          <h2>二级标题</h2>
          <h3>三级标题</h3>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("# 一级标题")
      expect(result).toContain("## 二级标题")
      expect(result).toContain("### 三级标题")
    })

    test("应处理段落", () => {
      const element = mockElement(`
        <div>
          <p>第一段</p>
          <p>第二段</p>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("第一段")
      expect(result).toContain("第二段")
    })

    test("应处理图片", () => {
      const element = mockElement(`
        <div>
          <img src="test.jpg" alt="测试图片">
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(element, imagesArray)
      expect(result).toContain("![测试图片](test.jpg)")
      expect(imagesArray.length).toBe(1)
      expect(imagesArray[0].src).toBe("test.jpg")
      expect(imagesArray[0].alt).toBe("测试图片")
    })

    test("应处理链接", () => {
      const element = mockElement(`
        <div>
          <a href="https://example.com">示例链接</a>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("[示例链接](https://example.com)")
    })

    test("应处理代码块", () => {
      const element = mockElement(`
        <div>
          <pre>const x = 1;</pre>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("```\nconst x = 1;\n```")
    })

    test("应处理figure元素中的图片", () => {
      const element = mockElement(`
        <div>
          <figure>
            <img src="test.jpg" alt="图片描述">
            <figcaption>图片说明</figcaption>
          </figure>
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(element, imagesArray)
      expect(result).toContain("![图片描述](test.jpg)")
      expect(result).toContain("*图片说明*")
      expect(imagesArray.length).toBe(1)
      expect(imagesArray[0].src).toBe("test.jpg")
      expect(imagesArray[0].alt).toBe("图片描述")
    })

    test("应处理figure元素中的图片（无alt但有figcaption）", () => {
      const element = mockElement(`
        <div>
          <figure>
            <img src="test.jpg">
            <figcaption>图片说明</figcaption>
          </figure>
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(element, imagesArray)
      expect(result).toContain("![图片说明](test.jpg)")
      expect(result).toContain("*图片说明*")
      expect(imagesArray.length).toBe(1)
      expect(imagesArray[0].src).toBe("test.jpg")
      expect(imagesArray[0].alt).toBe("图片说明")
    })

    test("应跳过没有src的figure图片", () => {
      const element = mockElement(`
        <div>
          <figure>
            <img data-src="">
            <figcaption>图片说明</figcaption>
          </figure>
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const _result = extractFormattedText(element, imagesArray)
      expect(imagesArray.length).toBe(0)
    })

    test("应跳过data:image格式的图片", () => {
      const element = mockElement(`
        <div>
          <img src="data:image/png;base64,iVBORw0KGgoAAAANSUh" alt="内联图片">
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const _result = extractFormattedText(element, imagesArray)
      expect(imagesArray.length).toBe(0)
    })

    test("应处理段落中的图片", () => {
      const element = mockElement(`
        <div>
          <p>这是一个包含<img src="test.jpg" alt="内嵌图片">的段落</p>
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(element, imagesArray)
      expect(result).toContain("![内嵌图片](test.jpg)")
      expect(imagesArray.length).toBe(1)
    })

    test("应处理引用块", () => {
      const element = mockElement(`
        <div>
          <blockquote>这是一段引用文本</blockquote>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("> 这是一段引用文本")
    })

    test("应处理列表项", () => {
      const element = mockElement(`
        <div>
          <li>列表项1</li>
          <li>列表项2</li>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("- 列表项1")
      expect(result).toContain("- 列表项2")
    })

    test("应处理换行", () => {
      const element = mockElement(`
        <div>
          第一行<br>第二行
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result.includes("第一行") && result.includes("第二行")).toBe(true)
    })

    test("应递归处理容器元素", () => {
      const element = mockElement(`
        <div>
          <section>
            <h2>章节标题</h2>
            <article>
              <p>文章内容</p>
            </article>
          </section>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("## 章节标题")
      expect(result).toContain("文章内容")
    })

    test("应处理加粗文本", () => {
      const element = mockElement(`
        <div>
          <strong>加粗文本</strong>
          <b>也是加粗</b>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("**加粗文本**")
      expect(result).toContain("**也是加粗**")
    })

    test("应处理斜体文本", () => {
      const element = mockElement(`
        <div>
          <em>斜体文本</em>
          <i>也是斜体</i>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("*斜体文本*")
      expect(result).toContain("*也是斜体*")
    })

    test("应处理表格", () => {
      const element = mockElement(`
        <div>
          <table>
            <thead>
              <tr>
                <th>标题1</th>
                <th>标题2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>单元格1</td>
                <td>单元格2</td>
              </tr>
            </tbody>
          </table>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("| 标题1 | 标题2 |")
      expect(result).toContain("| 单元格1 | 单元格2 |")
    })

    test("应能处理没有标题行的表格", () => {
      const element = mockElement(`
        <div>
          <table>
            <tbody>
              <tr>
                <td>单元格1</td>
                <td>单元格2</td>
              </tr>
            </tbody>
          </table>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("| 单元格1 | 单元格2 |")
    })

    test("应处理带有图片的链接", () => {
      const element = mockElement(`
        <div>
          <a href="https://example.com">
            <img src="test.jpg" alt="链接图片">
          </a>
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(element, imagesArray)
      expect(result).toContain("![链接图片](test.jpg)")
      expect(imagesArray.length).toBe(1)
    })

    test("应处理特殊情况下的链接", () => {
      const element = mockElement(`
        <div>
          <a href="https://example.com" target="_blank" rel="noopener">外部链接</a>
          <a href="#section">页内链接</a>
          <a>没有href的链接</a>
          <a href="">空href的链接</a>
          <a href="javascript:void(0)">JavaScript链接</a>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("[外部链接](https://example.com)")
      expect(result).toContain("页内链接")
      expect(result).toContain("没有href的链接")
      expect(result).toContain("空href的链接")
      expect(result).toContain("JavaScript链接")
    })

    test("应处理空表格行", () => {
      const element = mockElement(`
        <div>
          <table>
            <tbody>
              <tr>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>单元格1</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result).toContain("| | |")
      expect(result).toContain("| 单元格1 | |")
    })

    test("应处理fancybox类型的链接", () => {
      const element = mockElement(`
        <div>
          <a href="large-image.jpg" class="fancybox">
            <img src="thumbnail.jpg" alt="缩略图">
          </a>
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(element, imagesArray)
      expect(result).toContain("![缩略图](large-image.jpg)")
      expect(imagesArray.length).toBe(1)
      expect(imagesArray[0].src).toBe("large-image.jpg")
      expect(imagesArray[0].alt).toBe("缩略图")
    })

    test("应处理data-fancybox属性的链接", () => {
      const element = mockElement(`
        <div>
          <a href="large-image.jpg" data-fancybox>
            <img src="thumbnail.jpg" alt="缩略图">
          </a>
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(element, imagesArray)
      expect(result).toContain("![缩略图](large-image.jpg)")
      expect(imagesArray.length).toBe(1)
    })

    test("应处理没有alt文本的图片", () => {
      const element = mockElement(`
        <div>
          <img src="test.jpg">
        </div>
      `)
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(element, imagesArray)
      expect(result).toMatch(/!\[图片#\d+\]\(test\.jpg\)/)
      expect(imagesArray.length).toBe(1)
    })

    test("应处理没有文本的链接", () => {
      const element = mockElement(`
        <div>
          <a href="https://example.com"></a>
        </div>
      `)
      const result = extractFormattedText(element)
      expect(result.trim()).toBe("")
    })

    test("应处理链接中无图片元素但有src的情况", () => {
      // 创建一个带有链接但没有图片元素的链接
      document.body.innerHTML = `
        <a href="https://example.com">普通链接</a>
      `

      const link = document.querySelector("a") as HTMLAnchorElement
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(link, imagesArray)

      // 验证链接被正确格式化
      expect(result).toContain("[普通链接](https://example.com)")
      expect(imagesArray.length).toBe(0)
    })
  })

  describe("cleanContent", () => {
    test("应处理空输入", () => {
      expect(cleanContent("")).toBe("")
      expect(cleanContent(null as unknown as string)).toBe("")
      expect(cleanContent(undefined as unknown as string)).toBe("")
    })

    test("应移除多余空格", () => {
      expect(cleanContent("测试  内容")).toBe("测试 内容")
    })

    test("应保留Markdown标题格式", () => {
      expect(cleanContent("# 标题")).toBe("# 标题")
      expect(cleanContent("#   标题")).toBe("# 标题")
    })

    test("应修复标点符号前的空格", () => {
      expect(cleanContent("测试 , 内容")).toBe("测试, 内容")
      expect(cleanContent("测试 . 内容")).toBe("测试. 内容")
    })

    test("应保留代码块", () => {
      const content = "测试代码块：\n```\nconst x = 1;\n```\n后续内容"
      expect(cleanContent(content)).toContain("```\nconst x = 1;\n```")
    })

    test("应处理换行前后的空格", () => {
      expect(cleanContent("行1 \n 行2")).toBe("行1 行2")
    })

    test("应替换连续空格", () => {
      expect(cleanContent("文本   间隔")).toBe("文本 间隔")
    })

    test("应处理多种空白字符", () => {
      expect(cleanContent("文本\t制表符")).toBe("文本 制表符")
      const result = cleanContent("文本\r回车")
      expect(result.includes("文本") && result.includes("回车")).toBe(true)
    })

    test("应保持Markdown格式", () => {
      expect(cleanContent("**粗体**")).toBe("**粗体**")
      expect(cleanContent("*斜体*")).toBe("*斜体*")
      expect(cleanContent("`代码`")).toBe("`代码`")
      expect(cleanContent("- 列表项")).toBe("-列表项")
      expect(cleanContent("> 引用")).toBe("> 引用")
    })

    test("应正确处理复杂的Markdown内容", () => {
      const complex = `
      # 标题

      这是**粗体**和*斜体*的混合使用。

      - 列表项 1
      - 列表项 2

      > 这是一段引用文本
      
      \`\`\`
      const code = "示例代码";
      \`\`\`
      
      | 表格 | 标题 |
      | ---- | ---- |
      | 内容 | 数据 |
      `

      const cleaned = cleanContent(complex)
      expect(cleaned).toContain("# 标题")
      expect(cleaned).toContain("**粗体**和*斜体*")
      expect(cleaned).toContain("-列表项 1")
      expect(cleaned).toContain("> 这是一段引用文本")
      expect(cleaned).toMatch(/```.*const code.*```/s)
      expect(cleaned).toContain("| 表格 | 标题 |")
    })

    test("应处理HTML实体和转义字符", () => {
      expect(cleanContent("&lt;div&gt;")).toBe("&lt;div&gt;")
      expect(cleanContent("\\*不是斜体\\*")).toBe("\\*不是斜体\\*")
    })

    test("应处理URL中的空格", () => {
      expect(cleanContent("[链接](https://example.com/path with spaces)")).toBe(
        "[链接](https://example.com/path with spaces)"
      )
    })

    test("应处理特殊标点周围的空格", () => {
      expect(cleanContent("文本 ，继续")).toBe("文本 ，继续")
      expect(cleanContent("文本 。继续")).toBe("文本 。继续")
      expect(cleanContent("文本 ；继续")).toBe("文本 ；继续")
      expect(cleanContent("文本 ：继续")).toBe("文本 ：继续")
      expect(cleanContent("文本 ！继续")).toBe("文本 ！继续")
      expect(cleanContent("文本 ？继续")).toBe("文本 ？继续")
    })

    test("应正确恢复多个代码块", () => {
      const content =
        "前导文本\n```\nconst x = 1;\n```\n中间文本\n```\nlet y = 2;\n```\n结尾文本"
      const cleaned = cleanContent(content)
      expect(cleaned).toContain("```\nconst x = 1;\n```")
      expect(cleaned).toContain("```\nlet y = 2;\n```")
      expect(cleaned).toContain("前导文本")
      expect(cleaned).toContain("中间文本")
      expect(cleaned).toContain("结尾文本")
    })
  })

  describe("handleTable", () => {
    test("应正确处理表格并格式化为Markdown表格", () => {
      // 创建一个简单的表格
      document.body.innerHTML = `
        <table>
          <tr>
            <th>Header 1</th>
            <th>Header 2</th>
          </tr>
          <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
          </tr>
        </table>
      `

      const table = document.querySelector("table") as HTMLTableElement
      const result = extractFormattedText(table)

      // 验证表格格式化正确
      expect(result).toContain("| Header 1 | Header 2 |")
      expect(result).toContain("| --- |")
      expect(result).toContain("| Cell 1 | Cell 2 |")
    })

    test("应处理没有行的空表格", () => {
      // 创建一个没有行的表格
      document.body.innerHTML = `<table></table>`

      const table = document.querySelector("table") as HTMLTableElement
      const result = extractFormattedText(table)

      // 验证退化处理逻辑
      expect(result).toContain("表格内容:")
    })
  })

  describe("handleLink", () => {
    test("应处理包含fancybox类的链接", () => {
      // 创建一个fancybox链接
      document.body.innerHTML = `
        <a href="large-image.jpg" class="fancybox" data-fancybox="gallery">
          <img src="thumb.jpg" alt="测试图片">
        </a>
      `

      const link = document.querySelector("a") as HTMLAnchorElement
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(link, imagesArray)

      // 验证使用了链接href作为图片源
      expect(result).toContain("![测试图片](large-image.jpg)")
      expect(imagesArray.length).toBe(1)
      expect(imagesArray[0].src).toBe("large-image.jpg")
    })

    test("应处理带有data-fancybox属性的链接", () => {
      // 创建一个带有data-fancybox属性的链接
      document.body.innerHTML = `
        <a href="large-image.jpg" data-fancybox="gallery">
          <img src="thumb.jpg" alt="测试图片">
        </a>
      `

      const link = document.querySelector("a") as HTMLAnchorElement
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(link, imagesArray)

      // 验证使用了链接href作为图片源
      expect(result).toContain("![测试图片](large-image.jpg)")
      expect(imagesArray.length).toBe(1)
      expect(imagesArray[0].src).toBe("large-image.jpg")
    })

    test("应处理链接中无图片元素但有src的情况", () => {
      // 创建一个带有链接但没有图片元素的链接
      document.body.innerHTML = `
        <a href="https://example.com">普通链接</a>
      `

      const link = document.querySelector("a") as HTMLAnchorElement
      const imagesArray: ImageInfo[] = []
      const result = extractFormattedText(link, imagesArray)

      // 验证链接被正确格式化
      expect(result).toContain("[普通链接](https://example.com)")
      expect(imagesArray.length).toBe(0)
    })
  })

  describe("cleanContent", () => {
    test("应保留代码块中的原始格式", () => {
      const content = `这是一个包含代码块的内容：
      
      \`\`\`javascript
      function test() {
        // 代码注释
        console.log("Hello World");
        
        return true;
      }
      \`\`\`

      以上是示例代码。`

      const cleanedContent = cleanContent(content)

      // 验证代码块内容保持不变
      expect(cleanedContent).toContain("function test()")
      expect(cleanedContent).toContain("// 代码注释")
      expect(cleanedContent).toContain('console.log("Hello World");')
      expect(cleanedContent).toContain("return true;")

      // 验证非代码块部分被清理
      expect(cleanedContent).not.toMatch(/\n+以上是示例代码。/)
    })

    test("应恢复Markdown标题格式", () => {
      const content = `
      # 一级标题
      
      ## 二级标题
      
      ### 三级标题
      
      #### 四级标题
      
      ##### 五级标题
      
      ###### 六级标题
      `

      const cleanedContent = cleanContent(content)

      // 验证Markdown标题格式被保留
      expect(cleanedContent).toContain("# 一级标题")
      expect(cleanedContent).toContain("## 二级标题")
      expect(cleanedContent).toContain("### 三级标题")
      expect(cleanedContent).toContain("#### 四级标题")
      expect(cleanedContent).toContain("##### 五级标题")
      expect(cleanedContent).toContain("###### 六级标题")
    })
  })
})
