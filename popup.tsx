import MarkdownIt from "markdown-it"
import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import "./styles/global.css"

type ScrapedData = {
  title: string
  url: string
  articleContent: string
  cleanedContent: string
  author: string
  publishDate: string
  metadata: Record<string, string>
  images?: Array<{ src: string; alt: string; title: string; index: number }>
}

// 定义响应类型
interface ScrapeResponse {
  success: boolean
  data?: ScrapedData
  error?: string
}

function IndexPopup() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isMarkdown, setIsMarkdown] = useState(false)
  const [showCleanedContent, setShowCleanedContent] = useState(false)

  // 初始化 markdown-it 实例
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  })

  // 添加调试信息
  const addDebugInfo = (info: string) => {
    console.log(info)
    setDebugInfo((prev) => prev + "\n" + info)
  }

  // 检测内容是否为 Markdown
  const detectMarkdown = (content: string): boolean => {
    if (!content) return false

    // 常见的 Markdown 标记
    const markdownPatterns = [
      /^#+ .+$/m, // 标题
      /\[.+\]\(.+\)/, // 链接
      /!\[.+\]\(.+\)/, // 图片
      /^- .+$/m, // 无序列表
      /^[0-9]+\. .+$/m, // 有序列表
      /^>.+$/m, // 引用
      /`{1,3}[^`]+`{1,3}/, // 代码块或行内代码
      /^\s*```[\s\S]+?```\s*$/m, // 代码块
      /^\|(.+\|)+$/m, // 表格
      /^-{3,}$/m, // 水平线
      /\*\*.+\*\*/, // 粗体
      /\*.+\*/, // 斜体
      /~~.+~~/ // 删除线
    ]

    // 如果匹配到任意一个 Markdown 标记，则认为是 Markdown 内容
    return markdownPatterns.some((pattern) => pattern.test(content))
  }

  // 处理文本格式，保留必要的换行
  const formatContent = (content: string): string => {
    if (!content) return ""

    // 保留段落间的空行（通常是连续两个换行）
    // 但移除过多的连续空行（3个以上的换行替换为2个）
    return content
      .replace(/\n{3,}/g, "\n\n") // 将3个以上连续换行替换为2个
      .replace(/\r\n/g, "\n") // 统一换行符
  }

  // 在组件挂载时抓取当前页面内容
  useEffect(() => {
    const fetchScrapedContent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        addDebugInfo("开始请求抓取内容...")

        const response = await sendToBackground<any, ScrapeResponse>({
          name: "getScrapedContent"
        })

        addDebugInfo(
          "收到响应: " + JSON.stringify(response).substring(0, 100) + "..."
        )

        if (response && response.success && response.data) {
          addDebugInfo("抓取成功, 标题: " + response.data.title)

          // 处理文章内容，保留必要的格式
          if (response.data.articleContent) {
            response.data.articleContent = formatContent(
              response.data.articleContent
            )
          }

          setScrapedData(response.data)
          // 检测是否为 Markdown 内容
          if (response.data.articleContent) {
            setIsMarkdown(detectMarkdown(response.data.articleContent))
          }
        } else {
          const errorMsg = response?.error || "获取内容失败"
          addDebugInfo("抓取失败: " + errorMsg)
          setError(errorMsg)
        }
      } catch (err) {
        console.error("抓取内容时出错:", err)
        addDebugInfo("抓取异常: " + JSON.stringify(err))
        setError("抓取内容时出错: " + (err.message || "未知错误"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchScrapedContent()
  }, [])

  // 处理手动刷新
  const handleRefresh = () => {
    setIsLoading(true)
    addDebugInfo("手动刷新开始...")

    sendToBackground<any, ScrapeResponse>({
      name: "getScrapedContent"
    })
      .then((response) => {
        setIsLoading(false)
        addDebugInfo(
          "刷新响应: " + JSON.stringify(response).substring(0, 100) + "..."
        )

        if (response && response.success && response.data) {
          addDebugInfo("刷新成功, 标题: " + response.data.title)

          // 处理文章内容，保留必要的格式
          if (response.data.articleContent) {
            response.data.articleContent = formatContent(
              response.data.articleContent
            )
          }

          setScrapedData(response.data)
          setError(null)
          // 检测是否为 Markdown 内容
          if (response.data.articleContent) {
            setIsMarkdown(detectMarkdown(response.data.articleContent))
          }
        } else {
          const errorMsg = response?.error || "刷新内容失败"
          addDebugInfo("刷新失败: " + errorMsg)
          setError(errorMsg)
        }
      })
      .catch((err) => {
        setIsLoading(false)
        addDebugInfo("刷新异常: " + JSON.stringify(err))
        setError("刷新内容时出错: " + (err.message || "未知错误"))
      })
  }

  // 截断长文本显示
  const truncateText = (text: string, maxLength = 300) => {
    if (!text) return ""
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text
  }

  // 渲染 Markdown 内容
  const renderMarkdown = (content: string) => {
    // 在渲染前确保内容格式正确
    const formattedContent = formatContent(content)
    return { __html: md.render(formattedContent || "") }
  }

  // 切换预览模式
  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  // 切换内容版本
  const toggleContentVersion = () => {
    setShowCleanedContent(!showCleanedContent)
  }

  // 获取当前要显示的内容
  const getCurrentContent = () => {
    if (!scrapedData) return ""
    return showCleanedContent
      ? scrapedData.cleanedContent
      : scrapedData.articleContent
  }

  return (
    <div className="bg-white p-4 min-w-[400px] max-h-[600px] overflow-y-auto">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">页面内容抓取器</h1>
        <p className="text-sm text-gray-600">
          抓取当前页面内容，转换为AI可读的格式
        </p>
        <p className="text-xs text-gray-500 mt-1">
          支持原始格式(保留Markdown格式与换行)和紧凑版(无换行，文本更精简)两种模式
        </p>
      </header>

      <div className="mb-4">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50">
          {isLoading ? "加载中..." : "刷新内容"}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-100 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* 仅在开发模式显示调试信息 */}
      {process.env.NODE_ENV !== "production" && debugInfo && (
        <div className="p-2 mb-4 bg-gray-100 text-gray-700 rounded border border-gray-200 text-xs overflow-auto max-h-[100px]">
          <pre>{debugInfo}</pre>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : scrapedData ? (
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">页面标题</h2>
            <p className="p-2 bg-white rounded border border-gray-300">
              {scrapedData.title}
            </p>
          </div>

          {scrapedData.author && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">作者</h2>
              <p className="p-2 bg-white rounded border border-gray-300">
                {scrapedData.author}
              </p>
            </div>
          )}

          {scrapedData.publishDate && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">发布日期</h2>
              <p className="p-2 bg-white rounded border border-gray-300">
                {scrapedData.publishDate}
              </p>
            </div>
          )}

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">URL</h2>
            <p className="p-2 bg-white rounded border border-gray-300 break-all text-xs">
              {scrapedData.url}
            </p>
          </div>

          {scrapedData.articleContent && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">文章内容</h2>
              <div className="p-2 bg-white rounded border border-gray-300 max-h-[200px] overflow-y-auto">
                {isPreviewMode ? (
                  <div
                    className="markdown-preview"
                    dangerouslySetInnerHTML={renderMarkdown(
                      getCurrentContent()
                    )}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm font-normal">
                    {getCurrentContent()}
                  </pre>
                )}
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={toggleContentVersion}
                  className="text-xs px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">
                  {showCleanedContent ? "显示原始格式" : "显示紧凑版(无换行)"}
                </button>
                {isMarkdown && (
                  <button
                    onClick={togglePreview}
                    className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                    {isPreviewMode ? "查看原文" : "预览 Markdown"}
                  </button>
                )}
                <button
                  onClick={() => {
                    // 将内容复制到剪贴板
                    navigator.clipboard
                      .writeText(getCurrentContent())
                      .then(() => alert("内容已复制到剪贴板"))
                      .catch((err) => console.error("复制失败:", err))
                  }}
                  className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                  复制全文
                </button>
              </div>
            </div>
          )}

          {/* 添加页面图片展示区域 */}
          {scrapedData.images && scrapedData.images.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">页面图片</h2>
              <div className="p-2 bg-white rounded border border-gray-300">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {scrapedData.images.map((img, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded overflow-hidden">
                      <div className="relative w-full h-[120px] flex items-center justify-center bg-white">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                        </div>
                        <img
                          src={img.src}
                          alt={img.alt || "页面图片"}
                          title={img.title || img.alt || ""}
                          className="relative z-10 max-w-full max-h-[120px] object-contain"
                          onLoad={(e) => {
                            const parent = (e.target as HTMLElement)
                              .parentElement
                            if (parent) {
                              const loader =
                                parent.querySelector(".animate-pulse")
                              if (loader) loader.classList.add("hidden")
                            }
                          }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.style.display = "none"
                            const parent = img.parentElement
                            if (parent) {
                              const loader =
                                parent.querySelector(".animate-pulse")
                              if (loader) loader.classList.add("hidden")
                              parent.innerHTML +=
                                '<div class="text-red-500 text-xs p-2">图片加载失败</div>'
                            }
                            addDebugInfo(`图片加载失败: ${img.src}`)
                          }}
                        />
                      </div>
                      <div className="p-1 text-xs bg-gray-50 truncate text-center border-t border-gray-200">
                        {img.alt || img.title || `图片 #${img.index}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {Object.keys(scrapedData.metadata).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">元数据</h2>

              {/* 添加图片展示区 */}
              {(scrapedData.metadata["og:image"] ||
                scrapedData.metadata["twitter:image"] ||
                scrapedData.metadata["image"]) && (
                <div className="mb-4">
                  <h3 className="text-md font-medium mb-2">元数据图片</h3>
                  <div className="flex flex-wrap gap-2">
                    {scrapedData.metadata["og:image"] && (
                      <div className="border border-gray-300 rounded overflow-hidden bg-white">
                        <div className="relative w-full h-[150px] flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                          </div>
                          <img
                            src={scrapedData.metadata["og:image"]}
                            alt="Open Graph 图片"
                            className="relative z-10 max-w-full max-h-[150px] object-contain"
                            onLoad={(e) => {
                              const parent = (e.target as HTMLElement)
                                .parentElement
                              if (parent) {
                                const loader =
                                  parent.querySelector(".animate-pulse")
                                if (loader) loader.classList.add("hidden")
                              }
                            }}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement
                              img.style.display = "none"
                              const parent = img.parentElement
                              if (parent) {
                                const loader =
                                  parent.querySelector(".animate-pulse")
                                if (loader) loader.classList.add("hidden")
                                parent.innerHTML +=
                                  '<div class="text-red-500 text-xs p-2">图片加载失败</div>'
                              }
                              addDebugInfo("og:image 加载失败")
                            }}
                          />
                        </div>
                        <div className="text-xs p-1 bg-gray-100 text-center border-t border-gray-200">
                          og:image
                        </div>
                      </div>
                    )}
                    {scrapedData.metadata["twitter:image"] && (
                      <div className="border border-gray-300 rounded overflow-hidden bg-white">
                        <div className="relative w-full h-[150px] flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                          </div>
                          <img
                            src={scrapedData.metadata["twitter:image"]}
                            alt="Twitter 图片"
                            className="relative z-10 max-w-full max-h-[150px] object-contain"
                            onLoad={(e) => {
                              const parent = (e.target as HTMLElement)
                                .parentElement
                              if (parent) {
                                const loader =
                                  parent.querySelector(".animate-pulse")
                                if (loader) loader.classList.add("hidden")
                              }
                            }}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement
                              img.style.display = "none"
                              const parent = img.parentElement
                              if (parent) {
                                const loader =
                                  parent.querySelector(".animate-pulse")
                                if (loader) loader.classList.add("hidden")
                                parent.innerHTML +=
                                  '<div class="text-red-500 text-xs p-2">图片加载失败</div>'
                              }
                              addDebugInfo("twitter:image 加载失败")
                            }}
                          />
                        </div>
                        <div className="text-xs p-1 bg-gray-100 text-center border-t border-gray-200">
                          twitter:image
                        </div>
                      </div>
                    )}
                    {scrapedData.metadata["image"] && (
                      <div className="border border-gray-300 rounded overflow-hidden bg-white">
                        <div className="relative w-full h-[150px] flex items-center justify-center">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                          </div>
                          <img
                            src={scrapedData.metadata["image"]}
                            alt="元数据图片"
                            className="relative z-10 max-w-full max-h-[150px] object-contain"
                            onLoad={(e) => {
                              const parent = (e.target as HTMLElement)
                                .parentElement
                              if (parent) {
                                const loader =
                                  parent.querySelector(".animate-pulse")
                                if (loader) loader.classList.add("hidden")
                              }
                            }}
                            onError={(e) => {
                              const img = e.target as HTMLImageElement
                              img.style.display = "none"
                              const parent = img.parentElement
                              if (parent) {
                                const loader =
                                  parent.querySelector(".animate-pulse")
                                if (loader) loader.classList.add("hidden")
                                parent.innerHTML +=
                                  '<div class="text-red-500 text-xs p-2">图片加载失败</div>'
                              }
                              addDebugInfo("image 加载失败")
                            }}
                          />
                        </div>
                        <div className="text-xs p-1 bg-gray-100 text-center border-t border-gray-200">
                          image
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white rounded border border-gray-300 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        属性
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        值
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(scrapedData.metadata)
                      .filter(([key]) =>
                        [
                          "description",
                          "keywords",
                          "og:title",
                          "og:description",
                          "og:image",
                          "twitter:title",
                          "twitter:description",
                          "twitter:image",
                          "image"
                        ].includes(key)
                      )
                      .map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {key}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 whitespace-pre-wrap break-all">
                            {truncateText(value, 200)}
                            {/* 为图片类型显示缩略图 */}
                            {(key === "og:image" ||
                              key === "twitter:image" ||
                              key === "image") &&
                              value && (
                                <div className="mt-1">
                                  <div className="relative w-[120px] h-[80px] border border-gray-200 rounded overflow-hidden bg-white">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="animate-pulse bg-gray-200 w-full h-full"></div>
                                    </div>
                                    <img
                                      src={value}
                                      alt={`${key} 预览`}
                                      className="relative z-10 max-w-full max-h-[80px] w-full h-full object-contain"
                                      onLoad={(e) => {
                                        const parent = (e.target as HTMLElement)
                                          .parentElement
                                        if (parent) {
                                          const loader =
                                            parent.querySelector(
                                              ".animate-pulse"
                                            )
                                          if (loader)
                                            loader.classList.add("hidden")
                                        }
                                      }}
                                      onError={(e) => {
                                        const img = e.target as HTMLImageElement
                                        img.style.display = "none"
                                        const parent = img.parentElement
                                        if (parent) {
                                          const loader =
                                            parent.querySelector(
                                              ".animate-pulse"
                                            )
                                          if (loader)
                                            loader.classList.add("hidden")
                                          parent.innerHTML +=
                                            '<div class="text-red-500 text-xs p-2">图片加载失败</div>'
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500">
          没有找到内容。点击"刷新内容"按钮重试。
        </div>
      )}

      <footer className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
        网页内容抓取器 MVP 版本
      </footer>
    </div>
  )
}

export default IndexPopup
