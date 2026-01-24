import { useStorage } from "@plasmohq/storage/hook"
import { useCallback } from "react"

import { Button } from "~/components/ui/button"
import { useI18n } from "~utils/i18n"

interface FloatButtonControlProps {
  onClose?: () => void
}

export function FloatButtonControl({ onClose }: FloatButtonControlProps) {
  const { t } = useI18n()

  const [showFloatButton, setShowFloatButton] = useStorage<string>(
    "show_float_button",
    "true"
  )
  const [, setTempHideButton] = useStorage<boolean>("temp_hide_button", false)

  const handleFloatButtonToggle = useCallback(() => {
    const newValue = showFloatButton === "true" ? "false" : "true"
    setShowFloatButton(newValue)
  }, [showFloatButton, setShowFloatButton])

  const handleTempHideFloat = useCallback(() => {
    setTempHideButton(true)
    onClose?.()
  }, [setTempHideButton, onClose])

  return (
    <div className="card mb-4 p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-medium text-sm text-text-1">
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
  )
}
