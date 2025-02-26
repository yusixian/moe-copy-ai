import { useEffect, useState } from "react"

import { sendToBackground } from "@plasmohq/messaging"

import "./styles/global.css"

type ScrapedData = {
  title: string
  url: string
  articleContent: string
  author: string
  publishDate: string
  metadata: Record<string, string>
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

  // 添加调试信息
  const addDebugInfo = (info: string) => {
    console.log(info)
    setDebugInfo((prev) => prev + "\n" + info)
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
          setScrapedData(response.data)
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
          setScrapedData(response.data)
          setError(null)
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

  return (
    <div className="bg-white p-4 min-w-[400px] max-h-[600px] overflow-y-auto">
      <header className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">页面内容抓取器</h1>
        <p className="text-sm text-gray-600">
          抓取当前页面内容，转换为AI可读的格式
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
                <p className="whitespace-pre-line text-sm">
                  {scrapedData.articleContent}
                  {/* {truncateText(scrapedData.articleContent, 1000)} */}
                </p>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => {
                    // 将内容复制到剪贴板
                    navigator.clipboard
                      .writeText(scrapedData.articleContent)
                      .then(() => alert("内容已复制到剪贴板"))
                      .catch((err) => console.error("复制失败:", err))
                  }}
                  className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
                  复制全文
                </button>
              </div>
            </div>
          )}

          {Object.keys(scrapedData.metadata).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">元数据</h2>
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
                          "twitter:description"
                        ].includes(key)
                      )
                      .map(([key, value]) => (
                        <tr key={key}>
                          <td className="px-3 py-2 text-xs text-gray-900">
                            {key}
                          </td>
                          <td className="px-3 py-2 text-xs text-gray-500 whitespace-pre-wrap break-all">
                            {truncateText(value, 200)}
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
