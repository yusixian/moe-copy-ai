import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

import { getDefaultSystemPrompt, useI18n } from "~utils/i18n"

const storage = new Storage({ area: "sync" })

/**
 * Hook for managing AI prompt state
 */
export function useAiPrompt() {
  const { t, locale } = useI18n()
  const defaultPrompt = getDefaultSystemPrompt(locale)

  // Reactive storage reads
  const [storedPrompt] = useStorage<string>(
    { key: "ai_system_prompt", instance: storage },
    (v) => (v === undefined ? "" : v)
  )
  const [modelId] = useStorage<string>(
    { key: "ai_model", instance: storage },
    (v) => (v === undefined ? "" : v)
  )

  const systemPrompt = storedPrompt || defaultPrompt

  // Local editing buffer — tracks whether the user has manually edited
  const [customPrompt, setCustomPrompt] = useState("")
  const userEditedRef = useRef(false)

  // Wrap setCustomPrompt to track manual edits
  const setCustomPromptTracked = useCallback((value: string) => {
    userEditedRef.current = true
    setCustomPrompt(value)
  }, [])

  // Initialize from storage once, and re-sync on locale change when user hasn't edited
  useEffect(() => {
    if (userEditedRef.current) return
    storage
      .get<string>("ai_system_prompt")
      .then((stored) => {
        if (userEditedRef.current) return
        setCustomPrompt(stored || defaultPrompt)
      })
      .catch(console.error)
  }, [defaultPrompt])

  const saveAsDefaultPrompt = useCallback(
    async (prompt: string) => {
      try {
        await storage.set("ai_system_prompt", prompt)
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
    setCustomPrompt: setCustomPromptTracked,
    systemPrompt,
    modelId: modelId || null,
    saveAsDefaultPrompt
  }
}

export default useAiPrompt
