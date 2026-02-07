import { Icon } from "@iconify/react"
import { useCallback, useState } from "react"

import { MAX_CUSTOM_TEMPLATES } from "~constants/prompt-presets"
import type { PromptTemplate } from "~constants/types"
import { usePromptTemplates } from "~hooks/usePromptTemplates"
import { useI18n } from "~utils/i18n"

import { Button } from "../ui/button"

function PromptTemplateManager({ showTitle = true }: { showTitle?: boolean }) {
  const { t } = useI18n()
  const {
    presetTemplates,
    customTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    resetPreset,
    hiddenPresetCount,
    restoreAllPresets
  } = usePromptTemplates()

  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [newContent, setNewContent] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editContent, setEditContent] = useState("")

  const handleAdd = useCallback(async () => {
    const ok = await createTemplate(newName, newContent)
    if (ok) {
      setIsAdding(false)
      setNewName("")
      setNewContent("")
    }
  }, [newName, newContent, createTemplate])

  const startEdit = useCallback((tpl: PromptTemplate) => {
    setEditingId(tpl.id)
    setEditName(tpl.name)
    setEditContent(tpl.content)
  }, [])

  const handleUpdate = useCallback(async () => {
    if (editingId && editName.trim() && editContent.trim()) {
      await updateTemplate(editingId, {
        name: editName.trim(),
        content: editContent.trim()
      })
      setEditingId(null)
    }
  }, [editingId, editName, editContent, updateTemplate])

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      const msg = id.startsWith("preset:")
        ? t("promptTemplate.manager.confirmDeletePreset", { name })
        : t("promptTemplate.manager.confirmDelete", { name })
      if (window.confirm(msg)) {
        await deleteTemplate(id)
      }
    },
    [deleteTemplate, t]
  )

  const handleReset = useCallback(
    async (id: string) => {
      await resetPreset(id)
    },
    [resetPreset]
  )

  const canAdd = customTemplates.length < MAX_CUSTOM_TEMPLATES

  const renderEditForm = (tplId: string) => (
    <div
      key={tplId}
      className="space-y-2 rounded-lg border border-accent-blue/30 bg-accent-blue-ghost p-3">
      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        className="w-full rounded border border-line-1 bg-content p-2 text-sm focus:border-accent-blue focus:outline-none"
        placeholder={t("promptTemplate.manager.name.placeholder")}
      />
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        rows={4}
        className="w-full rounded border border-line-1 bg-content p-2 text-sm focus:border-accent-blue focus:outline-none"
        placeholder={t("promptTemplate.manager.content.placeholder")}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="xs" onClick={() => setEditingId(null)}>
          {t("common.cancel")}
        </Button>
        <Button size="xs" onClick={handleUpdate}>
          {t("common.save")}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {showTitle && (
        <h3 className="flex items-center gap-2 font-medium text-text-1">
          <Icon icon="mdi:file-document-multiple-outline" width={18} />
          {t("promptTemplate.manager.title")}
        </h3>
      )}

      {/* Preset templates */}
      <div>
        <h4 className="mb-2 text-sm text-text-2">
          {t("promptTemplate.manager.presets")}
        </h4>
        <div className="space-y-2">
          {presetTemplates.map((tpl) =>
            editingId === tpl.id ? (
              renderEditForm(tpl.id)
            ) : (
              <div
                key={tpl.id}
                className="flex items-center gap-2 rounded-lg border border-line-1 bg-content px-3 py-2">
                {tpl.icon && (
                  <Icon
                    icon={tpl.icon}
                    width={16}
                    className="shrink-0 text-text-3"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-text-1">{tpl.name}</div>
                  {tpl.description && (
                    <div className="truncate text-text-3 text-xs">
                      {tpl.description}
                    </div>
                  )}
                </div>
                {tpl.isModified && (
                  <button
                    type="button"
                    onClick={() => handleReset(tpl.id)}
                    className="shrink-0 rounded p-1 text-text-3 hover:bg-fill-1 hover:text-accent-blue"
                    title={t("promptTemplate.manager.resetPreset")}>
                    <Icon icon="mdi:restore" width={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(tpl)}
                  className="shrink-0 rounded p-1 text-text-3 hover:bg-fill-1 hover:text-accent-blue">
                  <Icon icon="mdi:pencil-outline" width={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tpl.id, tpl.name)}
                  className="shrink-0 rounded p-1 text-text-3 hover:bg-error-ghost hover:text-error">
                  <Icon icon="mdi:delete-outline" width={14} />
                </button>
              </div>
            )
          )}
        </div>

        {/* Hidden presets notice */}
        {hiddenPresetCount > 0 && (
          <div className="mt-2 flex items-center justify-between rounded-lg border border-line-1 bg-fill-1 px-3 py-2">
            <span className="text-text-3 text-xs">
              {t("promptTemplate.manager.hiddenCount", {
                count: hiddenPresetCount
              })}
            </span>
            <Button variant="ghost" size="xs" onClick={restoreAllPresets}>
              <Icon icon="mdi:restore" className="mr-1" width={14} />
              {t("promptTemplate.manager.restoreAll")}
            </Button>
          </div>
        )}
      </div>

      {/* Custom templates */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm text-text-2">
            {t("promptTemplate.manager.custom")}
          </h4>
          <span className="text-text-3 text-xs">
            {t("promptTemplate.manager.limit", {
              max: MAX_CUSTOM_TEMPLATES,
              count: customTemplates.length
            })}
          </span>
        </div>

        <div className="space-y-2">
          {customTemplates.map((tpl) =>
            editingId === tpl.id ? (
              renderEditForm(tpl.id)
            ) : (
              <div
                key={tpl.id}
                className="flex items-center gap-2 rounded-lg border border-line-1 bg-content px-3 py-2">
                <Icon
                  icon="mdi:file-document-outline"
                  width={16}
                  className="shrink-0 text-text-3"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-text-1">{tpl.name}</div>
                  <div className="truncate text-text-3 text-xs">
                    {tpl.content}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(tpl)}
                  className="shrink-0 rounded p-1 text-text-3 hover:bg-fill-1 hover:text-accent-blue">
                  <Icon icon="mdi:pencil-outline" width={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tpl.id, tpl.name)}
                  className="shrink-0 rounded p-1 text-text-3 hover:bg-error-ghost hover:text-error">
                  <Icon icon="mdi:delete-outline" width={14} />
                </button>
              </div>
            )
          )}

          {customTemplates.length === 0 && !isAdding && (
            <div className="py-4 text-center text-text-3 text-xs">
              {t("promptTemplate.selector.empty")}
            </div>
          )}
        </div>

        {/* Add form */}
        {isAdding ? (
          <div className="mt-2 space-y-2 rounded-lg border border-accent-blue/30 bg-accent-blue-ghost p-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full rounded border border-line-1 bg-content p-2 text-sm focus:border-accent-blue focus:outline-none"
              placeholder={t("promptTemplate.manager.name.placeholder")}
            />
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              className="w-full rounded border border-line-1 bg-content p-2 text-sm focus:border-accent-blue focus:outline-none"
              placeholder={t("promptTemplate.manager.content.placeholder")}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setIsAdding(false)
                  setNewName("")
                  setNewContent("")
                }}>
                {t("common.cancel")}
              </Button>
              <Button size="xs" onClick={handleAdd}>
                {t("common.save")}
              </Button>
            </div>
          </div>
        ) : (
          canAdd && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setIsAdding(true)}>
              <Icon icon="mdi:plus" className="mr-1" width={16} />
              {t("promptTemplate.manager.add")}
            </Button>
          )
        )}

        {!canAdd && !isAdding && (
          <p className="mt-2 text-warning text-xs">
            {t("promptTemplate.manager.limitReached", {
              max: MAX_CUSTOM_TEMPLATES
            })}
          </p>
        )}
      </div>
    </div>
  )
}

export default PromptTemplateManager
