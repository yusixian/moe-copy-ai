import { Icon } from "@iconify/react"
import { useStorage } from "@plasmohq/storage/hook"
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle
} from "react"

import AiSummarySection from "~/components/AiSummarySection"
import ContentSection from "~/components/ContentSection"
import CopyableTextField from "~/components/CopyableTextField"
import ImageGrid from "~/components/ImageGrid"
import MetadataImageSection from "~/components/MetadataImageSection"
import MetadataTable from "~/components/MetadataTable"
import SelectorDropdown from "~/components/SelectorDropdown"
import { Button } from "~/components/ui/button"
import { Collapsible } from "~/components/ui/collapsible"
import useScrapedData from "~hooks/useScrapedData"
import { useI18n } from "~utils/i18n"

export interface SingleScrapePanelHandle {
  refresh: () => void
}

interface SingleScrapePanelProps {
  onLoadingChange?: (isLoading: boolean) => void
}

const SingleScrapePanel = forwardRef<
  SingleScrapePanelHandle,
  SingleScrapePanelProps
>(function SingleScrapePanel({ onLoadingChange }, ref) {
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

  // 暴露 refresh 方法给父组件
  useImperativeHandle(
    ref,
    () => ({
      refresh: handleRefresh
    }),
    [handleRefresh]
  )

  // 通知父组件 loading 状态变化
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

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

  return (
    <div className="flex h-full flex-col gap-3 overflow-auto">
      {/* 悬浮窗开关区域 */}
      <div className="card flex flex-shrink-0 items-center justify-between p-3">
        <span className="font-medium text-sm text-text-1">
          {t("singlescrape.floatToggle.label")}
        </span>
        <Button
          variant={showFloatButton === "true" ? "danger" : "default"}
          size="sm"
          onClick={handleFloatButtonToggle}
          title={
            showFloatButton === "true"
              ? t("singlescrape.floatToggle.closeTip")
              : t("singlescrape.floatToggle.openTip")
          }>
          {showFloatButton === "true"
            ? t("singlescrape.floatToggle.close")
            : t("singlescrape.floatToggle.open")}
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex-shrink-0 rounded-lg border border-error/20 bg-error-ghost p-3 text-error">
          <div className="flex items-start gap-3">
            <Icon
              icon="mdi:alert-circle"
              className="mt-0.5 flex-shrink-0 text-error"
              width="20"
              height="20"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-error">
                  {t("singlescrape.error.title")}
                </p>
                <p className="flex-1 text-error text-sm">{error}</p>
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
                  {t("singlescrape.error.retry")}
                </Button>
              </div>
              <div className="mt-2 rounded border border-error/20 bg-error-ghost-hover p-2 text-xs">
                <p>{t("singlescrape.error.causes")}</p>
                <p className="mt-1 text-error">
                  {t("singlescrape.error.suggestion")}
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
            <span className="flex items-center gap-1.5 text-sm">
              {t("singlescrape.debug.title")}
              <span className="rounded border border-accent-blue bg-accent-blue-ghost px-1.5 py-0 text-[10px] text-accent-blue">
                {t("singlescrape.debug.devMode")}
              </span>
            </span>
          }
          titleClassName="text-sm"
          icon={
            <Icon
              icon="line-md:coffee-half-empty-twotone-loop"
              className="text-accent-blue"
              width="16"
              height="16"
            />
          }
          defaultExpanded={false}
          className="flex-shrink-0">
          <div className="text-blue-700 text-xs">
            <CopyableTextField
              text={debugInfo}
              rows={5}
              onCopied={() => alert(t("singlescrape.debug.copied"))}
            />

            <div className="mt-2 flex items-center justify-between text-[10px] text-text-2">
              <div className="flex items-center gap-1">
                <Icon
                  icon={
                    isLoading
                      ? "line-md:loading-twotone-loop"
                      : "line-md:confirm-circle"
                  }
                  className={
                    isLoading ? "animate-spin text-text-1" : "text-success"
                  }
                  width="12"
                  height="12"
                />
                <span>
                  {isLoading
                    ? t("singlescrape.debug.rendering")
                    : t("singlescrape.debug.complete")}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="rounded border bg-fill-1 px-1.5 py-0.5">
                  {new Date().toLocaleTimeString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 p-0"
                  title={t("singlescrape.debug.moreInfo")}
                  onClick={() => {
                    const details = {
                      [t("singlescrape.debug.pageStatus")]: isLoading
                        ? t("singlescrape.debug.pageLoading")
                        : t("singlescrape.debug.pageLoaded"),
                      [t("singlescrape.debug.dataSize")]: scrapedData
                        ? t("singlescrape.debug.dataSizeValue", {
                            size: JSON.stringify(scrapedData).length
                          })
                        : t("singlescrape.debug.noData"),
                      [t("singlescrape.debug.browserInfo")]:
                        navigator.userAgent,
                      [t("singlescrape.debug.timestamp")]:
                        new Date().toISOString()
                    }
                    alert(JSON.stringify(details, null, 2))
                  }}>
                  <Icon icon="line-md:alert-circle" width="12" height="12" />
                </Button>
              </div>
            </div>
          </div>
        </Collapsible>
      )}

      {/* 主内容区 */}
      {isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-accent-blue border-t-4 border-b-4" />
          <p className="mt-3 text-accent-blue">{t("singlescrape.loading")}</p>
        </div>
      ) : scrapedData ? (
        <div className="flex flex-col gap-3">
          {/* 基础信息区 */}
          <Collapsible
            title={t("singlescrape.section.basicInfo")}
            icon={<Icon icon="line-md:document-list" width={16} />}
            defaultExpanded={true}>
            <div className="flex flex-col gap-3">
              {/* 页面标题 */}
              <div>
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <Icon
                    icon="line-md:hash"
                    width="16"
                    height="16"
                    className="text-accent-blue"
                  />
                  <span className="font-medium text-sm">
                    {t("singlescrape.field.title")}
                  </span>
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
                  className="text-sm"
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
                      className="text-accent-blue"
                    />
                    <span className="font-medium text-sm">
                      {t("singlescrape.field.author")}
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
                    className="text-sm"
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
                      className="text-accent-blue"
                    />
                    <span className="font-medium text-sm">
                      {t("singlescrape.field.date")}
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
                    className="text-sm"
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
                    className="text-accent-blue"
                  />
                  <span className="font-medium text-sm">URL</span>
                </div>
                <CopyableTextField text={scrapedData.url} className="text-xs" />
              </div>
            </div>
          </Collapsible>

          {/* 文章内容 */}
          {scrapedData.articleContent && (
            <Collapsible
              title={t("singlescrape.section.content")}
              icon={<Icon icon="line-md:file-document" width={16} />}
              defaultExpanded={false}
              className="max-h-[500px] overflow-auto">
              <div className="flex flex-col gap-2">
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
                    title={t("singlescrape.action.refresh")}>
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
                    {isLoading
                      ? t("singlescrape.action.refreshing")
                      : t("singlescrape.action.refreshButton")}
                  </Button>
                </div>

                {/* 抓取模式标识 */}
                {scrapedData.metadata && (
                  <div className="flex flex-wrap items-center gap-2">
                    {scrapedData.metadata["extraction:mode"] ===
                      "readability" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success-ghost px-2 py-0.5 font-medium text-success text-xs">
                        <Icon
                          icon="line-md:target-twotone"
                          width="12"
                          height="12"
                        />
                        {t("singlescrape.mode.readability")}
                      </span>
                    )}
                    {scrapedData.metadata["extraction:mode"] === "hybrid" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-info/20 bg-info-ghost px-2 py-0.5 font-medium text-info text-xs">
                        <Icon
                          icon="line-md:switch-filled"
                          width="12"
                          height="12"
                        />
                        {t("singlescrape.mode.hybrid")}
                      </span>
                    )}
                    {(!scrapedData.metadata["extraction:mode"] ||
                      scrapedData.metadata["extraction:mode"] ===
                        "selector") && (
                      <>
                        <span className="inline-flex items-center gap-1 rounded-full border border-text-3/20 bg-fill-hover px-2 py-0.5 font-medium text-text-2 text-xs">
                          <Icon
                            icon="line-md:settings-twotone"
                            width="12"
                            height="12"
                          />
                          {t("singlescrape.mode.selector")}
                        </span>
                        {scrapedData.metadata["original:mode"] === "hybrid" && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning-ghost px-2 py-0.5 font-medium text-warning text-xs">
                            <Icon
                              icon="line-md:alert-twotone"
                              width="12"
                              height="12"
                            />
                            {t("singlescrape.mode.smartFallback")}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* 混合模式评估信息 */}
                {scrapedData.metadata?.["evaluation:reason"] && (
                  <div className="rounded-lg border border-info/20 bg-info-ghost px-3 py-2 text-info text-xs">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        icon="line-md:chart-rising-twotone"
                        width="14"
                        height="14"
                        className="text-info"
                      />
                      <span className="font-medium">
                        {t("singlescrape.mode.evaluation")}
                      </span>
                    </div>
                    <p className="mt-1 pl-5">
                      {scrapedData.metadata["evaluation:reason"]}
                    </p>
                  </div>
                )}

                {/* 回退说明 */}
                {scrapedData.metadata?.["fallback:reason"] && (
                  <div className="rounded-lg border border-warning/20 bg-warning-ghost px-3 py-2 text-warning text-xs">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        icon="line-md:alert-circle-twotone"
                        width="14"
                        height="14"
                        className="text-warning"
                      />
                      <span className="font-medium">
                        {t("singlescrape.mode.fallback")}
                      </span>
                    </div>
                    <div className="mt-1 pl-5">
                      <p className="text-warning">
                        {scrapedData.metadata["fallback:reason"]}
                      </p>
                      <p className="mt-1 text-warning text-xs">
                        {t("singlescrape.mode.fallbackInfo")}
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
            </Collapsible>
          )}

          {/* AI 摘要 */}
          <AiSummarySection
            content={scrapedData.articleContent}
            scrapedData={scrapedData}
          />

          {/* 元数据 */}
          {Object.keys(scrapedData.metadata).length > 0 && (
            <Collapsible
              title={t("singlescrape.section.metadata")}
              icon={<Icon icon="line-md:emoji-grin" width={16} />}
              defaultExpanded={false}
              className="max-h-[400px] overflow-auto">
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
                  className="text-xs"
                />
              </div>
            </Collapsible>
          )}

          {/* 页面图片 */}
          {scrapedData.images && scrapedData.images.length > 0 && (
            <Collapsible
              title={t("singlescrape.section.imagesCount", {
                count: scrapedData.images.length
              })}
              icon={<Icon icon="line-md:image" width={16} />}
              defaultExpanded={false}
              className="max-h-[400px] overflow-auto">
              <ImageGrid
                images={scrapedData.images}
                onLoadError={handleImageLoadError}
              />
            </Collapsible>
          )}
        </div>
      ) : (
        <div className="card flex flex-1 flex-col items-center justify-center p-8 text-center text-text-2">
          <Icon
            icon="line-md:document-report"
            width="48"
            height="48"
            className="mb-3 text-accent-blue/30"
          />
          <p>{t("singlescrape.empty.title")}</p>
          <p className="mt-1 text-sm">{t("singlescrape.empty.hint")}</p>
          <Button
            variant="default"
            size="sm"
            onClick={handleRefreshClick}
            className="mt-4">
            <Icon icon="line-md:refresh-twotone" className="mr-1" width="16" />
            {t("singlescrape.empty.action")}
          </Button>
        </div>
      )}
    </div>
  )
})

SingleScrapePanel.displayName = "SingleScrapePanel"
export default memo(SingleScrapePanel)
