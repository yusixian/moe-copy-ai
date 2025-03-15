import { Icon } from "@iconify/react"
import React from "react"

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
    <div className="mb-6 rounded-xl border-2 border-sky-200 bg-white p-6 shadow-md">
      <h2 className="mb-4 flex items-center text-xl font-semibold text-sky-600">
        <Icon icon={icon} className="mr-2" />
        {title}
      </h2>
      {children}
    </div>
  )
}

export default OptionSection
