import { Icon } from "@iconify/react"
import type React from "react"
import { useEffect, useState } from "react"

import { useI18n } from "~utils/i18n"

import type { ExtractionMode } from "../../constants/types"
import { getExtractionMode, setExtractionMode } from "../../utils/storage"
import OptionSection from "./OptionSection"

const EXTRACTION_MODE_STYLES = {
  selector: {
    icon: "heroicons-solid:selector",
    color: "sky",
    borderColor: "border-sky-300",
    textColor: "text-sky-700",
    bgColor: "bg-sky-50"
  },
  readability: {
    icon: "ant-design:read-filled",
    color: "emerald",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50"
  },
  hybrid: {
    icon: "radix-icons:mix",
    color: "purple",
    borderColor: "border-purple-300",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50"
  }
}

export const ExtractionModeSection: React.FC = () => {
  const { t } = useI18n()
  const [extractionMode, setExtractionModeState] =
    useState<ExtractionMode>("hybrid")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const modeKeys: ExtractionMode[] = ["selector", "readability", "hybrid"]

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const mode = await getExtractionMode()
        const finalMode = mode || "hybrid"
        setExtractionModeState(finalMode)
        if (!mode || mode !== finalMode) {
          try {
            await setExtractionMode(finalMode)
          } catch (setError) {
            console.error("Failed to initialize extraction mode:", setError)
          }
        }
      } catch (error) {
        console.error("Failed to load extraction mode settings:", error)
        setExtractionModeState("hybrid")
        try {
          await setExtractionMode("hybrid")
        } catch (saveError) {
          console.error("Failed to save default extraction mode:", saveError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleModeChange = async (newMode: ExtractionMode) => {
    try {
      setSaving(true)
      await setExtractionMode(newMode)
      setExtractionModeState(newMode)
    } catch (error) {
      console.error("Failed to save extraction mode settings:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <OptionSection title={t("option.extraction.mode")} icon="line-md:cog-loop">
        <div className="space-y-3">
          <div className="animate-pulse rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 rounded-full bg-purple-200"></div>
              <div className="flex-1">
                <div className="mb-2 h-4 w-3/4 rounded bg-purple-200"></div>
                <div className="h-3 w-1/2 rounded bg-purple-100"></div>
              </div>
            </div>
          </div>
          <div className="text-center text-purple-500 text-sm">
            <span className="animate-bounce">{t("common.loading")}</span>
          </div>
        </div>
      </OptionSection>
    )
  }

  return (
    <OptionSection title={t("option.extraction.mode")} icon="line-md:cog-loop">
      <div className="space-y-4">
        <div className="space-y-3">
          {modeKeys.map((modeKey) => {
            const style = EXTRACTION_MODE_STYLES[modeKey]
            return (
              <label
                key={modeKey}
                htmlFor={`mode-${modeKey}`}
                className={`group relative flex cursor-pointer items-start space-x-3 rounded-xl border-2 p-4 transition-all duration-300 ${
                  extractionMode === modeKey
                    ? `${style.borderColor} transform shadow-md`
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
                } ${saving && "cursor-not-allowed opacity-50"}`}>
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    value={modeKey}
                    checked={extractionMode === modeKey}
                    onChange={() =>
                      !saving && handleModeChange(modeKey)
                    }
                    disabled={saving}
                    className="sr-only"
                    id={`mode-${modeKey}`}
                  />
                  <div
                    className={`mt-0.5 h-5 w-5 rounded-full border-2 transition-all duration-300 ${
                      extractionMode === modeKey
                        ? `${style.borderColor} ${style.bgColor}`
                        : "border-gray-300 bg-white"
                    }`}>
                    <div
                      className={`m-0.5 h-3 w-3 rounded-full transition-all duration-300 ${
                        extractionMode === modeKey
                          ? `${style.bgColor.replace("bg-", "bg-")}${style.bgColor.includes("-50") ? style.bgColor.replace("-50", "-400") : ""} scale-100`
                          : "scale-0"
                      }`}
                      style={{
                        backgroundColor:
                          extractionMode === modeKey
                            ? style.color === "sky"
                              ? "#0ea5e9"
                              : style.color === "emerald"
                                ? "#10b981"
                                : "#a855f7"
                            : "transparent"
                      }}
                    />
                  </div>
                </div>

                <div className="relative flex-1">
                  <div className="flex flex-wrap items-center space-x-2">
                    <div className="flex items-center gap-1.5">
                      <Icon
                        icon={style.icon}
                        className={`${extractionMode === modeKey ? style.textColor : ""}`}
                        width="18"
                        height="18"
                      />
                    </div>
                    <span
                      className={`font-medium text-sm/5 ${extractionMode === modeKey ? style.textColor : "text-gray-900"}`}>
                      {t(`option.extraction.mode.${modeKey}`)}
                    </span>
                    {extractionMode === modeKey && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-xs shadow-sm ${style.bgColor} ${style.textColor} border ${style.borderColor}`}>
                        <Icon
                          icon="line-md:confirm-circle-twotone"
                          className={style.textColor}
                          width="14"
                          height="14"
                        />
                        {t("option.extraction.selected")}
                      </span>
                    )}
                    {modeKey === "hybrid" && extractionMode !== "hybrid" && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 font-medium text-purple-600 text-xs shadow-sm">
                        <Icon
                          icon="line-md:heart-twotone"
                          width="14"
                          height="14"
                          className="text-purple-500"
                        />
                        <span>{t("option.extraction.recommended")}</span>
                      </span>
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm ${extractionMode === modeKey ? style.textColor.replace("-700", "-600") : "text-gray-600"}`}>
                    {t(`option.extraction.mode.${modeKey}.desc`)}
                  </p>
                </div>
              </label>
            )
          })}
        </div>

        {extractionMode === "readability" && (
          <div className="mt-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <Icon
                icon="line-md:lightbulb-twotone"
                className="animate-pulse text-emerald-500"
                width="18"
                height="18"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-medium text-emerald-700">
                    {t("option.extraction.readability.infoTitle")}
                  </p>
                </div>
                <p className="text-emerald-600 text-sm leading-relaxed">
                  {t("option.extraction.readability.info")}
                </p>
              </div>
            </div>
          </div>
        )}

        {extractionMode === "hybrid" && (
          <div className="mt-4 rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <Icon
                icon="line-md:lightbulb-twotone"
                className="animate-pulse text-purple-500"
                width="18"
                height="18"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-medium text-purple-700">
                    {t("option.extraction.hybrid.infoTitle")}
                  </p>
                </div>
                <p className="text-purple-600 text-sm leading-relaxed">
                  {t("option.extraction.hybrid.info")}
                </p>
              </div>
            </div>
          </div>
        )}

        {extractionMode === "selector" && (
          <div className="mt-4 rounded-xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <Icon
                icon="line-md:lightbulb-twotone"
                className="animate-pulse text-sky-500"
                width="18"
                height="18"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-medium text-sky-700">
                    {t("option.extraction.selector.infoTitle")}
                  </p>
                </div>
                <p className="text-sky-600 text-sm leading-relaxed">
                  {t("option.extraction.selector.info")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </OptionSection>
  )
}

export default ExtractionModeSection
