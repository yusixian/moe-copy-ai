import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"
import { useCallback, useMemo } from "react"
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

  const [customTemplates, setCustomTemplates] = useStorage<PromptTemplate[]>(
    { key: STORAGE_KEY, instance: storage },
    (v) => (v === undefined ? [] : v)
  )

  const [presetOverrides, setPresetOverrides] = useStorage<PresetOverrides>(
    { key: OVERRIDES_KEY, instance: storage },
    (v) => (v === undefined ? {} : v)
  )

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

  const createTemplate = useCallback(
    async (name: string, content: string): Promise<boolean> => {
      if (!name.trim()) {
        toast.error(t("toast.promptTemplate.nameRequired"))
        return false
      }
      if (!content.trim()) {
        toast.error(t("toast.promptTemplate.contentRequired"))
        return false
      }
      if (customTemplates.length >= MAX_CUSTOM_TEMPLATES) {
        toast.error(
          t("promptTemplate.manager.limitReached", {
            max: MAX_CUSTOM_TEMPLATES
          })
        )
        return false
      }
      try {
        const now = Date.now()
        const newTemplate: PromptTemplate = {
          id: crypto.randomUUID(),
          name: name.trim(),
          content: content.trim(),
          isPreset: false,
          createdAt: now,
          updatedAt: now
        }
        await setCustomTemplates([...customTemplates, newTemplate])
        toast.success(t("toast.promptTemplate.saved"))
        return true
      } catch {
        toast.error(t("toast.promptTemplate.saveFailed"))
        return false
      }
    },
    [customTemplates, setCustomTemplates, t]
  )

  const updateTemplate = useCallback(
    async (
      id: string,
      updates: Partial<Pick<PromptTemplate, "name" | "content">>
    ) => {
      try {
        if (id.startsWith("preset:")) {
          const next = { ...presetOverrides }
          next[id] = {
            ...next[id],
            ...(updates.name != null && { name: updates.name }),
            ...(updates.content != null && { content: updates.content })
          }
          await setPresetOverrides(next)
        } else {
          const updated = customTemplates.map((tpl) =>
            tpl.id === id ? { ...tpl, ...updates, updatedAt: Date.now() } : tpl
          )
          await setCustomTemplates(updated)
        }
        toast.success(t("toast.promptTemplate.saved"))
      } catch {
        toast.error(t("toast.promptTemplate.saveFailed"))
      }
    },
    [
      customTemplates,
      setCustomTemplates,
      presetOverrides,
      setPresetOverrides,
      t
    ]
  )

  const deleteTemplate = useCallback(
    async (id: string) => {
      try {
        if (id.startsWith("preset:")) {
          const next = { ...presetOverrides }
          next[id] = { ...next[id], hidden: true }
          await setPresetOverrides(next)
        } else {
          const updated = customTemplates.filter((tpl) => tpl.id !== id)
          await setCustomTemplates(updated)
        }
        toast.success(t("toast.promptTemplate.deleted"))
      } catch {
        toast.error(t("toast.promptTemplate.saveFailed"))
      }
    },
    [
      customTemplates,
      setCustomTemplates,
      presetOverrides,
      setPresetOverrides,
      t
    ]
  )

  const resetPreset = useCallback(
    async (id: string) => {
      if (!id.startsWith("preset:")) return
      try {
        const next = { ...presetOverrides }
        delete next[id]
        await setPresetOverrides(next)
        toast.success(t("toast.promptTemplate.saved"))
      } catch {
        toast.error(t("toast.promptTemplate.saveFailed"))
      }
    },
    [presetOverrides, setPresetOverrides, t]
  )

  const restoreAllPresets = useCallback(async () => {
    try {
      await setPresetOverrides({})
      toast.success(t("toast.promptTemplate.saved"))
    } catch {
      toast.error(t("toast.promptTemplate.saveFailed"))
    }
  }, [setPresetOverrides, t])

  return {
    templates,
    presetTemplates,
    customTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    resetPreset,
    hiddenPresetCount,
    restoreAllPresets
  }
}
