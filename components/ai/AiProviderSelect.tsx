import { Icon } from "@iconify/react"

import { Button } from "~/components/ui/button"
import { AI_PROVIDERS, getProviderByBaseURL } from "~constants/ai-providers"

interface AiProviderSelectProps {
  value: string
  onChange: (baseURL: string) => void
  compact?: boolean
}

function AiProviderSelect({
  value,
  onChange,
  compact = false
}: AiProviderSelectProps) {
  const activeId = getProviderByBaseURL(value)?.id

  return (
    <div
      className={`scrollbar-none flex overflow-x-auto ${compact ? "gap-1" : "gap-1.5"}`}>
      {AI_PROVIDERS.map((provider) => (
        <Button
          key={provider.id}
          variant={activeId === provider.id ? "secondary" : "ghost"}
          size="xs"
          className={compact ? "h-6 shrink-0 px-1.5 text-[10px]" : "shrink-0"}
          onClick={() => onChange(provider.baseURL)}>
          <Icon
            icon={provider.icon}
            className={compact ? "mr-0.5" : "mr-1"}
            width={compact ? 12 : 14}
          />
          {provider.name}
        </Button>
      ))}
    </div>
  )
}

export default AiProviderSelect
