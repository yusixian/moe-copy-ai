import { Storage } from "@plasmohq/storage"
import { useCallback, useLayoutEffect, useState } from "react"
import { toast } from "react-toastify"

import { getAiConfig } from "~utils/ai-service"
import { useI18n } from "~utils/i18n"

const storage = new Storage({ area: "sync" })

/**
 * Hook for managing AI prompt state
 */
export function useAiPrompt() {
  const { t } = useI18n()
  const [customPrompt, setCustomPrompt] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [modelId, setModelId] = useState<string | null>(null)

  const fetchSystemPrompt = useCallback(async () => {
    try {
      const config = await getAiConfig()
      setModelId(config.model || null)
      if (!customPrompt) {
        setSystemPrompt(config.systemPrompt)
        setCustomPrompt(config.systemPrompt)
      }
    } catch (error) {
      console.error("Failed to get system prompt:", error)
    }
  }, [customPrompt])

  useLayoutEffect(() => {
    fetchSystemPrompt()
  }, [fetchSystemPrompt])

  const saveAsDefaultPrompt = useCallback(
    async (prompt: string) => {
      try {
        await storage.set("ai_system_prompt", prompt)
        setSystemPrompt(prompt)
        toast.success(t("toast.ai.defaultPromptSaved"))
      } catch (error) {
        toast.error(t("toast.ai.defaultPromptSaveFailed"))
        console.error("Failed to save default prompt:", error)
      }
    },
    [t]
  )

  return {
    customPrompt,
    setCustomPrompt,
    systemPrompt,
    modelId,
    saveAsDefaultPrompt,
    refreshConfig: fetchSystemPrompt
  }
}

export default useAiPrompt
