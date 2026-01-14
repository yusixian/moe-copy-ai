import { Icon } from "@iconify/react"
import { useStorage } from "@plasmohq/storage/hook"
import { useClipboard } from "foxact/use-clipboard"
import { memo, useCallback } from "react"

import { AccordionSection } from "~/components/AccordionSection"
import AiSummarySection from "~/components/AiSummarySection"
import ContentSection from "~/components/ContentSection"
import CopyableTextField from "~/components/CopyableTextField"
import ImageGrid from "~/components/ImageGrid"
import MetadataImageSection from "~/components/MetadataImageSection"
import MetadataTable from "~/components/MetadataTable"
import SelectorDropdown from "~/components/SelectorDropdown"
import { Button } from "~/components/ui/button"
import { Collapsible } from "~/components/ui/collapsible"
import { useOpenOptionPage } from "~hooks/common/useOpenOptionPage"
import useScrapedData from "~hooks/useScrapedData"

function SingleScrapePanel() {
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

  // 从存储中获取是否显示调试面板的设置
  const [showDebugPanel] = useStorage<string>("show_debug_panel", "true")

  // 从存储中获取悬浮窗显示设置
  const [showFloatButton, setShowFloatButton] = useStorage<string>(
    "show_float_button",
    "true"
  )

  const handleRefreshClick = useCallback(() => {
    handleRefresh()
  }, [handleRefresh])

  // 处理悬浮窗设置变更
  const handleFloatButtonToggle = useCallback(() => {
    const newValue = showFloatButton === "true" ? "false" : "true"
    setShowFloatButton(newValue)
  }, [showFloatButton, setShowFloatButton])

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
    <div className="flex h-full flex-col gap-3 overflow-auto">
      {/* 悬浮窗开关区域 */}
      <div className="flex flex-shrink-0 items-center justify-between rounded-lg border border-sky-200 bg-white p-3">
        <span className="font-medium text-gray-700 text-sm">悬浮窗开关</span>
        <Button
          variant={showFloatButton === "true" ? "danger" : "default"}
          size="sm"
          onClick={handleFloatButtonToggle}
          title={
            showFloatButton === "true" ? "关闭网页悬浮窗" : "开启网页悬浮窗"
          }>
          {showFloatButton === "true" ? "关闭悬浮窗" : "开启悬浮窗"}
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex-shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
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
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleRefreshClick}>
                  <Icon
                    icon="mdi:refresh"
                    width="14"
                    height="14"
                    className="mr-1"
                  />
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

      {/* 调试信息 */}
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
          className="flex-shrink-0">
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
                  className={
                    isLoading ? "animate-spin text-blue-400" : "text-green-500"
                  }
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

      {/* 主内容区 */}
      {isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-blue-500 border-t-4 border-b-4" />
          <p className="mt-3 text-blue-500">加载中...</p>
        </div>
      ) : scrapedData ? (
        <div className="flex flex-col gap-3">
          {/* 基础信息区 */}
          <AccordionSection
            title="基础信息"
            icon="line-md:document-list"
            defaultOpen={true}>
            <div className="flex flex-col gap-3">
              {/* 页面标题 */}
              <div>
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <Icon
                    icon="line-md:hash"
                    width="16"
                    height="16"
                    className="text-sky-600"
                  />
                  <span className="font-medium text-sky-600 text-sm">标题</span>
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
                </div>
                <CopyableTextField
                  text={scrapedData.title}
                  className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-sm"
                />
              </div>

              {/* 作者信息 */}
              {scrapedData.author && (
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Icon
                      icon="line-md:account"
                      width="16"
                      height="16"
                      className="text-sky-600"
                    />
                    <span className="font-medium text-sky-600 text-sm">
                      作者
                    </span>
                    {authorSelectors.length > 0 && (
                      <SelectorDropdown
                        type="author"
                        selectors={authorSelectors}
                        selectedIndex={selectedSelectorIndices.author}
                        results={scrapedData?.selectorResults?.author || []}
                        onChange={(index) =>
                          handleSelectorChange("author", index)
                        }
                        onSelectContent={(selector, contentIndex) =>
                          handleSelectContent("author", selector, contentIndex)
                        }
                      />
                    )}
                  </div>
                  <CopyableTextField
                    text={scrapedData.author}
                    className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-sm"
                  />
                </div>
              )}

              {/* 发布日期 */}
              {scrapedData.publishDate && (
                <div>
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <Icon
                      icon="line-md:calendar"
                      width="16"
                      height="16"
                      className="text-sky-600"
                    />
                    <span className="font-medium text-sky-600 text-sm">
                      发布日期
                    </span>
                    {dateSelectors.length > 0 && (
                      <SelectorDropdown
                        type="date"
                        selectors={dateSelectors}
                        selectedIndex={selectedSelectorIndices.date}
                        results={scrapedData?.selectorResults?.date || []}
                        onChange={(index) =>
                          handleSelectorChange("date", index)
                        }
                        onSelectContent={(selector, contentIndex) =>
                          handleSelectContent("date", selector, contentIndex)
                        }
                      />
                    )}
                  </div>
                  <CopyableTextField
                    text={scrapedData.publishDate}
                    className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-sm"
                  />
                </div>
              )}

              {/* URL */}
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Icon
                    icon="line-md:link"
                    width="16"
                    height="16"
                    className="text-sky-600"
                  />
                  <span className="font-medium text-sky-600 text-sm">URL</span>
                </div>
                <CopyableTextField
                  text={scrapedData.url}
                  className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-xs"
                />
              </div>
            </div>
          </AccordionSection>

          {/* 文章内容 */}
          {scrapedData.articleContent && (
            <AccordionSection
              title="文章内容"
              icon="line-md:file-document-twotone"
              defaultOpen={true}
              maxHeight="500px">
              <div className="flex flex-col gap-3">
                {/* 标题行 */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
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
                  </div>
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
                      className={isLoading ? "mr-1 animate-spin" : "mr-1"}
                      width="14"
                      height="14"
                    />
                    {isLoading ? "抓取中..." : "刷新"}
                  </Button>
                </div>

                {/* 抓取模式标识 */}
                {scrapedData.metadata && (
                  <div className="flex flex-wrap items-center gap-2">
                    {scrapedData.metadata["extraction:mode"] ===
                      "readability" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 px-2 py-0.5 font-medium text-green-700 text-xs">
                        <Icon
                          icon="line-md:target-twotone"
                          width="12"
                          height="12"
                        />
                        Readability 模式
                      </span>
                    )}
                    {scrapedData.metadata["extraction:mode"] === "hybrid" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-0.5 font-medium text-blue-700 text-xs">
                        <Icon
                          icon="line-md:switch-filled"
                          width="12"
                          height="12"
                        />
                        混合模式
                      </span>
                    )}
                    {(!scrapedData.metadata["extraction:mode"] ||
                      scrapedData.metadata["extraction:mode"] ===
                        "selector") && (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-gradient-to-r from-slate-100 to-gray-100 px-2 py-0.5 font-medium text-slate-700 text-xs">
                          <Icon
                            icon="line-md:settings-twotone"
                            width="12"
                            height="12"
                          />
                          选择器模式
                        </span>
                        {scrapedData.metadata["original:mode"] === "hybrid" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 font-medium text-orange-700 text-xs">
                            <Icon
                              icon="line-md:alert-twotone"
                              width="12"
                              height="12"
                            />
                            智能回退
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 混合模式评估信息 */}
                {scrapedData.metadata?.["evaluation:reason"] && (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 text-xs">
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

                {/* 回退说明 */}
                {scrapedData.metadata?.["fallback:reason"] && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-orange-700 text-xs">
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
            </AccordionSection>
          )}

          {/* AI 摘要 */}
          <AccordionSection
            title="AI 助手"
            icon="line-md:chat-round-dots-twotone"
            defaultOpen={true}
            maxHeight="400px">
            <AiSummarySection
              content={scrapedData.articleContent}
              scrapedData={scrapedData}
            />
          </AccordionSection>

          {/* 页面图片 */}
          {scrapedData.images && scrapedData.images.length > 0 && (
            <AccordionSection
              title={`页面图片 (${scrapedData.images.length}张)`}
              icon="line-md:image"
              defaultOpen={false}
              maxHeight="400px">
              <ImageGrid
                images={scrapedData.images}
                onLoadError={handleImageLoadError}
              />
            </AccordionSection>
          )}

          {/* 元数据 */}
          {Object.keys(scrapedData.metadata).length > 0 && (
            <AccordionSection
              title="元数据"
              icon="line-md:emoji-grin-twotone"
              defaultOpen={false}
              maxHeight="400px">
              <div className="flex flex-col gap-3">
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

                {/* 元数据 JSON */}
                <CopyableTextField
                  text={JSON.stringify(scrapedData.metadata)}
                  className="rounded-lg border border-sky-200 bg-sky-50 p-2 text-xs"
                />
              </div>
            </AccordionSection>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-sky-200 bg-white p-8 text-center text-gray-500">
          <Icon
            icon="line-md:document-report"
            width="48"
            height="48"
            className="mb-3 text-sky-300"
          />
          <p>没有找到内容</p>
          <p className="mt-1 text-sm">点击下方按钮重新抓取</p>
          <Button
            variant="default"
            size="sm"
            onClick={handleRefreshClick}
            className="mt-4">
            <Icon icon="line-md:refresh-twotone" className="mr-1" width="16" />
            刷新内容
          </Button>
        </div>
      )}

      {/* 底部操作区 */}
      <div className="flex flex-shrink-0 items-center justify-between border-sky-200 border-t pt-3">
        <span className="text-gray-400 text-xs">Moe Copy AI - 萌抓</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenGithub}
            title="访问 GitHub">
            <Icon icon="mdi:github" width="18" height="18" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenOptions}
            title="打开设置">
            <Icon icon="line-md:cog-filled-loop" width="18" height="18" />
          </Button>
        </div>
      </div>
    </div>
  )
}

SingleScrapePanel.displayName = "SingleScrapePanel"
export default memo(SingleScrapePanel)
