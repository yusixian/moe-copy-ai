import { Icon } from "@iconify/react"
import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"
import { useClipboard } from "foxact/use-clipboard"
import { memo, useCallback } from "react"

import AiSummarySection from "~/components/AiSummarySection"
import ContentSection from "~/components/ContentSection"
import ImageGrid from "~/components/ImageGrid"
import MetadataImageSection from "~/components/MetadataImageSection"
import MetadataTable from "~/components/MetadataTable"
import SelectorDropdown from "~/components/SelectorDropdown"
import { Button } from "~/components/ui/button"
import { Collapsible } from "~/components/ui/collapsible"
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

  const { copy: copyDebugInfo } = useClipboard()

  // 打开侧边栏（批量抓取功能已移至侧边栏）
  const handleOpenSidePanel = async () => {
    try {
      // 通过 Plasmo messaging 打开侧边栏（兼容内容脚本和扩展页面）
      await sendToBackground({ name: "openSidePanel" })
    } catch (error) {
      console.error("打开侧边栏失败:", error)
    }
  }

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
      <header className="relative mb-4 flex flex-col gap-3 rounded-xl border border-blue-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center font-bold text-lg text-blue-600 sm:text-xl">
            <span className="truncate">Moe Copy AI</span>
            <span className="ml-2 flex-shrink-0">萌抓</span>
          </h1>
          <p className="text-blue-500 text-xs sm:text-sm">
            抓取当前页面内容，转换为 AI 易读的格式
          </p>
          <p className="mt-1 hidden text-blue-400 text-xs sm:block">
            支持原始格式(保留Markdown格式与换行)和紧凑版(无换行，文本更精简)两种模式
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center justify-end gap-2">
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="关闭">
              <Icon icon="line-md:close" width="20" height="20" />
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenSidePanel}
            title="批量抓取文档（在侧边栏中打开）">
            <Icon
              icon="mdi:file-document-multiple-outline"
              width="16"
              height="16"
              className="mr-1.5"
            />
            批量抓取
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenGithub}
            title="访问GitHub">
            <Icon icon="mdi:github" width="20" height="20" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenOptions}
            title="打开设置">
            <Icon icon="line-md:cog-filled-loop" width="20" height="20" />
          </Button>
        </div>
      </header>

      {/* 悬浮窗开关区域 */}
      <div className="mb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium text-gray-700 text-sm">
            悬浮窗开关：
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTempHideFloat}
              title="临时隐藏悬浮窗，刷新后会自动恢复">
              临时隐藏一次
            </Button>
            <Button
              variant={showFloatButton === "true" ? "danger" : "default"}
              size="sm"
              onClick={handleFloatButtonToggle}
              title={
                showFloatButton === "true"
                  ? "快速关闭网页悬浮窗（可在设置页面更改）"
                  : "快速开启网页悬浮窗（可在设置页面更改）"
              }>
              {showFloatButton === "true" ? "永久关闭" : "开启悬浮窗"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
          <div className="flex items-start gap-3">
            <Icon
              icon="mdi:alert-circle"
              className="mt-0.5 flex-shrink-0 text-red-500"
              width="20"
              height="20"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-red-600">出错了</p>
                <p className="flex-1 text-red-600 text-sm">{error}</p>
                <Button variant="outline" size="xs" onClick={handleRefreshClick}>
                  <Icon icon="mdi:refresh" width="14" height="14" className="mr-1" />
                  重试
                </Button>
              </div>
              <div className="mt-2 rounded border border-red-200 bg-red-100/50 p-2 text-xs">
                <p>可能原因：网络问题、页面结构变化或内容未加载完成</p>
                <p className="mt-1 text-red-500">
                  建议：刷新页面后重试，或等待页面完全加载
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 根据设置控制是否显示调试信息 */}
      {showDebugPanel === "true" && debugInfo && (
        <Collapsible
          title={
            <span className="flex items-center gap-1.5">
              调试信息
              <span className="rounded border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600">
                开发模式
              </span>
            </span>
          }
          icon={
            <Icon
              icon="line-md:coffee-half-empty-twotone-loop"
              className="text-blue-500"
              width="16"
              height="16"
            />
          }
          defaultExpanded={false}
          className="mb-4">
          <div className="text-blue-700 text-xs">
            <div className="mb-2 flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title="复制调试信息"
                onClick={() => {
                  copyDebugInfo(debugInfo)
                  alert("调试信息已复制到剪贴板")
                }}>
                <Icon icon="line-md:clipboard-check" width="14" height="14" />
              </Button>
            </div>

            <div className="max-h-[120px] overflow-auto rounded border border-blue-100 bg-white p-2">
              <pre className="text-blue-800">{debugInfo}</pre>
            </div>

            <div className="mt-2 flex items-center justify-between text-[10px] text-blue-500">
              <div className="flex items-center gap-1">
                <Icon
                  icon={
                    isLoading
                      ? "line-md:loading-twotone-loop"
                      : "line-md:confirm-circle"
                  }
                  className={isLoading ? "animate-spin text-blue-400" : "text-green-500"}
                  width="12"
                  height="12"
                />
                <span>{isLoading ? "渲染中..." : "渲染完成"}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="rounded border border-blue-200 bg-blue-100/70 px-1.5 py-0.5">
                  {new Date().toLocaleTimeString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  title="查看更多调试信息"
                  onClick={() => {
                    const details = {
                      页面状态: isLoading ? "加载中" : "已加载",
                      数据大小: scrapedData
                        ? `${JSON.stringify(scrapedData).length} 字节`
                        : "无数据",
                      浏览器信息: navigator.userAgent,
                      时间戳: new Date().toISOString()
                    }
                    alert(JSON.stringify(details, null, 2))
                  }}>
                  <Icon icon="line-md:information" width="12" height="12" />
                </Button>
              </div>
            </div>
          </div>
        </Collapsible>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-blue-500 border-t-4 border-b-4"></div>
          <p className="mt-3 text-blue-500">加载中...</p>
        </div>
      ) : scrapedData ? (
        <div className="rounded-xl border-2 border-indigo-200 bg-white p-4 shadow-lg">
          {/* 页面标题 */}
          <div className="mb-4">
            <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-lg text-sky-600">
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
              <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-lg text-sky-600">
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
              <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-lg text-sky-600">
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
            <h2 className="mb-2 flex items-center gap-2 font-semibold text-lg text-sky-600">
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
                  <h2 className="flex flex-wrap items-center gap-2 font-semibold text-lg text-sky-600">
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

                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleRefreshClick}
                    disabled={isLoading}
                    title="刷新内容">
                    <Icon
                      icon={
                        isLoading
                          ? "line-md:loading-alt-loop"
                          : "line-md:refresh-twotone"
                      }
                      className={cn("mr-1", isLoading && "animate-spin")}
                      width="16"
                      height="16"
                    />
                    {isLoading ? "抓取中..." : "刷新"}
                  </Button>
                </div>

                {/* 抓取模式标识 - 独立行，更好的移动端布局 */}
                {scrapedData.metadata && (
                  <div className="flex flex-wrap items-center gap-2">
                    {scrapedData.metadata["extraction:mode"] ===
                      "readability" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 px-2.5 py-1 font-medium text-green-700 text-xs shadow-sm">
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
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 px-2.5 py-1 font-medium text-blue-700 text-xs shadow-sm">
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
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-gradient-to-r from-slate-100 to-gray-100 px-2.5 py-1 font-medium text-slate-700 text-xs shadow-sm">
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
                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-2.5 py-1 font-medium text-orange-700 text-xs">
                            <Icon
                              icon="line-md:alert-twotone"
                              width="12"
                              height="12"
                              className="flex-shrink-0"
                            />
                            <span className="whitespace-nowrap">智能回退</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 如果是混合模式，显示评估信息 */}
              {scrapedData.metadata?.["evaluation:reason"] && (
                <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon="line-md:chart-rising-twotone"
                      width="14"
                      height="14"
                      className="text-blue-500"
                    />
                    <span className="font-medium">混合模式评估报告</span>
                  </div>
                  <p className="mt-1 pl-5">
                    {scrapedData.metadata["evaluation:reason"]}
                  </p>
                </div>
              )}

              {/* 如果发生了回退，显示回退说明 */}
              {scrapedData.metadata?.["fallback:reason"] && (
                <div className="mb-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-orange-700 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon="line-md:alert-circle-twotone"
                      width="14"
                      height="14"
                      className="text-orange-500"
                    />
                    <span className="font-medium">智能回退说明</span>
                  </div>
                  <div className="mt-1 pl-5">
                    <p className="text-orange-600">
                      {scrapedData.metadata["fallback:reason"]}
                    </p>
                    <p className="mt-1 text-orange-500 text-xs">
                      这是正常的智能回退机制，确保您总能获得内容
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
              <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-lg text-sky-600">
                <Icon
                  icon="line-md:image"
                  width="24"
                  height="24"
                  className="flex-shrink-0"
                />
                <span>页面图片</span>
                <span className="font-normal text-sky-500 text-sm">
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
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-lg text-sky-600">
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
        <div className="rounded-lg border border-blue-200 bg-white p-8 text-center text-gray-500">
          没有找到内容。点击"刷新"按钮重试或新开标签页重试。
        </div>
      )}

      <footer className="mt-4 flex items-center justify-center border-blue-200 border-t pt-4 text-center text-blue-500 text-xs">
        Moe Copy AI - 萌抓 v1.0
      </footer>
    </div>
  )
}
PopupContent.displayName = "PopupContent"
export default memo(PopupContent)
