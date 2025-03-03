import { Icon } from "@iconify/react"
import { memo, useCallback, useState } from "react"

import { cn } from "~utils"

interface DownloadButtonProps {
  fileUrl: string
  fileName: string
  title?: string
  iconName?: string
  className?: string
  iconClassName?: string
  iconSize?: number
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  fileUrl,
  fileName,
  title = "点击下载可爱图片～",
  iconName,
  className,
  iconClassName,
  iconSize = 24
}) => {
  // 是否悬停在下载按钮上
  const [isHovering, setIsHovering] = useState(false)

  // 处理下载
  const handleDownload = useCallback(() => {
    // 创建一个临时的a标签用于下载
    const link = document.createElement("a")
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [fileUrl, fileName])
  return (
    <button
      onClick={handleDownload}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border-2 border-white/80 bg-gradient-to-br from-pink-400 to-purple-400 text-white shadow-md transition-all hover:scale-110 hover:from-pink-500 hover:to-purple-500 hover:shadow-pink-300/60",
        className
      )}
      title={title}>
      <Icon
        icon={iconName ?? "line-md:downloading-loop"}
        className={`${isHovering ? "animate-bounce" : ""} ${iconClassName}`}
        width={iconSize}
        height={iconSize}
      />
    </button>
  )
}
DownloadButton.displayName = "DownloadButton"
export default memo(DownloadButton)
