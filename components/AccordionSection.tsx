import { Icon } from "@iconify/react"
import { useState } from "react"

import { Button } from "~/components/ui/button"
import { cn } from "~utils"

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
    <div className="card overflow-hidden transition-all duration-300">
      <Button
        variant="ghost"
        fullWidth
        onClick={() => setIsOpen(!isOpen)}
        className="card group justify-between rounded-[inherit] p-3 hover:bg-content-hover">
        <span className="flex items-center gap-2 text-accent-blue text-sm">
          <Icon icon={icon} width={16} className="text-accent-blue" />
          {title}
        </span>
        <Icon
          icon="mdi:chevron-down"
          width={18}
          className={cn(
            "text-text-secondary transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </Button>
      <div
        className={cn(
          "transition-all duration-200",
          isOpen
            ? "overflow-auto opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        )}
        style={isOpen && maxHeight ? { maxHeight } : undefined}>
        <div className={cn("p-3", contentBorder && "border-line-1 border-t")}>
          {children}
        </div>
      </div>
    </div>
  )
}
