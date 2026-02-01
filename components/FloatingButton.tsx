import iconUrl from "data-base64:~assets/icon.png"
import { Icon } from "@iconify/react"

import { cn } from "~utils"
import { useI18n } from "~utils/i18n"
import { useTheme } from "~utils/theme"

interface FloatingButtonProps {
  onClick: () => void
  isOpen: boolean
}

const FloatingButton = ({ onClick, isOpen }: FloatingButtonProps) => {
  const { t } = useI18n()
  const { resolvedTheme } = useTheme()

  // Light mode: original brand colors (sky blue + indigo)
  const lightModeClasses = isOpen
    ? "rotate-45 border-pink-200 bg-pink-50 text-pink-500"
    : "border-sky-100 bg-white text-sky-400 hover:border-indigo-200 hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 hover:text-sky-500"

  // Dark mode: design tokens
  const darkModeClasses = isOpen
    ? "rotate-45 border-pink-200 bg-pink-50 text-pink-500"
    : "border-line-1 bg-content-solid text-accent-blue hover:border-accent-blue/30 hover:bg-fill-1"

  return (
    <button
      type="button"
      className={cn(
        "fixed right-3 bottom-10 z-[1000] flex h-10 w-10 items-center justify-center rounded-full border border-opacity-60 opacity-70 shadow-md transition-all duration-300 hover:opacity-100",
        resolvedTheme === "light" ? lightModeClasses : darkModeClasses
      )}
      onClick={onClick}
      title={
        isOpen
          ? t("popup.floatButton.closeTooltip")
          : t("popup.floatButton.openTooltip")
      }>
      {isOpen ? (
        <Icon
          icon="line-md:close"
          width="20"
          height="20"
          className="rotate-45 text-opacity-80"
        />
      ) : (
        <img src={iconUrl} alt="Moe Copy AI" className="h-[36px] w-[36px]" />
      )}
    </button>
  )
}

export default FloatingButton
