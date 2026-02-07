import { Storage } from "@plasmohq/storage"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

import {
  getPresetTemplates,
  MAX_CUSTOM_TEMPLATES
} from "~constants/prompt-presets"
import type { PromptTemplate } from "~constants/types"
import { useI18n } from "~utils/i18n"

const storage = new Storage({ area: "sync" })
const STORAGE_KEY = "ai_prompt_templates"
const OVERRIDES_KEY = "ai_preset_overrides"

interface PresetOverride {
  name?: string
  content?: string
  hidden?: boolean
}

type PresetOverrides = Record<string, PresetOverride>

export function usePromptTemplates() {
  const { t } = useI18n()
  const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([])
  const [presetOverrides, setPresetOverrides] = useState<PresetOverrides>({})
  const [isLoaded, setIsLoaded] = useState(false)

  const presetTemplates = useMemo(() => {
    const defaults = getPresetTemplates(t)
    return defaults
      .filter((tpl) => !presetOverrides[tpl.id]?.hidden)
      .map((tpl) => {
        const override = presetOverrides[tpl.id]
        if (!override || (!override.name && !override.content)) return tpl
        return {
          ...tpl,
          name: override.name ?? tpl.name,
          content: override.content ?? tpl.content,
          isModified: true
        }
      })
  }, [t, presetOverrides])

  const templates = useMemo(
    () => [...presetTemplates, ...customTemplates],
    [presetTemplates, customTemplates]
  )

  const hiddenPresetCount = useMemo(
    () => Object.values(presetOverrides).filter((o) => o.hidden).length,
    [presetOverrides]
  )

  // Load custom templates and preset overrides, then watch for cross-page changes
  useEffect(() => {
    let mounted = true

    Promise.all([
      storage.get<PromptTemplate[]>(STORAGE_KEY),
      storage.get<PresetOverrides>(OVERRIDES_KEY)
    ])
      .then(([templates, overrides]) => {
        if (!mounted) return
        if (templates) setCustomTemplates(templates)
        if (overrides) setPresetOverrides(overrides)
      })
      .catch((err) => console.error("Failed to load templates:", err))
      .finally(() => {
        if (mounted) setIsLoaded(true)
      })

    const watchMap = {
      [STORAGE_KEY]: (change: { newValue?: PromptTemplate[] }) => {
        if (mounted) setCustomTemplates(change.newValue ?? [])
      },
      [OVERRIDES_KEY]: (change: { newValue?: PresetOverrides }) => {
        if (mounted) setPresetOverrides(change.newValue ?? {})
      }
    }
    storage.watch(watchMap)

    return () => {
      mounted = false
      storage.unwatch(watchMap)
    }
  }, [])

  const persistTemplates = useCallback(
    async (updated: PromptTemplate[]) => {
      try {
        await storage.set(STORAGE_KEY, updated)
        setCustomTemplates(updated)
      } catch {
        toast.error(t("toast.promptTemplate.saveFailed"))
      }
    },
    [t]
  )

  const persistOverrides = useCallback(
    async (updated: PresetOverrides) => {
      try {
        await storage.set(OVERRIDES_KEY, updated)
        setPresetOverrides(updated)
      } catch {
        toast.error(t("toast.promptTemplate.saveFailed"))
      }
    },
    [t]
  )

  const createTemplate = useCallback(
    async (name: string, content: string) => {
      if (!name.trim()) {
        toast.error(t("toast.promptTemplate.nameRequired"))
        return
      }
      if (!content.trim()) {
        toast.error(t("toast.promptTemplate.contentRequired"))
        return
      }
      if (customTemplates.length >= MAX_CUSTOM_TEMPLATES) {
        toast.error(
          t("promptTemplate.manager.limitReached", {
            max: MAX_CUSTOM_TEMPLATES
          })
        )
        return
      }
      const now = Date.now()
      const newTemplate: PromptTemplate = {
        id: crypto.randomUUID(),
        name: name.trim(),
        content: content.trim(),
        isPreset: false,
        createdAt: now,
        updatedAt: now
      }
      await persistTemplates([...customTemplates, newTemplate])
      toast.success(t("toast.promptTemplate.saved"))
    },
    [customTemplates, persistTemplates, t]
  )

  const updateTemplate = useCallback(
    async (
      id: string,
      updates: Partial<Pick<PromptTemplate, "name" | "content">>
    ) => {
      if (id.startsWith("preset:")) {
        const next = { ...presetOverrides }
        next[id] = {
          ...next[id],
          ...(updates.name != null && { name: updates.name }),
          ...(updates.content != null && { content: updates.content })
        }
        await persistOverrides(next)
        toast.success(t("toast.promptTemplate.saved"))
      } else {
        const updated = customTemplates.map((tpl) =>
          tpl.id === id ? { ...tpl, ...updates, updatedAt: Date.now() } : tpl
        )
        await persistTemplates(updated)
        toast.success(t("toast.promptTemplate.saved"))
      }
    },
    [customTemplates, persistTemplates, presetOverrides, persistOverrides, t]
  )

  const deleteTemplate = useCallback(
    async (id: string) => {
      if (id.startsWith("preset:")) {
        const next = { ...presetOverrides }
        next[id] = { ...next[id], hidden: true }
        await persistOverrides(next)
        toast.success(t("toast.promptTemplate.deleted"))
      } else {
        const updated = customTemplates.filter((tpl) => tpl.id !== id)
        await persistTemplates(updated)
        toast.success(t("toast.promptTemplate.deleted"))
      }
    },
    [customTemplates, persistTemplates, presetOverrides, persistOverrides, t]
  )

  const resetPreset = useCallback(
    async (id: string) => {
      if (!id.startsWith("preset:")) return
      const next = { ...presetOverrides }
      delete next[id]
      await persistOverrides(next)
      toast.success(t("toast.promptTemplate.saved"))
    },
    [presetOverrides, persistOverrides, t]
  )

  const restoreAllPresets = useCallback(async () => {
    await persistOverrides({})
    toast.success(t("toast.promptTemplate.saved"))
  }, [persistOverrides, t])

  return {
    templates,
    presetTemplates,
    customTemplates,
    isLoaded,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    resetPreset,
    hiddenPresetCount,
    restoreAllPresets
  }
}
