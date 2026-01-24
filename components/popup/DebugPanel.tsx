import { Icon } from "@iconify/react"

import CopyableTextField from "~/components/CopyableTextField"
import { Button } from "~/components/ui/button"
import { Collapsible } from "~/components/ui/collapsible"
import type { ScrapedContent } from "~constants/types"
import { useI18n } from "~utils/i18n"

interface DebugPanelProps {
  debugInfo: string
  isLoading: boolean
  scrapedData: ScrapedContent | null
}

export function DebugPanel({
  debugInfo,
  isLoading,
  scrapedData
}: DebugPanelProps) {
  const { t } = useI18n()

  return (
    <Collapsible
      title={
        <span className="flex items-center gap-1.5">
          {t("popup.debug.title")}
          <span className="rounded border border-accent-blue bg-accent-blue-ghost px-1.5 py-0 text-[10px] text-accent-blue">
            {t("popup.debug.devMode")}
          </span>
        </span>
      }
      titleClassName="text-base"
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
        <CopyableTextField
          text={debugInfo}
          rows={5}
          onCopied={() => alert(t("popup.debug.copied"))}
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
                ? t("popup.debug.rendering")
                : t("popup.debug.renderComplete")}
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
              <Icon icon="line-md:alert-circle" width="12" height="12" />
            </Button>
          </div>
        </div>
      </div>
    </Collapsible>
  )
}
