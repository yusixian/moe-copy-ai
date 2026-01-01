import { Icon } from "@iconify/react"
import { useState } from "react"

interface AccordionSectionProps {
  title: string
  icon: string
  children: React.ReactNode
  defaultOpen?: boolean
  maxHeight?: string
}

export function AccordionSection({
  title,
  icon,
  children,
  defaultOpen = false,
  maxHeight
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-lg border border-sky-200 bg-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-sky-50">
        <span className="flex items-center gap-2 font-medium text-sky-700 text-sm">
          <Icon icon={icon} width={16} />
          {title}
        </span>
        <Icon
          icon="mdi:chevron-down"
          width={18}
          className={`text-sky-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`transition-all duration-200 ${
          isOpen
            ? "overflow-auto opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
        style={isOpen && maxHeight ? { maxHeight } : undefined}>
        <div className="border-sky-100 border-t p-3">{children}</div>
      </div>
    </div>
  )
}
