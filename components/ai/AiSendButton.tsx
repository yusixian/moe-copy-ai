import { Icon } from "@iconify/react"
import { memo } from "react"

import { cn } from "~utils/cn"
import { useI18n } from "~utils/i18n"

interface AiSendButtonProps {
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  collapsed?: boolean
  className?: string
}

export const AiSendButton = memo(function AiSendButton({
  onClick,
  disabled = false,
  isLoading = false,
  collapsed = false,
  className
}: AiSendButtonProps) {
  const { t } = useI18n()

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "ai-send-button group",
        collapsed && "collapsed",
        className
      )}>
      {isLoading ? (
        collapsed ? (
          <span className="ai-send-button-icon">
            <Icon icon="mdi:loading" className="animate-spin" />
          </span>
        ) : (
          <span className="ai-send-button-text flex items-center gap-1">
            <Icon icon="mdi:loading" className="animate-spin" />
            {t("ai.panel.sending")}
          </span>
        )
      ) : (
        <>
          <span className="ai-send-button-text">{t("ai.panel.send")}</span>
          <span className="ai-send-button-icon">
            <span className="group-hover:animate-fly group-disabled:animate-none">
              <Icon
                icon="mdi:send"
                className="-rotate-45 transition-transform duration-300 group-hover:rotate-0 group-disabled:-rotate-45"
              />
            </span>
          </span>
        </>
      )}
    </button>
  )
})
