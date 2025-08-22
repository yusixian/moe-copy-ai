import { Icon } from "@iconify/react"
import { memo, useCallback } from "react"

import { useStorage } from "@plasmohq/storage/hook"

import AiSummarySection from "~/components/AiSummarySection"
import ContentSection from "~/components/ContentSection"
import ImageGrid from "~/components/ImageGrid"
import MetadataImageSection from "~/components/MetadataImageSection"
import MetadataTable from "~/components/MetadataTable"
import SelectorDropdown from "~/components/SelectorDropdown"
import { useOpenOptionPage } from "~hooks/common/useOpenOptionPage"
import useScrapedData from "~hooks/useScrapedData"
import { cn } from "~utils"

import CopyableTextField from "./CopyableTextField"

interface PopupContentProps {
  className?: string
  onClose?: () => void
}

const PopupContent = ({ className, onClose }: PopupContentProps) => {
  const {
    isLoading,
    error,
    scrapedData,
    debugInfo,
    isMarkdown,
    handleRefresh,
    contentSelectors,
    authorSelectors,
    dateSelectors,
    titleSelectors,
    selectedSelectorIndices,
    handleSelectorChange,
    handleSelectContent
  } = useScrapedData()

  // 从存储中获取是否显示调试面板的设置
  const [showDebugPanel] = useStorage<string>("show_debug_panel", "true")

  // 从存储中获取悬浮窗显示设置
  const [showFloatButton, setShowFloatButton] = useStorage<string>(
    "show_float_button",
    "true"
  )

  // 添加临时隐藏状态，使用Plasmo的存储管理
  const [_, setTempHideButton] = useStorage<boolean>("temp_hide_button", false)

  const handleRefreshClick = useCallback(() => {
    handleRefresh()
  }, [handleRefresh])

  // 处理悬浮窗设置变更
  const handleFloatButtonToggle = useCallback(() => {
    const newValue = showFloatButton === "true" ? "false" : "true"
    setShowFloatButton(newValue)
  }, [showFloatButton, setShowFloatButton])

  // 处理临时隐藏悬浮窗
  const handleTempHideFloat = useCallback(() => {
    setTempHideButton(true)
    if (onClose) {
      onClose()
    }
  }, [setTempHideButton, onClose])

  // 图片加载错误处理
  const handleImageLoadError = useCallback((src: string) => {
    console.error("图片加载失败:", src)
  }, [])

  // 元数据图片加载错误处理
  const handleMetadataImageError = useCallback((label: string) => {
    console.error(`${label} 加载失败`)
  }, [])

  // 打开选项页面
  const handleOpenOptions = useOpenOptionPage()
  // 打开GitHub仓库
  const handleOpenGithub = useCallback(() => {
    window.open("https://github.com/yusixian/moe-copy-ai", "_blank")
  }, [])

  return (
    <div
      className={cn(
        "relative max-h-[600px] overflow-y-auto rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4",
        className
      )}>
      <header className="relative mb-4 flex flex-col gap-3 rounded-xl border-2 border-sky-200 bg-white p-3 shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center text-lg font-bold text-sky-600 sm:text-xl">
            <span className="truncate">Moe Copy AI</span>
            <span className="ml-2 flex-shrink-0">✨ 萌抓</span>
          </h1>
          <p className="text-xs text-indigo-600 sm:text-sm">
            抓取当前页面内容，转换为 AI 易读的格式 (。・ω・。)
          </p>
          <p className="mt-1 hidden text-xs text-blue-500 sm:block">
            支持原始格式(保留Markdown格式与换行)和紧凑版(无换行，文本更精简)两种模式
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center justify-end gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="transform rounded-full p-2 text-pink-500 transition hover:rotate-12 hover:bg-pink-50"
              title="关闭">
              <Icon icon="line-md:close" width="24" height="24" />
            </button>
          )}
          <button
            onClick={handleOpenGithub}
            className="transform rounded-full p-2 text-sky-500 transition hover:rotate-12 hover:bg-blue-50"
            title="访问GitHub">
            <Icon icon="mdi:github" width="24" height="24" />
          </button>
          <button
            onClick={handleOpenOptions}
            className="transform rounded-full p-2 text-sky-500 transition hover:rotate-12 hover:bg-blue-50"
            title="打开设置">
            <Icon icon="line-md:cog-filled-loop" width="24" height="24" />
          </button>
        </div>
      </header>

      {/* 悬浮窗开关区域 - 移动端优化 */}
      <div className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm font-medium text-gray-700">
            悬浮窗开关：
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            {/* 临时隐藏悬浮窗按钮 */}
            <button
              onClick={handleTempHideFloat}
              className="flex transform items-center justify-center gap-1 rounded-lg border border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 text-sm text-purple-600 shadow-sm transition-all hover:scale-105 hover:border-purple-400 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:shadow-md sm:px-2.5 sm:py-1.5"
              title="临时隐藏悬浮窗，刷新后会自动恢复">
              <span className="whitespace-nowrap">临时隐藏一次</span>
            </button>
            {/* 悬浮窗开关按钮 */}
            <button
              onClick={handleFloatButtonToggle}
              className="flex transform items-center justify-center gap-1 rounded-lg border border-sky-300 bg-gradient-to-r from-sky-50 to-blue-50 px-3 py-2 text-sm text-sky-600 shadow-sm transition-all hover:scale-105 hover:border-sky-400 hover:bg-gradient-to-r hover:from-sky-100 hover:to-blue-100 hover:shadow-md sm:px-2.5 sm:py-1.5"
              title={
                showFloatButton === "true"
                  ? "快速关闭网页悬浮窗（可在设置页面更改）"
                  : "快速开启网页悬浮窗（可在设置页面更改）"
              }>
              <span className="whitespace-nowrap font-medium">
                {showFloatButton === "true" ? "永久关闭" : "开启悬浮窗"}
              </span>
            </button>
          </div>
        </div>
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
                  onClick={handleRefreshClick}
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

      {/* 根据设置控制是否显示调试信息 */}
      {showDebugPanel === "true" && debugInfo && (
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
            <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold text-sky-600">
              <Icon
                icon="line-md:hash"
                width="24"
                height="24"
                className="flex-shrink-0"
              />
              <span>标题</span>
              {titleSelectors.length > 0 && (
                <SelectorDropdown
                  type="title"
                  selectors={titleSelectors}
                  selectedIndex={selectedSelectorIndices.title}
                  results={scrapedData?.selectorResults?.title || []}
                  onChange={(index) => handleSelectorChange("title", index)}
                  onSelectContent={(selector, contentIndex) =>
                    handleSelectContent("title", selector, contentIndex)
                  }
                />
              )}
            </h2>

            <CopyableTextField
              text={scrapedData.title}
              className="rounded-xl border border-sky-200 bg-blue-50 p-2"
            />
          </div>

          {/* 作者信息 */}
          {scrapedData.author && (
            <div className="mb-4">
              <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold text-sky-600">
                <Icon
                  icon="line-md:account"
                  width="24"
                  height="24"
                  className="flex-shrink-0"
                />
                <span>作者</span>
                {authorSelectors.length > 0 && (
                  <SelectorDropdown
                    type="author"
                    selectors={authorSelectors}
                    selectedIndex={selectedSelectorIndices.author}
                    results={scrapedData?.selectorResults?.author || []}
                    onChange={(index) => handleSelectorChange("author", index)}
                    onSelectContent={(selector, contentIndex) =>
                      handleSelectContent("author", selector, contentIndex)
                    }
                  />
                )}
              </h2>

              <CopyableTextField
                text={scrapedData.author}
                className="rounded-xl border border-sky-200 bg-blue-50 p-2"
              />
            </div>
          )}

          {/* 发布日期 */}
          {scrapedData.publishDate && (
            <div className="mb-4">
              <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold text-sky-600">
                <Icon
                  icon="line-md:calendar"
                  width="24"
                  height="24"
                  className="flex-shrink-0"
                />
                <span>发布日期</span>
                {dateSelectors.length > 0 && (
                  <SelectorDropdown
                    type="date"
                    selectors={dateSelectors}
                    selectedIndex={selectedSelectorIndices.date}
                    results={scrapedData?.selectorResults?.date || []}
                    onChange={(index) => handleSelectorChange("date", index)}
                    onSelectContent={(selector, contentIndex) =>
                      handleSelectContent("date", selector, contentIndex)
                    }
                  />
                )}
              </h2>
              <CopyableTextField
                text={scrapedData.publishDate}
                className="rounded-xl border border-sky-200 bg-blue-50 p-2"
              />
            </div>
          )}

          {/* URL */}
          <div className="mb-4">
            <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-sky-600">
              <Icon
                icon="line-md:link"
                width="24"
                height="24"
                className="flex-shrink-0"
              />
              <span>URL</span>
            </h2>
            <CopyableTextField
              text={scrapedData.url}
              className="rounded-xl border border-sky-200 bg-blue-50 p-2 text-xs"
            />
          </div>

          {/* 文章内容 */}
          {scrapedData.articleContent && (
            <div className="mb-4">
              {/* 标题行 - 移动端优化 */}
              <div className="mb-3">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex flex-wrap items-center gap-2 text-lg font-semibold text-sky-600">
                    <Icon
                      icon="line-md:file-document-twotone"
                      className="inline flex-shrink-0"
                      width="24"
                      height="24"
                    />
                    <span>文章内容</span>
                    {contentSelectors.length > 0 && (
                      <SelectorDropdown
                        type="content"
                        selectors={contentSelectors}
                        selectedIndex={selectedSelectorIndices.content}
                        results={scrapedData?.selectorResults?.content || []}
                        onChange={(index) =>
                          handleSelectorChange("content", index)
                        }
                        onSelectContent={(selector, contentIndex) =>
                          handleSelectContent("content", selector, contentIndex)
                        }
                      />
                    )}
                  </h2>

                  {/* 刷新按钮 - 移动端独立一行 */}
                  <button
                    onClick={handleRefreshClick}
                    disabled={isLoading}
                    className="flex transform items-center gap-1 rounded-lg border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 px-3 py-1.5 text-sm text-emerald-600 shadow-sm transition-all hover:scale-105 hover:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-100 hover:to-teal-100 disabled:opacity-50 disabled:hover:scale-100 sm:text-xs"
                    title="刷新✨">
                    <Icon
                      icon={
                        isLoading
                          ? "line-md:loading-alt-loop"
                          : "line-md:refresh-twotone"
                      }
                      className={isLoading ? "animate-spin" : ""}
                      width="16"
                      height="16"
                    />
                    <span className="font-medium">
                      {isLoading ? "正在抓取..." : "刷新✨"}
                    </span>
                    <span className="hidden text-xs opacity-75 sm:inline">
                      {isLoading ? "(｡◕‿◕｡)" : "✨"}
                    </span>
                  </button>
                </div>

                {/* 抓取模式标识 - 独立行，更好的移动端布局 */}
                {scrapedData.metadata && (
                  <div className="flex flex-wrap items-center gap-2">
                    {scrapedData.metadata["extraction:mode"] ===
                      "readability" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 px-2.5 py-1 text-xs font-medium text-green-700 shadow-sm">
                        <Icon
                          icon="line-md:target-twotone"
                          width="12"
                          height="12"
                          className="flex-shrink-0"
                        />
                        <span className="whitespace-nowrap">
                          Readability 模式
                        </span>
                      </span>
                    )}
                    {scrapedData.metadata["extraction:mode"] === "hybrid" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 px-2.5 py-1 text-xs font-medium text-blue-700 shadow-sm">
                        <Icon
                          icon="line-md:switch-filled"
                          width="12"
                          height="12"
                          className="flex-shrink-0"
                        />
                        <span className="whitespace-nowrap">混合模式</span>
                      </span>
                    )}
                    {(!scrapedData.metadata["extraction:mode"] ||
                      scrapedData.metadata["extraction:mode"] ===
                        "selector") && (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-gradient-to-r from-slate-100 to-gray-100 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
                          <Icon
                            icon="line-md:settings-twotone"
                            width="12"
                            height="12"
                            className="flex-shrink-0"
                          />
                          <span className="whitespace-nowrap">选择器模式</span>
                        </span>
                        {/* 如果用户配置的是混合模式，但实际使用的是选择器模式，显示回退提示 */}
                        {scrapedData.metadata["original:mode"] === "hybrid" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-gradient-to-r from-orange-100 to-yellow-100 px-2.5 py-1 text-xs font-medium text-orange-700 shadow-sm">
                            <Icon
                              icon="line-md:alert-twotone"
                              width="12"
                              height="12"
                              className="flex-shrink-0"
                            />
                            <span className="whitespace-nowrap">智能回退</span>
                            <span className="hidden opacity-75 sm:inline">
                              (｡•́︿•̀｡)
                            </span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 如果是混合模式，显示评估信息 */}
              {scrapedData.metadata?.["evaluation:reason"] && (
                <div className="mb-3 rounded-lg border border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 text-xs text-purple-700 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon="line-md:chart-rising-twotone"
                      width="14"
                      height="14"
                      className="text-purple-500"
                    />
                    <span className="font-medium">混合模式评估报告</span>
                    <span className="opacity-75">(◕‿◕)♡</span>
                  </div>
                  <p className="mt-1 pl-5">
                    {scrapedData.metadata["evaluation:reason"]}
                  </p>
                </div>
              )}

              {/* 如果发生了回退，显示回退说明 */}
              {scrapedData.metadata?.["fallback:reason"] && (
                <div className="mb-3 rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 px-3 py-2 text-xs text-orange-700 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon="line-md:alert-circle-twotone"
                      width="14"
                      height="14"
                      className="text-orange-500"
                    />
                    <span className="font-medium">智能回退说明</span>
                    <span className="opacity-75">(｡•́︿•̀｡)</span>
                  </div>
                  <div className="mt-1 pl-5">
                    <p className="text-orange-600">
                      {scrapedData.metadata["fallback:reason"]}
                    </p>
                    <p className="mt-1 text-xs text-orange-500 opacity-75">
                      💡 这是正常的智能回退机制，确保您总能获得内容～
                    </p>
                  </div>
                </div>
              )}
              <ContentSection
                articleContent={scrapedData.articleContent}
                cleanedContent={scrapedData.cleanedContent}
                isMarkdown={isMarkdown}
              />
            </div>
          )}
          {/* 添加AI摘要组件 */}
          <AiSummarySection
            content={scrapedData.articleContent}
            scrapedData={scrapedData}
          />
          {/* 页面图片 */}
          {scrapedData.images && scrapedData.images.length > 0 && (
            <div className="mb-4">
              <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-semibold text-sky-600">
                <Icon
                  icon="line-md:image"
                  width="24"
                  height="24"
                  className="flex-shrink-0"
                />
                <span>页面图片</span>
                <span className="text-sm font-normal text-sky-500">
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
              <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-sky-600">
                <Icon
                  icon="line-md:emoji-grin-twotone"
                  width="24"
                  height="24"
                  className="flex-shrink-0"
                />
                <span>元数据</span>
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
              {/* 元数据 json */}
              <CopyableTextField
                text={JSON.stringify(scrapedData.metadata)}
                className="rounded-xl border border-sky-200 bg-blue-50 p-2 text-xs"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border-2 border-sky-200 bg-white p-8 text-center text-gray-500 shadow-md">
          <p className="mb-2">(づ￣ ³￣)づ</p>
          没有找到内容。点击"刷新内容"按钮重试或新开标签页重试。
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
PopupContent.displayName = "PopupContent"
export default memo(PopupContent)
