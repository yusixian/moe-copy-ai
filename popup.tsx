import "./styles/global.css"

import { Icon } from "@iconify/react"
import { useEffect, useState } from "react"

import ContentSection from "~/components/ContentSection"
import ImageGrid from "~/components/ImageGrid"
import MetadataImageSection from "~/components/MetadataImageSection"
import MetadataTable from "~/components/MetadataTable"
import CatSVG from "~components/svg/CatSVG"
import useScrapedData from "~hooks/useScrapedData"
import { truncateText } from "~utils/format"

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
    <div className="relative max-h-[600px] min-w-[400px] overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <header className="relative z-20 mb-4 flex items-center justify-between rounded-xl border-2 border-sky-200 bg-white p-3 shadow-md">
        <div>
          <h1 className="flex items-center text-xl font-bold text-sky-600">
            Moe Copy AI <span className="ml-2">✨</span> 萌抓
          </h1>
          <p className="text-sm text-indigo-600">
            抓取当前页面内容，转换为 AI 易读的格式 (。・ω・。)
          </p>
          <p className="mt-1 text-xs text-blue-500">
            支持原始格式(保留Markdown格式与换行)和紧凑版(无换行，文本更精简)两种模式
          </p>
        </div>
        <div className="absolute right-10 top-[6.5rem] z-10 mr-2 h-14 w-14">
          <CatSVG className="size-14" />
          {/* 对话气泡  */}
          <div
            className={`absolute -right-3 -top-10 w-48 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-sky-100 p-2 text-xs transition-opacity duration-300 ${showBubble ? "opacity-90" : "opacity-0"} shadow-sm`}>
            <div className="absolute -bottom-2 right-8 h-4 w-4 rotate-45 transform border-b border-r border-blue-200 bg-sky-100"></div>
            <span className="text-center font-medium text-blue-500">
              喵～抓取中～♪(=^･ω･^=)
            </span>
          </div>
        </div>
        <button
          onClick={handleOpenOptions}
          className="relative z-30 transform rounded-full p-2 text-sky-500 transition hover:rotate-12 hover:bg-blue-50"
          title="打开设置">
          <Icon icon="line-md:cog-filled-loop" width="24" height="24" />
        </button>
      </header>

      <div className="relative z-20 mb-4">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex transform items-center justify-center rounded-xl border border-indigo-300 bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 font-medium text-white shadow-md transition-all hover:scale-105 hover:from-sky-600 hover:to-indigo-600 disabled:opacity-50">
          {isLoading ? (
            <>
              <span className="mr-2 animate-bounce">♪</span>
              加载中...
              <span className="ml-2 animate-bounce delay-100">♪</span>
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
        <div className="mb-4 rounded-xl border-2 border-pink-200 bg-pink-50 p-2.5 text-red-700 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex items-start">
            <div className="mr-2 flex items-center">
              <span className="inline-block transform text-xl transition-transform hover:rotate-12">
                ʕ•́ᴥ•̀ʔ
              </span>
              <Icon
                icon="mdi:heart-broken"
                className="mx-1 animate-pulse text-pink-500"
                width="20"
                height="20"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="mr-2 font-medium text-pink-600">哎呀～出错啦</p>
                <p className="flex-1 text-xs text-red-600">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="ml-1 flex transform items-center rounded-full border border-pink-300 bg-gradient-to-r from-pink-100 to-pink-200 px-2 py-1 text-xs text-pink-600 shadow-sm transition-all hover:scale-105 hover:from-pink-200 hover:to-pink-300">
                  <Icon
                    icon="mdi:refresh"
                    className="mr-1 animate-spin-slow"
                    width="14"
                    height="14"
                  />
                  再试一次喵～
                </button>
              </div>
              <div className="mt-1.5 rounded-lg border border-pink-200 bg-pink-100 p-1.5 text-xs">
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
        <div className="mb-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 text-xs text-indigo-700 shadow-md transition-all hover:shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="flex items-center text-sm font-medium">
              <Icon
                icon="line-md:coffee-half-empty-twotone-loop"
                className="mr-1.5 text-purple-500"
                width="18"
                height="18"
              />
              <span className="text-purple-600">调试小助手</span>
              <span className="ml-1.5 rounded-full border border-purple-200 bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-600">
                开发模式
              </span>
            </h3>
            <div className="flex items-center space-x-1">
              <button
                className="rounded-full p-1 text-purple-500 transition-colors hover:bg-purple-100"
                title="复制调试信息"
                onClick={() => {
                  navigator.clipboard.writeText(debugInfo)
                  alert("调试信息已复制到剪贴板 (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧")
                }}>
                <Icon icon="line-md:clipboard-check" width="14" height="14" />
              </button>
              <span className="animate-pulse text-[10px] text-purple-400">
                ฅ^•ﻌ•^ฅ
              </span>
            </div>
          </div>

          <div className="relative max-h-[120px] overflow-auto rounded-lg border border-indigo-100 bg-white/70 p-2">
            <div className="pointer-events-none absolute right-1 top-1 opacity-30">
              <span className="text-xs text-purple-300">♪(･ω･)ﾉ</span>
            </div>
            <pre className="text-indigo-800">{debugInfo}</pre>
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-purple-500">
            <div className="flex items-center">
              <Icon
                icon={
                  isLoading
                    ? "line-md:loading-twotone-loop"
                    : "line-md:confirm-circle"
                }
                className={`mr-1 ${isLoading ? "animate-spin text-indigo-400" : "text-green-500"}`}
                width="12"
                height="12"
              />
              <span>{isLoading ? "正在渲染..." : "渲染完成"}</span>
              {!isLoading && (
                <span className="ml-1.5 rounded-full border border-green-200 bg-green-100 px-1.5 py-0.5 text-[8px] text-green-600">
                  成功 (｡•ᴗ•｡)
                </span>
              )}
            </div>
            <div className="flex items-center">
              <div className="mr-1.5 flex items-center rounded-full border border-purple-200 bg-purple-100/70 px-1.5 py-0.5">
                <Icon
                  icon="line-md:computer-twotone"
                  className="mr-1 text-indigo-500"
                  width="10"
                  height="10"
                />
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
              <button
                className="rounded-full p-1 text-purple-500 transition-colors hover:bg-purple-100"
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
        <div className="flex flex-col items-center justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-4 border-t-4 border-blue-500"></div>
          <p className="mt-3 animate-pulse text-sky-500">加载中... (●'◡'●)</p>
        </div>
      ) : scrapedData ? (
        <div className="rounded-xl border-2 border-indigo-200 bg-white p-4 shadow-lg">
          {/* 页面标题 */}
          <div className="mb-4">
            <h2 className="mb-2 flex items-center text-lg font-semibold text-sky-600">
              <span className="mr-2">📑</span>页面标题
            </h2>
            <p className="rounded-xl border border-sky-200 bg-blue-50 p-2">
              {scrapedData.title}
            </p>
          </div>

          {/* 作者信息 */}
          {scrapedData.author && (
            <div className="mb-4">
              <h2 className="mb-2 flex items-center text-lg font-semibold text-sky-600">
                <span className="mr-2">👤</span>作者
              </h2>
              <p className="rounded-xl border border-sky-200 bg-blue-50 p-2">
                {scrapedData.author}
              </p>
            </div>
          )}

          {/* 发布日期 */}
          {scrapedData.publishDate && (
            <div className="mb-4">
              <h2 className="mb-2 flex items-center text-lg font-semibold text-sky-600">
                <span className="mr-2">🗓️</span>发布日期
              </h2>
              <p className="rounded-xl border border-sky-200 bg-blue-50 p-2">
                {scrapedData.publishDate}
              </p>
            </div>
          )}

          {/* URL */}
          <div className="mb-4">
            <h2 className="mb-2 flex items-center text-lg font-semibold text-sky-600">
              <span className="mr-2">🔗</span>URL
            </h2>
            <p className="break-all rounded-xl border border-sky-200 bg-blue-50 p-2 text-xs">
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
              <h2 className="mb-2 flex items-center text-lg font-semibold text-sky-600">
                <span className="mr-2">🖼️</span>页面图片
                <span className="ml-1.5 text-sm font-normal text-sky-500">
                  ({scrapedData.images.length}张)
                </span>
              </h2>
              <ImageGrid
                images={scrapedData.images}
                onLoadError={handleImageLoadError}
              />
            </div>
          )}

          {/* 元数据 */}
          {Object.keys(scrapedData.metadata).length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center text-lg font-semibold text-sky-600">
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
                onLoadError={handleMetadataImageError}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-sky-200 bg-white p-8 text-center text-gray-500 shadow-md">
          <p className="mb-2">(づ￣ ³￣)づ</p>
          没有找到内容。点击"刷新内容"按钮重试。
        </div>
      )}

      <footer className="mt-4 flex items-center justify-center border-t border-sky-200 pt-4 text-center text-xs text-sky-500">
        <span className="mr-1">♡</span>
        Moe Copy AI - 萌抓 v1.0
        <span className="ml-1">♡</span>
      </footer>
    </div>
  )
}

export default IndexPopup
