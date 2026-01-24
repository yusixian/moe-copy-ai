import { Icon } from "@iconify/react"
import type { ReactNode } from "react"

import CopyableTextField from "~/components/CopyableTextField"
import SelectorDropdown from "~/components/SelectorDropdown"
import type { SelectorResult } from "~constants/types"

interface SelectorConfig {
  type: "title" | "author" | "date" | "content"
  selectors: string[]
  selectedIndex: number
  results: SelectorResult[]
  onSelectorChange: (index: number) => void
  onSelectContent: (selector: string, contentIndex: number) => void
}

interface MetadataFieldSectionProps {
  icon: string
  label: string
  value: string
  selectorConfig?: SelectorConfig
  children?: ReactNode
}

export function MetadataFieldSection({
  icon,
  label,
  value,
  selectorConfig,
  children
}: MetadataFieldSectionProps) {
  return (
    <div className="mb-4">
      <h2 className="mb-2 flex flex-wrap items-center gap-2 font-semibold text-base">
        <Icon
          icon={icon}
          width="18"
          height="18"
          className="flex-shrink-0 text-accent-blue"
        />
        <span className="text-text-1">{label}</span>
        {selectorConfig && selectorConfig.selectors.length > 0 && (
          <SelectorDropdown
            type={selectorConfig.type}
            selectors={selectorConfig.selectors}
            selectedIndex={selectorConfig.selectedIndex}
            results={selectorConfig.results}
            onChange={selectorConfig.onSelectorChange}
            onSelectContent={selectorConfig.onSelectContent}
          />
        )}
      </h2>
      {children ?? <CopyableTextField text={value} />}
    </div>
  )
}
