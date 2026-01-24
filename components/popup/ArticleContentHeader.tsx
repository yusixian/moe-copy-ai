import { Icon } from "@iconify/react"

import SelectorDropdown from "~/components/SelectorDropdown"
import { Button } from "~/components/ui/button"
import type { SelectorResultItem } from "~constants/types"
import { cn } from "~utils"
import { useI18n } from "~utils/i18n"

import { ExtractionModeIndicator } from "./ExtractionModeIndicator"

interface ArticleContentHeaderProps {
  isLoading: boolean
  onRefresh: () => void
  contentSelectors: string[]
  selectedIndex: number
  selectorResults: SelectorResultItem[]
  onSelectorChange: (index: number) => void
  onSelectContent: (selector: string, contentIndex: number) => void
  enablePortal?: boolean
  metadata?: Record<string, string>
}

export function ArticleContentHeader({
  isLoading,
  onRefresh,
  contentSelectors,
  selectedIndex,
  selectorResults,
  onSelectorChange,
  onSelectContent,
  enablePortal,
  metadata
}: ArticleContentHeaderProps) {
  const { t } = useI18n()

  const extractionMode = metadata?.["extraction:mode"] as
    | "readability"
    | "hybrid"
    | "selector"
    | undefined
  const originalMode = metadata?.["original:mode"]
  const evaluationReason = metadata?.["evaluation:reason"]
  const fallbackReason = metadata?.["fallback:reason"]

  return (
    <div className="mb-3">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex flex-wrap items-center gap-2 font-semibold text-base">
          <Icon
            icon="line-md:file-document"
            className="inline flex-shrink-0 text-accent-blue"
            width="18"
            height="18"
          />
          <span>{t("popup.articleContent")}</span>
          {contentSelectors.length > 0 && (
            <SelectorDropdown
              type="content"
              selectors={contentSelectors}
              selectedIndex={selectedIndex}
              results={selectorResults}
              onChange={onSelectorChange}
              onSelectContent={onSelectContent}
              enablePortal={enablePortal}
            />
          )}
        </h2>

        <Button
          variant="default"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          title={t("popup.refreshContent")}>
          <Icon
            icon={
              isLoading ? "line-md:loading-alt-loop" : "line-md:refresh-twotone"
            }
            className={cn("mr-1", isLoading && "animate-spin")}
            width="16"
            height="16"
          />
          {isLoading ? t("popup.scraping") : t("common.refresh")}
        </Button>
      </div>

      {metadata && (
        <ExtractionModeIndicator
          mode={extractionMode}
          originalMode={originalMode}
        />
      )}

      {evaluationReason && (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 text-xs">
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
          <p className="mt-1 pl-5">{evaluationReason}</p>
        </div>
      )}

      {fallbackReason && (
        <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-orange-700 text-xs">
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
            <p className="text-orange-600">{fallbackReason}</p>
            <p className="mt-1 text-orange-500 text-xs">
              {t("popup.mode.fallbackInfo")}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
