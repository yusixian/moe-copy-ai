import { Icon } from "@iconify/react"

import { useI18n } from "~utils/i18n"

type ExtractionMode = "readability" | "hybrid" | "selector" | undefined

interface ExtractionModeIndicatorProps {
  mode: ExtractionMode
  originalMode?: string
}

export function ExtractionModeIndicator({
  mode,
  originalMode
}: ExtractionModeIndicatorProps) {
  const { t } = useI18n()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {mode === "readability" && (
        <span className="inline-flex items-center gap-1 rounded-full border border-success bg-success-ghost px-2.5 py-1 font-medium text-success text-xs shadow-sm">
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
      {mode === "hybrid" && (
        <span className="inline-flex items-center gap-1 rounded-full border border-accent-purple bg-accent-purple-ghost px-2.5 py-1 font-medium text-accent-purple text-xs shadow-sm">
          <Icon
            icon="line-md:switch-filled"
            width="12"
            height="12"
            className="flex-shrink-0"
          />
          <span className="whitespace-nowrap">{t("popup.mode.hybrid")}</span>
        </span>
      )}
      {(!mode || mode === "selector") && (
        <>
          <span className="inline-flex items-center gap-1 rounded-full border border-ghost bg-info-ghost px-2.5 py-1 font-medium text-info text-xs shadow-sm">
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
          {originalMode === "hybrid" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-accent-purple bg-accent-purple-ghost px-2.5 py-1 font-medium text-accent-purple text-xs">
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
  )
}
