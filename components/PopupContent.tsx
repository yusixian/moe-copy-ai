import iconUrl from "data-base64:~assets/icon.png"
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
import { useI18n } from "~utils/i18n"

import CopyableTextField from "./CopyableTextField"

interface PopupContentProps {
  className?: string
  onClose?: () => void
}

const PopupContent = ({ className, onClose }: PopupContentProps) => {
  const { t } = useI18n()
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
        "relative max-h-[600px] overflow-y-auto rounded-[inherit] p-3 sm:p-4",
        className
      )}>
      {/* Soft Blue Radial Background */}
      <div
        className="fixed inset-0 top-0 left-0 z-[-1] h-full w-full rounded-[inherit] bg-app/90"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgb(37 99 235 / 0.14), transparent 40%),
            radial-gradient(circle at 50% 10%, rgb(6 182 212 / 0.11), transparent 45%),
            radial-gradient(circle at 85% 15%, rgb(168 85 247 / 0.08), transparent 40%)
          `
        }}
      />

      <header className="!rounded-full sticky top-0 top-bar left-0 z-[100] mb-4 flex flex-col gap-3 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <img
          src={iconUrl}
          alt="Moe Copy AI"
          className="mr-3 h-10 w-10 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h1 className="flex items-center gap-2 font-bold text-accent-blue text-lg sm:text-xl">
            <span className="truncate">{t("app.name")}</span>
            <span className="ml-2 flex-shrink-0">{t("popup.subtitle")}</span>
          </h1>
          <p className="text-text-2 text-xs sm:text-sm">
            {t("popup.description")}
          </p>
          {/* <p className="mt-1 hidden text-blue-400 text-xs sm:block">
            {t("popup.descriptionDetail")}
          </p> */}
        </div>
        <div className="flex flex-shrink-0 items-center justify-end gap-2">
          <Button
            className="border-none"
            variant="secondary"
            size="sm"
            onClick={handleOpenSidePanel}
            title={t("popup.batchScrapeTip")}>
            <Icon
              icon="mdi:file-document-multiple-outline"
              width="16"
              height="16"
              className="mr-1.5"
            />
            {t("popup.batchScrape")}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenGithub}
            title={t("popup.openGithub")}>
            <Icon icon="mdi:github" width="20" height="20" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenOptions}
            title={t("popup.openSettings")}>
            <Icon icon="line-md:cog" width="20" height="20" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title={t("common.close")}
              className="hover:bg-error-ghost-hover hover:text-error">
              <Icon icon="line-md:close" width="20" height="20" />
            </Button>
          )}
        </div>
      </header>

      {/* 悬浮窗开关区域 */}
      <div className="card mb-4 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-medium text-gray-700 text-sm">
            {t("popup.floatButton.label")}
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTempHideFloat}
              title={t("popup.floatButton.tempHideTip")}>
              {t("popup.floatButton.tempHide")}
            </Button>
            <Button
              variant={showFloatButton === "true" ? "danger" : "default"}
              size="sm"
              onClick={handleFloatButtonToggle}
              title={
                showFloatButton === "true"
                  ? t("popup.floatButton.closeTip")
                  : t("popup.floatButton.openTip")
              }>
              {showFloatButton === "true"
                ? t("popup.floatButton.permanentClose")
                : t("popup.floatButton.enable")}
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
                <p className="font-medium text-red-600">
                  {t("popup.error.title")}
                </p>
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
                  {t("popup.error.retry")}
                </Button>
              </div>
              <div className="mt-2 rounded border border-red-200 bg-red-100/50 p-2 text-xs">
                <p>{t("popup.error.possibleCauses")}</p>
                <p className="mt-1 text-red-500">
                  {t("popup.error.suggestion")}
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
              {t("popup.debug.title")}
              <span className="rounded border border-blue-200 bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-600">
                {t("popup.debug.devMode")}
              </span>
            </span>
          }
          titleClassName="text-base text-accent-blue"
          icon={
            <Icon
              icon="line-md:coffee-half-empty-twotone-loop"
              className="text-accent-blue"
              width="18"
              height="18"
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
                title={t("popup.debug.copyInfo")}
                onClick={() => {
                  copyDebugInfo(debugInfo)
                  alert(t("popup.debug.copied"))
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
                <span>
                  {isLoading
                    ? t("popup.debug.rendering")
                    : t("popup.debug.renderComplete")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="rounded border border-blue-200 bg-blue-100/70 px-1.5 py-0.5">
                  {new Date().toLocaleTimeString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  title={t("popup.debug.moreInfo")}
                  onClick={() => {
                    const details = {
                      [t("popup.debug.pageStatus")]: isLoading
                        ? t("popup.debug.pageLoading")
                        : t("popup.debug.pageLoaded"),
                      [t("popup.debug.dataSize")]: scrapedData
                        ? t("popup.debug.dataSizeValue", {
                            size: JSON.stringify(scrapedData).length
                          })
                        : t("popup.debug.noData"),
                      [t("popup.debug.browserInfo")]: navigator.userAgent,
                      [t("popup.debug.timestamp")]: new Date().toISOString()
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
          <div className="h-12 w-12 animate-spin rounded-full border-accent-blue border-t-4 border-b-4"></div>
          <p className="mt-3 text-accent-blue">{t("common.loading")}</p>
        </div>
      ) : scrapedData ? (
        <div className="card p-3">
          {/* 页面标题 */}
          <div className="mb-4">
            <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-accent-blue text-base">
              <Icon
                icon="line-md:hash"
                width="18"
                height="18"
                className="flex-shrink-0"
              />
              <span>{t("content.title")}</span>
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

            <CopyableTextField text={scrapedData.title} />
          </div>

          {/* 作者信息 */}
          {scrapedData.author && (
            <div className="mb-4">
              <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-accent-blue text-base">
                <Icon
                  icon="line-md:account"
                  width="18"
                  height="18"
                  className="flex-shrink-0"
                />
                <span>{t("content.author")}</span>
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

              <CopyableTextField text={scrapedData.author} />
            </div>
          )}

          {/* 发布日期 */}
          {scrapedData.publishDate && (
            <div className="mb-4">
              <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-accent-blue text-base">
                <Icon
                  icon="line-md:calendar"
                  width="18"
                  height="18"
                  className="flex-shrink-0"
                />
                <span>{t("content.date")}</span>
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
              <CopyableTextField text={scrapedData.publishDate} />
            </div>
          )}

          {/* URL */}
          <div className="mb-4">
            <h2 className="mb-2 flex items-center gap-2 font-semibold text-accent-blue text-base">
              <Icon
                icon="line-md:link"
                width="18"
                height="18"
                className="flex-shrink-0"
              />
              <span>{t("content.url")}</span>
            </h2>
            <CopyableTextField text={scrapedData.url} />
          </div>

          {/* 文章内容 */}
          {scrapedData.articleContent && (
            <div className="mb-4">
              {/* 标题行 - 移动端优化 */}
              <div className="mb-3">
                <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex flex-wrap items-center gap-2 font-semibold text-accent-blue text-base">
                    <Icon
                      icon="line-md:file-document"
                      className="inline flex-shrink-0"
                      width="18"
                      height="18"
                    />
                    <span>{t("popup.articleContent")}</span>
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
                    title={t("popup.refreshContent")}>
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
                    {isLoading ? t("popup.scraping") : t("common.refresh")}
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
                          {t("popup.mode.readability")}
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
                        <span className="whitespace-nowrap">
                          {t("popup.mode.hybrid")}
                        </span>
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
                          <span className="whitespace-nowrap">
                            {t("popup.mode.selector")}
                          </span>
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
                            <span className="whitespace-nowrap">
                              {t("popup.mode.smartFallback")}
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
                <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon="line-md:chart-rising-twotone"
                      width="14"
                      height="14"
                      className="text-blue-500"
                    />
                    <span className="font-medium">
                      {t("popup.mode.hybridEvaluation")}
                    </span>
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
                    <span className="font-medium">
                      {t("popup.mode.fallbackExplanation")}
                    </span>
                  </div>
                  <div className="mt-1 pl-5">
                    <p className="text-orange-600">
                      {scrapedData.metadata["fallback:reason"]}
                    </p>
                    <p className="mt-1 text-orange-500 text-xs">
                      {t("popup.mode.fallbackInfo")}
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
              <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-accent-blue text-base">
                <Icon
                  icon="line-md:image"
                  width="18"
                  height="18"
                  className="flex-shrink-0"
                />
                <span>{t("popup.pageImages")}</span>
                <span className="font-normal text-sky-500 text-sm">
                  {t("popup.imageCount", { count: scrapedData.images.length })}
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
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-accent-blue text-base">
                <Icon
                  icon="line-md:emoji-grin"
                  width="18"
                  height="18"
                  className="flex-shrink-0"
                />
                <span>{t("popup.metadata")}</span>
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
              <CopyableTextField text={JSON.stringify(scrapedData.metadata)} />
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-blue-200 bg-white p-8 text-center text-gray-500">
          {t("popup.noContentMessage")}
        </div>
      )}

      <footer className="mt-4 flex items-center justify-center border-blue-200 border-t pt-4 text-center text-blue-500 text-xs">
        {t("popup.footer", { version: "1.0" })}
      </footer>
    </div>
  )
}
PopupContent.displayName = "PopupContent"
export default memo(PopupContent)
