import "./styles/global.css"
import "react-toastify/dist/ReactToastify.css"

import { Icon } from "@iconify/react"
import { lazy, Suspense, useMemo, useRef, useState } from "react"
import { ToastContainer } from "react-toastify"

import type { SingleScrapePanelHandle } from "~components/singlescrape"
import { Button } from "~components/ui/button"
import { ErrorBoundary } from "~components/ui/ErrorBoundary"
import Segmented, { type SegmentedOption } from "~components/ui/segmented"
import { BACKGROUND_GRADIENTS } from "~constants/theme"
import { BatchScrapeProvider } from "~contexts/BatchScrapeContext"
import useContentExtraction from "~hooks/useContentExtraction"
import { I18nProvider, useI18n } from "~utils/i18n"
import { ThemeProvider, useTheme } from "~utils/theme"

// Lazy load heavy tab components
const SingleScrapePanel = lazy(
  () => import("~components/singlescrape/SingleScrapePanel")
)
const BatchScrapePanel = lazy(
  () => import("~components/batch/BatchScrapePanel")
)
const ContentExtractionPanel = lazy(
  () => import("~components/extraction/ContentExtractionPanel")
)
const SidePanelSettings = lazy(
  () => import("~components/sidepanel/SidePanelSettings")
)

function TabSkeleton() {
  return (
    <div className="flex h-32 items-center justify-center">
      <Icon icon="line-md:loading-loop" className="h-8 w-8 text-accent-blue" />
    </div>
  )
}

type SidePanelView = "batch" | "extraction" | "singlescrape" | "settings"

function SidePanel() {
  const { t } = useI18n()
  const { resolvedTheme } = useTheme()

  const tabOptions = useMemo<
    SegmentedOption<"batch" | "extraction" | "singlescrape">[]
  >(
    () => [
      {
        value: "singlescrape",
        label: t("sidepanel.title.singlescrape"),
        icon: <Icon icon="mdi:file-document-outline" width={14} />
      },
      {
        value: "batch",
        label: t("sidepanel.title.batch"),
        icon: <Icon icon="mdi:file-document-multiple-outline" width={14} />
      },
      {
        value: "extraction",
        label: t("sidepanel.title.extraction"),
        icon: <Icon icon="mdi:text-box-search-outline" width={14} />
      }
    ],
    [t]
  )

  const [currentView, setCurrentView] = useState<SidePanelView>("singlescrape")
  const [isSingleScrapeLoading, setIsSingleScrapeLoading] = useState(false)
  const singleScrapePanelRef = useRef<SingleScrapePanelHandle>(null)

  const {
    mode: extractionMode,
    content: extractedContent,
    elementInfo: extractionElementInfo,
    error: extractionError,
    tabInfo: extractionTabInfo,
    startSelection: startContentSelection,
    cancelSelection: cancelContentSelection,
    reset: resetContentExtraction
  } = useContentExtraction()

  const viewConfig = useMemo(
    () => ({
      singlescrape: {
        title: t("sidepanel.title.singlescrape"),
        description: t("sidepanel.desc.singlescrape")
      },
      batch: {
        title: t("sidepanel.title.batch"),
        description: t("sidepanel.desc.batch")
      },
      extraction: {
        title: t("sidepanel.title.extraction"),
        description: t("sidepanel.desc.extraction")
      },
      settings: {
        title: t("sidepanel.title.settings"),
        description: t("sidepanel.desc.settings")
      }
    }),
    [t]
  )

  const currentConfig = viewConfig[currentView]

  return (
    <>
      {/* Soft Blue Radial Background - adjust opacity for dark mode */}
      <div
        className="fixed inset-0 top-0 left-0 z-1 h-full w-full rounded-[inherit] bg-app"
        style={{
          backgroundImage: BACKGROUND_GRADIENTS[resolvedTheme]
        }}
      />

      <div className="relative flex h-screen flex-col p-4">
        {/* Header */}
        <div className="mb-4 flex-shrink-0">
          {/* Tab navigation */}
          <div className="mb-3 flex items-center gap-1">
            <Segmented
              id="sidepanel-tabs"
              options={tabOptions}
              value={currentView === "settings" ? undefined : currentView}
              onChange={(value) => setCurrentView(value)}
              className="flex-1"
            />
            <Button
              variant={currentView === "settings" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setCurrentView("settings")}
              title={t("sidepanel.title.settings")}>
              <Icon icon="mdi:cog" width={18} />
            </Button>
          </div>

          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg text-text-1">
                {currentConfig.title}
              </h1>
              <p className="text-sm text-text-2">{currentConfig.description}</p>
            </div>
            {currentView === "singlescrape" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => singleScrapePanelRef.current?.refresh()}
                disabled={isSingleScrapeLoading}
                title={t("common.refresh")}>
                <Icon
                  icon={
                    isSingleScrapeLoading
                      ? "line-md:loading-alt-loop"
                      : "line-md:refresh-twotone"
                  }
                  className={
                    isSingleScrapeLoading ? "mr-1 animate-spin" : "mr-1"
                  }
                  width="16"
                  height="16"
                />
                {isSingleScrapeLoading
                  ? t("sidepanel.fetching")
                  : t("common.refresh")}
              </Button>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <Suspense fallback={<TabSkeleton />}>
            {currentView === "singlescrape" && (
              <SingleScrapePanel
                ref={singleScrapePanelRef}
                onLoadingChange={setIsSingleScrapeLoading}
              />
            )}
            {currentView === "batch" && <BatchScrapePanel />}
            {currentView === "extraction" && (
              <ContentExtractionPanel
                mode={extractionMode}
                content={extractedContent}
                elementInfo={extractionElementInfo}
                error={extractionError}
                tabInfo={extractionTabInfo}
                onStartSelection={startContentSelection}
                onCancel={cancelContentSelection}
                onReset={resetContentExtraction}
              />
            )}
            {currentView === "settings" && <SidePanelSettings />}
          </Suspense>
        </div>

        {/* Footer links */}
        <div className="flex flex-shrink-0 items-center justify-between gap-4 border-line-1 px-1 pt-2">
          <span className="text-text-3 text-xs">{t("app.name")}</span>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-6 p-0"
              onClick={() =>
                window.open("https://github.com/yusixian/moe-copy-ai", "_blank")
              }
              title={t("sidepanel.github")}>
              <Icon icon="mdi:github" className="size-full" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 p-0"
              onClick={() =>
                window.open("https://moe.cosine.ren/docs", "_blank")
              }
              title={t("sidepanel.docs")}>
              <Icon icon="mdi:book-open-outline" className="size-full" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 p-0"
              onClick={() =>
                window.open("https://discord.gg/XzvrvNMcSe", "_blank")
              }
              title={t("sidepanel.discord")}>
              <Icon icon="mdi:discord" className="size-full" />
            </Button>
          </div>
          <span className="text-text-3 text-xs">
            v{chrome.runtime.getManifest().version}
          </span>
        </div>

        <ToastContainer
          position="bottom-center"
          autoClose={2000}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnHover={false}
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          toastClassName={
            resolvedTheme === "dark"
              ? "!bg-[#1a1a1d] !shadow-lg !rounded-lg !text-sm"
              : "!bg-white !shadow-lg !rounded-lg !text-sm"
          }
        />
      </div>
    </>
  )
}

// Wrap with I18nProvider, ThemeProvider and BatchScrapeProvider
// I18nProvider outermost as it's the most fundamental service
function SidePanelWithProviders() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <BatchScrapeProvider>
            <SidePanel />
          </BatchScrapeProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </I18nProvider>
  )
}

export default SidePanelWithProviders
