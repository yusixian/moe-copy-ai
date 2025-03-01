import "./styles/global.css"

import { Icon } from "@iconify/react"
import { useEffect, useState } from "react"

import ContentSection from "~/components/ContentSection"
import ImageGrid from "~/components/ImageGrid"
import MetadataImageSection from "~/components/MetadataImageSection"
import MetadataTable from "~/components/MetadataTable"
import { truncateText } from "~/components/utils"
import CatSVG from "~components/svg/CatSVG"
import useScrapedData from "~hooks/useScrapedData"

function IndexPopup() {
  const {
    isLoading,
    error,
    scrapedData,
    debugInfo,
    isMarkdown,
    handleRefresh
  } = useScrapedData()

  // 添加气泡出现的动画状态
  const [showBubble, setShowBubble] = useState(false)
  // 添加眨眼动画状态
  const [blinking, setBlinking] = useState(false)

  // 控制眨眼动画
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true)
      setTimeout(() => setBlinking(false), 200)
    }, 3000)

    return () => clearInterval(blinkInterval)
  }, [])

  // 控制气泡显示
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowBubble(true)
    }, 500)

    return () => clearTimeout(timeout)
  }, [])

  // 图片加载错误处理
  const handleImageLoadError = (src: string) => {
    console.error("图片加载失败:", src)
  }

  // 元数据图片加载错误处理
  const handleMetadataImageError = (label: string) => {
    console.error(`${label} 加载失败`)
  }

  // 打开选项页面
  const handleOpenOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 min-w-[400px] max-h-[600px] overflow-y-auto relative">
      <header className="mb-4 flex justify-between items-center bg-white p-3 rounded-xl shadow-md border-2 border-sky-200 relative z-20">
        <div>
          <h1 className="text-xl font-bold text-sky-600 flex items-center">
            <span className="mr-2">✨</span>
            萌萌页面抓取器
            <span className="ml-2">✨</span>
          </h1>
          <p className="text-sm text-indigo-600">
            抓取当前页面内容，转换为AI可读的格式 (。・ω・。)
          </p>
          <p className="text-xs text-blue-500 mt-1">
            支持原始格式(保留Markdown格式与换行)和紧凑版(无换行，文本更精简)两种模式
          </p>
        </div>
        <div className="absolute top-[6.5rem] right-10 w-14 h-14 z-10 mr-2">
          <CatSVG className="size-14" />
          {/* 对话气泡  */}
          <div
            className={`absolute -top-10 -right-3 bg-gradient-to-br from-blue-50 to-sky-100 p-2 rounded-2xl border border-blue-200 text-xs w-48 transition-opacity duration-300 ${showBubble ? "opacity-90" : "opacity-0"} shadow-sm`}>
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-sky-100 border-r border-b border-blue-200 transform rotate-45"></div>
            <span className="text-blue-500 text-center font-medium">
              喵～抓取中～♪(=^･ω･^=)
            </span>
          </div>
        </div>
        <button
          onClick={handleOpenOptions}
          className="p-2 rounded-full hover:bg-blue-50 text-sky-500 transform hover:rotate-12 transition relative z-30"
          title="打开设置">
          <Icon icon="line-md:cog-filled-loop" width="24" height="24" />
        </button>
      </header>

      <div className="mb-4 relative z-20">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl hover:from-sky-600 hover:to-indigo-600 disabled:opacity-50 shadow-md transform hover:scale-105 transition-all flex items-center justify-center font-medium border border-indigo-300">
          {isLoading ? (
            <>
              <span className="animate-bounce mr-2">♪</span>
              加载中...
              <span className="animate-bounce ml-2 delay-100">♪</span>
            </>
          ) : (
            <>
              <span className="mr-2">✨</span> 刷新内容{" "}
              <span className="ml-2">✨</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-2.5 mb-4 bg-pink-50 text-red-700 rounded-xl border-2 border-pink-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="flex items-center mr-2">
              <span className="text-xl inline-block transform hover:rotate-12 transition-transform">
                ʕ•́ᴥ•̀ʔ
              </span>
              <Icon
                icon="mdi:heart-broken"
                className="text-pink-500 mx-1 animate-pulse"
                width="20"
                height="20"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-medium text-pink-600 mr-2">哎呀～出错啦</p>
                <p className="text-xs text-red-600 flex-1">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="ml-1 px-2 py-1 bg-gradient-to-r from-pink-100 to-pink-200 hover:from-pink-200 hover:to-pink-300 text-pink-600 rounded-full text-xs flex items-center border border-pink-300 transition-all transform hover:scale-105 shadow-sm">
                  <Icon
                    icon="mdi:refresh"
                    className="mr-1 animate-spin-slow"
                    width="14"
                    height="14"
                  />
                  再试一次喵～
                </button>
              </div>
              <div className="mt-1.5 text-xs bg-pink-100 p-1.5 rounded-lg border border-pink-200">
                <div className="flex items-start">
                  <span className="mr-1 mt-0.5">🙀</span>
                  <div>
                    <p>可能是：网络不太好、页面结构变化或内容还没加载完呢～</p>
                    <p className="mt-0.5 flex items-center">
                      <span className="mr-1">💕</span>
                      <span>
                        试试：刷新页面后再抓取一次，或者等页面完全加载好再用吧～
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 仅在开发模式显示调试信息 */}
      {process.env.NODE_ENV !== "production" && debugInfo && (
        <div className="p-3 mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-xl border-2 border-indigo-200 text-xs shadow-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm flex items-center">
              <Icon
                icon="line-md:coffee-half-empty-twotone-loop"
                className="mr-1.5 text-purple-500"
                width="18"
                height="18"
              />
              <span className="text-purple-600">调试小助手</span>
              <span className="ml-1.5 bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full text-[10px] border border-purple-200">
                开发模式
              </span>
            </h3>
            <div className="flex items-center space-x-1">
              <button
                className="p-1 rounded-full hover:bg-purple-100 text-purple-500 transition-colors"
                title="复制调试信息"
                onClick={() => {
                  navigator.clipboard.writeText(debugInfo)
                  alert("调试信息已复制到剪贴板 (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧")
                }}>
                <Icon icon="line-md:clipboard-check" width="14" height="14" />
              </button>
              <span className="text-[10px] text-purple-400 animate-pulse">
                ฅ^•ﻌ•^ฅ
              </span>
            </div>
          </div>

          <div className="overflow-auto max-h-[120px] bg-white/70 p-2 rounded-lg border border-indigo-100 relative">
            <div className="absolute right-1 top-1 opacity-30 pointer-events-none">
              <span className="text-xs text-purple-300">♪(･ω･)ﾉ</span>
            </div>
            <pre className="text-indigo-800">{debugInfo}</pre>
          </div>

          <div className="mt-2 flex justify-between items-center text-[10px] text-purple-500">
            <div className="flex items-center">
              <Icon
                icon={
                  isLoading
                    ? "line-md:loading-twotone-loop"
                    : "line-md:confirm-circle"
                }
                className={`mr-1 ${isLoading ? "text-indigo-400 animate-spin" : "text-green-500"}`}
                width="12"
                height="12"
              />
              <span>{isLoading ? "正在渲染..." : "渲染完成"}</span>
              {!isLoading && (
                <span className="ml-1.5 bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full text-[8px] border border-green-200">
                  成功 (｡•ᴗ•｡)
                </span>
              )}
            </div>
            <div className="flex items-center">
              <div className="flex items-center bg-purple-100/70 px-1.5 py-0.5 rounded-full border border-purple-200 mr-1.5">
                <Icon
                  icon="line-md:computer-twotone"
                  className="mr-1 text-indigo-500"
                  width="10"
                  height="10"
                />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <button
                className="p-1 rounded-full hover:bg-purple-100 text-purple-500 transition-colors"
                title="查看更多调试信息"
                onClick={() => {
                  const details = {
                    页面状态: isLoading ? "加载中" : "已加载",
                    数据大小: scrapedData
                      ? JSON.stringify(scrapedData).length + " 字节"
                      : "无数据",
                    浏览器信息: navigator.userAgent,
                    时间戳: new Date().toISOString()
                  }
                  alert(
                    JSON.stringify(details, null, 2) + "\n\n(◕ᴗ◕✿) 调试信息"
                  )
                }}>
                <Icon icon="line-md:information" width="12" height="12" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-blue-500"></div>
          <p className="text-sky-500 mt-3 animate-pulse">加载中... (●'◡'●)</p>
        </div>
      ) : scrapedData ? (
        <div className="bg-white p-4 rounded-xl border-2 border-indigo-200 shadow-lg">
          {/* 页面标题 */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 text-sky-600 flex items-center">
              <span className="mr-2">📑</span>页面标题
            </h2>
            <p className="p-2 bg-blue-50 rounded-xl border border-sky-200">
              {scrapedData.title}
            </p>
          </div>

          {/* 作者信息 */}
          {scrapedData.author && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 text-sky-600 flex items-center">
                <span className="mr-2">👤</span>作者
              </h2>
              <p className="p-2 bg-blue-50 rounded-xl border border-sky-200">
                {scrapedData.author}
              </p>
            </div>
          )}

          {/* 发布日期 */}
          {scrapedData.publishDate && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 text-sky-600 flex items-center">
                <span className="mr-2">🗓️</span>发布日期
              </h2>
              <p className="p-2 bg-blue-50 rounded-xl border border-sky-200">
                {scrapedData.publishDate}
              </p>
            </div>
          )}

          {/* URL */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 text-sky-600 flex items-center">
              <span className="mr-2">🔗</span>URL
            </h2>
            <p className="p-2 bg-blue-50 rounded-xl border border-sky-200 break-all text-xs">
              {scrapedData.url}
            </p>
          </div>

          {/* 文章内容 */}
          {scrapedData.articleContent && (
            <ContentSection
              articleContent={scrapedData.articleContent}
              cleanedContent={scrapedData.cleanedContent}
              isMarkdown={isMarkdown}
            />
          )}

          {/* 页面图片 */}
          {scrapedData.images && scrapedData.images.length > 0 && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2 text-sky-600 flex items-center">
                <span className="mr-2">🖼️</span>页面图片
              </h2>
              <div className="p-2 bg-blue-50 rounded-xl border border-sky-200">
                <ImageGrid
                  images={scrapedData.images}
                  onLoadError={handleImageLoadError}
                />
              </div>
            </div>
          )}

          {/* 元数据 */}
          {Object.keys(scrapedData.metadata).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2 text-sky-600 flex items-center">
                <span className="mr-2">📊</span>元数据
              </h2>

              {/* 元数据图片 */}
              <MetadataImageSection
                metadata={scrapedData.metadata}
                onLoadError={handleMetadataImageError}
              />

              {/* 元数据表格 */}
              <MetadataTable
                metadata={scrapedData.metadata}
                truncateText={truncateText}
                onLoadError={handleMetadataImageError}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 text-gray-500 bg-white rounded-xl border-2 border-sky-200 shadow-md">
          <p className="mb-2">(づ￣ ³￣)づ</p>
          没有找到内容。点击"刷新内容"按钮重试。
        </div>
      )}

      <footer className="mt-4 pt-4 border-t border-sky-200 text-center text-xs text-sky-500 flex justify-center items-center">
        <span className="mr-1">♡</span>
        Moe Copy AI - 萌抓 v1.0
        <span className="ml-1">♡</span>
      </footer>
    </div>
  )
}

export default IndexPopup
