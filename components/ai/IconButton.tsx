import { Icon } from "@iconify/react"

import { cn } from "~utils"

// 带图标的按钮组件
interface IconButtonProps {
  onClick: () => void
  icon: string
  className?: string
  title?: string
  children: React.ReactNode
}

const IconButton: React.FC<IconButtonProps> = ({
  onClick,
  icon,
  className,
  title,
  children
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex transform items-center rounded-full px-3 py-1 text-sm font-medium transition-all hover:scale-105",
      className
    )}
    title={title}>
    <Icon icon={icon} className="mr-1" width="18" height="18" />
    {children}
  </button>
)
export default IconButton
