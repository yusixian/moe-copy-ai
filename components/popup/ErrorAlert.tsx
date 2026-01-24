import { Icon } from "@iconify/react"

import { Button } from "~/components/ui/button"
import { useI18n } from "~utils/i18n"

interface ErrorAlertProps {
  error: string
  onRetry: () => void
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
  const { t } = useI18n()

  return (
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
            <p className="font-medium text-red-600">{t("popup.error.title")}</p>
            <p className="flex-1 text-red-600 text-sm">{error}</p>
            <Button variant="outline" size="xs" onClick={onRetry}>
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
            <p className="mt-1 text-red-500">{t("popup.error.suggestion")}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
