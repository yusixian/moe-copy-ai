import { Icon } from "@iconify/react"

import { cn } from "~utils"

interface FloatingButtonProps {
  onClick: () => void
  isOpen: boolean
}

const FloatingButton = ({ onClick, isOpen }: FloatingButtonProps) => {
  return (
    <button
      type="button"
      className={cn(
        "fixed right-3 bottom-10 z-[1000] flex h-10 w-10 items-center justify-center rounded-full border border-opacity-60 opacity-70 shadow-md transition-all duration-300 hover:opacity-100",
        isOpen
          ? "rotate-45 border-pink-200 bg-pink-50 text-pink-500"
          : "border-sky-100 bg-white text-sky-400 hover:border-indigo-200 hover:bg-gradient-to-r hover:from-sky-50 hover:to-indigo-50 hover:text-sky-500"
      )}
      onClick={onClick}
      title={isOpen ? "关闭萌抓" : "打开萌抓"}>
      {isOpen ? (
        <Icon
          icon="line-md:close"
          width="20"
          height="20"
          className="rotate-45 text-opacity-80"
        />
      ) : (
        <div className="flex flex-col items-center text-sm opacity-80">萌</div>
      )}
    </button>
  )
}

export default FloatingButton
