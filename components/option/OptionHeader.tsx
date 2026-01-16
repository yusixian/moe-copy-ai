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
    <header className="mb-6 flex items-center justify-between rounded-lg border border-blue-200 bg-white p-4 shadow-sm">
      <div>
        <h1 className="font-bold text-2xl text-blue-600">{t("app.name")}</h1>
        <p className="text-blue-500 text-sm">{t("app.description")}</p>
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
