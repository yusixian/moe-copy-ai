import { Icon } from "@iconify/react"
import type React from "react"

interface OptionSectionProps {
  title: string
  icon: string
  children: React.ReactNode
}

export const OptionSection: React.FC<OptionSectionProps> = ({
  title,
  icon,
  children
}) => {
  return (
    <div className="card mb-4 p-4">
      <h2 className="mb-4 flex items-center font-semibold text-text-1 text-xl">
        <Icon icon={icon} className="mr-2 text-accent-blue" />
        {title}
      </h2>
      {children}
    </div>
  )
}

export default OptionSection
