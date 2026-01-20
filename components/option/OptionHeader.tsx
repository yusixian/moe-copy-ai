import iconUrl from "data-base64:~assets/icon.png"
import { Icon } from "@iconify/react"
import type React from "react"
import { useCallback } from "react"

import { Button } from "~/components/ui/button"
import { useI18n } from "~utils/i18n"

export const OptionHeader: React.FC = () => {
  const { t } = useI18n()

  const handleOpenGithub = useCallback(() => {
    window.open("https://github.com/yusixian/moe-copy-ai", "_blank")
  }, [])

  return (
    <header className="card mb-6 flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <img
          src={iconUrl}
          alt="Moe Copy AI"
          className="h-10 w-10 flex-shrink-0"
        />
        <div>
          <h1 className="font-bold text-2xl text-accent-blue">
            {t("app.name")}
          </h1>
          <p className="text-sm text-text-2">{t("app.description")}</p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleOpenGithub}
        title={t("sidepanel.github")}>
        <Icon icon="mdi:github" width="24" height="24" />
      </Button>
    </header>
  )
}

export default OptionHeader
