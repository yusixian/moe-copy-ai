import { Icon } from "@iconify/react"
import { useState } from "react"

import { Button } from "~/components/ui/button"

interface AccordionSectionProps {
  title: string
  icon: string
  children: React.ReactNode
  defaultOpen?: boolean
  maxHeight?: string
  contentBorder?: boolean
}

export function AccordionSection({
  title,
  icon,
  children,
  defaultOpen = false,
  maxHeight,
  contentBorder = true
}: AccordionSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="overflow-hidden rounded-lg border border-sky-200 bg-white">
      <Button
        variant="ghost"
        fullWidth
        onClick={() => setIsOpen(!isOpen)}
        className="justify-between p-3 hover:bg-sky-50">
        <span className="flex items-center gap-2 font-medium text-sky-700 text-sm">
          <Icon icon={icon} width={16} />
          {title}
        </span>
        <Icon
          icon="mdi:chevron-down"
          width={18}
          className={`text-sky-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>
      <div
        className={`transition-all duration-200 ${
          isOpen
            ? "overflow-auto opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
        style={isOpen && maxHeight ? { maxHeight } : undefined}>
        <div
          className={`p-3 ${contentBorder ? "border-sky-100 border-t" : ""}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
