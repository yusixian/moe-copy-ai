import iconUrl from "data-base64:~assets/icon.png"
import { Icon } from "@iconify/react"
import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"
import { memo } from "react"
import AiSummarySection from "~/components/AiSummarySection"
import ContentSection from "~/components/ContentSection"
import ImageGrid from "~/components/ImageGrid"
import MetadataImageSection from "~/components/MetadataImageSection"
import MetadataTable from "~/components/MetadataTable"
import { Button } from "~/components/ui/button"
import { BACKGROUND_GRADIENTS } from "~constants/theme"
import { useOpenOptionPage } from "~hooks/common/useOpenOptionPage"
import useScrapedData from "~hooks/useScrapedData"
import { cn } from "~utils"
import { useI18n } from "~utils/i18n"
import { useTheme } from "~utils/theme"

import CopyableTextField from "./CopyableTextField"
import { ArticleContentHeader } from "./popup/ArticleContentHeader"
import { DebugPanel } from "./popup/DebugPanel"
import { ErrorAlert } from "./popup/ErrorAlert"
import { FloatButtonControl } from "./popup/FloatButtonControl"
import { MetadataFieldSection } from "./popup/MetadataFieldSection"

interface PopupContentProps {
  className?: string
  onClose?: () => void
  enablePortal?: boolean
}

const PopupContent = ({
  className,
  onClose,
  enablePortal
}: PopupContentProps) => {
  const { t } = useI18n()
  const { resolvedTheme } = useTheme()
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

  const [showDebugPanel] = useStorage<string>("show_debug_panel", "true")
  const handleOpenOptions = useOpenOptionPage()

  const handleOpenSidePanel = async () => {
    try {
      await sendToBackground({ name: "openSidePanel" })
    } catch (error) {
      console.error("Failed to open side panel:", error)
    }
  }

  const handleOpenGithub = () => {
    window.open("https://github.com/yusixian/moe-copy-ai", "_blank")
  }

  const handleImageLoadError = (src: string) => {
    console.error("Image load failed:", src)
  }

  const handleMetadataImageError = (label: string) => {
    console.error(`${label} load failed`)
  }

  return (
    <div
      className={cn(
        "relative max-h-[600px] overflow-y-auto rounded-[inherit] p-3 sm:p-4",
        className
      )}>
      {/* Soft Blue Radial Background - adjust opacity for dark mode */}
      <div
        className="fixed inset-0 top-0 left-0 z-[-1] h-full w-full rounded-[inherit] bg-app"
        style={{
          backgroundImage: BACKGROUND_GRADIENTS[resolvedTheme]
        }}
      />

      <header className="sticky top-0 top-bar left-0 z-[100] mb-4 flex flex-col gap-3 px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
        <img
          src={iconUrl}
          alt="Moe Copy AI"
          className="mr-3 h-10 w-10 flex-shrink-0"
        />
        <div className="mr-3 min-w-0 flex-1">
          <h1 className="flex items-center gap-2 font-bold text-accent-blue text-lg sm:text-xl">
            <span className="truncate">{t("app.name")}</span>
            <span className="ml-2 flex-shrink-0">{t("popup.subtitle")}</span>
          </h1>
          <p className="text-text-2 text-xs sm:text-sm">
            {t("popup.description")}
          </p>
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
            className="border-none"
            variant="ghost"
            size="icon"
            onClick={handleOpenGithub}
            title={t("popup.openGithub")}>
            <Icon icon="mdi:github" width="20" height="20" />
          </Button>
          <Button
            className="border-none"
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
              className="border-none hover:bg-error-ghost-hover hover:text-error">
              <Icon icon="line-md:close" width="20" height="20" />
            </Button>
          )}
        </div>
      </header>

      <FloatButtonControl onClose={onClose} />

      {error && <ErrorAlert error={error} onRetry={handleRefresh} />}

      {showDebugPanel === "true" && debugInfo && (
        <DebugPanel
          debugInfo={debugInfo}
          isLoading={isLoading}
          scrapedData={scrapedData}
        />
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="h-12 w-12 animate-spin rounded-full border-accent-blue border-t-4 border-b-4"></div>
          <p className="mt-3 text-accent-blue">{t("common.loading")}</p>
        </div>
      ) : scrapedData ? (
        <div className="card p-3">
          {/* Page Title */}
          <MetadataFieldSection
            icon="line-md:hash"
            label={t("content.title")}
            value={scrapedData.title}
            enablePortal={enablePortal}
            selectorConfig={
              titleSelectors.length > 0
                ? {
                    type: "title",
                    selectors: titleSelectors,
                    selectedIndex: selectedSelectorIndices.title,
                    results: scrapedData?.selectorResults?.title || [],
                    onSelectorChange: (index) =>
                      handleSelectorChange("title", index),
                    onSelectContent: (selector, contentIndex) =>
                      handleSelectContent("title", selector, contentIndex)
                  }
                : undefined
            }
          />

          {/* Author */}
          {scrapedData.author && (
            <MetadataFieldSection
              icon="line-md:account"
              label={t("content.author")}
              value={scrapedData.author}
              enablePortal={enablePortal}
              selectorConfig={
                authorSelectors.length > 0
                  ? {
                      type: "author",
                      selectors: authorSelectors,
                      selectedIndex: selectedSelectorIndices.author,
                      results: scrapedData?.selectorResults?.author || [],
                      onSelectorChange: (index) =>
                        handleSelectorChange("author", index),
                      onSelectContent: (selector, contentIndex) =>
                        handleSelectContent("author", selector, contentIndex)
                    }
                  : undefined
              }
            />
          )}

          {/* Publish Date */}
          {scrapedData.publishDate && (
            <MetadataFieldSection
              icon="line-md:calendar"
              label={t("content.date")}
              value={scrapedData.publishDate}
              enablePortal={enablePortal}
              selectorConfig={
                dateSelectors.length > 0
                  ? {
                      type: "date",
                      selectors: dateSelectors,
                      selectedIndex: selectedSelectorIndices.date,
                      results: scrapedData?.selectorResults?.date || [],
                      onSelectorChange: (index) =>
                        handleSelectorChange("date", index),
                      onSelectContent: (selector, contentIndex) =>
                        handleSelectContent("date", selector, contentIndex)
                    }
                  : undefined
              }
            />
          )}

          {/* URL */}
          <MetadataFieldSection
            icon="line-md:link"
            label={t("content.url")}
            value={scrapedData.url}
          />

          {/* Article Content */}
          {scrapedData.articleContent && (
            <div className="mb-4">
              <ArticleContentHeader
                isLoading={isLoading}
                onRefresh={handleRefresh}
                contentSelectors={contentSelectors}
                selectedIndex={selectedSelectorIndices.content}
                selectorResults={scrapedData?.selectorResults?.content || []}
                onSelectorChange={(index) =>
                  handleSelectorChange("content", index)
                }
                onSelectContent={(selector, contentIndex) =>
                  handleSelectContent("content", selector, contentIndex)
                }
                enablePortal={enablePortal}
                metadata={scrapedData.metadata}
              />
              <ContentSection
                articleContent={scrapedData.articleContent}
                cleanedContent={scrapedData.cleanedContent}
                isMarkdown={isMarkdown}
              />
            </div>
          )}

          {/* AI Summary */}
          <AiSummarySection
            content={scrapedData.articleContent}
            scrapedData={scrapedData}
          />

          {/* Page Images */}
          {scrapedData.images && scrapedData.images.length > 0 && (
            <div className="mb-4">
              <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-base">
                <Icon
                  icon="line-md:image"
                  width="18"
                  height="18"
                  className="flex-shrink-0 text-accent-blue"
                />
                <span>{t("popup.pageImages")}</span>
                <span className="font-normal text-accent-blue text-sm">
                  {t("popup.imageCount", { count: scrapedData.images.length })}
                </span>
              </h2>
              <ImageGrid
                images={scrapedData.images}
                onLoadError={handleImageLoadError}
              />
            </div>
          )}

          {/* Metadata */}
          {Object.keys(scrapedData.metadata).length > 0 && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 font-semibold text-base">
                <Icon
                  icon="line-md:emoji-grin"
                  width="18"
                  height="18"
                  className="flex-shrink-0 text-accent-blue"
                />
                <span>{t("popup.metadata")}</span>
              </h2>

              <MetadataImageSection
                metadata={scrapedData.metadata}
                onLoadError={handleMetadataImageError}
              />

              <MetadataTable
                metadata={scrapedData.metadata}
                onLoadError={handleMetadataImageError}
              />

              <CopyableTextField
                className="mt-4"
                text={JSON.stringify(scrapedData.metadata)}
              />
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
