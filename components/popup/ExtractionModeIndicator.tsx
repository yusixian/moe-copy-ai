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
      {mode === "hybrid" && (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 px-2.5 py-1 font-medium text-blue-700 text-xs shadow-sm">
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
          {originalMode === "hybrid" && (
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
  )
}
