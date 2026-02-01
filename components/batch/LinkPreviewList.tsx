import { Icon } from "@iconify/react"
import { memo, useMemo, useReducer } from "react"

import { Button } from "~/components/ui/button"
import type {
  ExtractedLink,
  NextPageButtonInfo,
  SelectedElementInfo
} from "~constants/types"
import type { LinkFilterConfig } from "~hooks/useBatchScrape"
import { useLinkFilter } from "~hooks/useLinkFilter"
import { useSelectionSet } from "~hooks/useSelectionSet"
import { cn } from "~utils"
import { downloadTextFile } from "~utils/download"
import { useI18n } from "~utils/i18n"
import { exportLinksToJson, exportLinksToMarkdown } from "~utils/link-exporter"

import LinkFilterBar from "./LinkFilterBar"

// State and action types for the link list reducer
interface LinkListState {
  isExporting: boolean
  editingIndex: number | null
  editForm: { url: string; text: string }
  isAdding: boolean
  addForm: { url: string; text: string }
}

type LinkListAction =
  | { type: "START_EXPORT" }
  | { type: "END_EXPORT" }
  | { type: "START_EDIT"; index: number; url: string; text: string }
  | { type: "UPDATE_EDIT_FORM"; url?: string; text?: string }
  | { type: "CANCEL_EDIT" }
  | { type: "SAVE_EDIT" }
  | { type: "START_ADD" }
  | { type: "UPDATE_ADD_FORM"; url?: string; text?: string }
  | { type: "CANCEL_ADD" }
  | { type: "SAVE_ADD" }

const initialState: LinkListState = {
  isExporting: false,
  editingIndex: null,
  editForm: { url: "", text: "" },
  isAdding: false,
  addForm: { url: "", text: "" }
}

function linkListReducer(
  state: LinkListState,
  action: LinkListAction
): LinkListState {
  switch (action.type) {
    case "START_EXPORT":
      return { ...state, isExporting: true }
    case "END_EXPORT":
      return { ...state, isExporting: false }
    case "START_EDIT":
      return {
        ...state,
        editingIndex: action.index,
        editForm: { url: action.url, text: action.text }
      }
    case "UPDATE_EDIT_FORM":
      return {
        ...state,
        editForm: {
          url: action.url ?? state.editForm.url,
          text: action.text ?? state.editForm.text
        }
      }
    case "CANCEL_EDIT":
    case "SAVE_EDIT":
      return { ...state, editingIndex: null, editForm: { url: "", text: "" } }
    case "START_ADD":
      return { ...state, isAdding: true }
    case "UPDATE_ADD_FORM":
      return {
        ...state,
        addForm: {
          url: action.url ?? state.addForm.url,
          text: action.text ?? state.addForm.text
        }
      }
    case "CANCEL_ADD":
    case "SAVE_ADD":
      return { ...state, isAdding: false, addForm: { url: "", text: "" } }
    default:
      return state
  }
}

interface LinkPreviewListProps {
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  nextPageButton: NextPageButtonInfo | null
  isSelectingNextPage: boolean
  onStartScrape: (
    selectedLinks: ExtractedLink[],
    nextPageXPath?: string,
    linkContainerSelector?: string,
    filterConfig?: LinkFilterConfig
  ) => void
  onCancel: () => void
  onReselect: () => void
  onAddLink: (url: string, text?: string) => void
  onUpdateLink: (index: number, url: string, text: string) => void
  onRemoveLink: (index: number) => void
  onSelectNextPage: () => void
  onClearNextPage: () => void
}

const LinkPreviewList = memo(function LinkPreviewList({
  elementInfo,
  links,
  nextPageButton,
  isSelectingNextPage,
  onStartScrape,
  onCancel,
  onReselect,
  onAddLink,
  onUpdateLink,
  onRemoveLink,
  onSelectNextPage,
  onClearNextPage
}: LinkPreviewListProps) {
  const { t } = useI18n()

  // Centralized state management for editing/adding modes
  const [state, dispatch] = useReducer(linkListReducer, initialState)
  const { isExporting, editingIndex, editForm, isAdding, addForm } = state

  // 过滤功能
  const {
    filterState,
    setPattern,
    setTarget,
    setMode,
    applyPreset,
    clearFilter,
    filterLinks
  } = useLinkFilter()

  // 过滤后的链接
  const filteredLinks = useMemo(() => filterLinks(links), [filterLinks, links])

  // 开始编辑
  const startEdit = (link: ExtractedLink) => {
    dispatch({
      type: "START_EDIT",
      index: link.index,
      url: link.url,
      text: link.text
    })
  }

  // 保存编辑
  const saveEdit = () => {
    if (editingIndex !== null && editForm.url.trim()) {
      onUpdateLink(
        editingIndex,
        editForm.url.trim(),
        editForm.text.trim() || editForm.url.trim()
      )
      dispatch({ type: "SAVE_EDIT" })
    }
  }

  // 取消编辑
  const cancelEdit = () => {
    dispatch({ type: "CANCEL_EDIT" })
  }

  // 添加新链接
  const handleAddLink = () => {
    if (addForm.url.trim()) {
      onAddLink(addForm.url.trim(), addForm.text.trim() || undefined)
      dispatch({ type: "SAVE_ADD" })
    }
  }

  // 取消添加
  const cancelAdd = () => {
    dispatch({ type: "CANCEL_ADD" })
  }

  // 使用 useSelectionSet 管理选中状态（基于过滤后的链接）
  const {
    selectedItems: selectedLinks,
    selectedCount,
    isSelected,
    isAllSelected,
    toggle: toggleLink,
    toggleAll
  } = useSelectionSet({
    items: filteredLinks,
    getKey: (link) => link.index
  })

  // 导出为 Markdown
  const handleExportMarkdown = () => {
    dispatch({ type: "START_EXPORT" })
    try {
      const content = exportLinksToMarkdown(links)
      const date = new Date().toISOString().split("T")[0]
      downloadTextFile(content, `links-${date}.md`, "text/markdown")
    } catch (error) {
      console.error(t("batch.preview.export.markdownError"), error)
    } finally {
      dispatch({ type: "END_EXPORT" })
    }
  }

  // 导出为 JSON
  const handleExportJson = () => {
    dispatch({ type: "START_EXPORT" })
    try {
      const content = exportLinksToJson(links)
      const date = new Date().toISOString().split("T")[0]
      downloadTextFile(content, `links-${date}.json`, "application/json")
    } catch (error) {
      console.error(t("batch.preview.export.jsonError"), error)
    } finally {
      dispatch({ type: "END_EXPORT" })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 元素信息 */}
      {elementInfo && (
        <div className="flex items-center justify-between rounded-lg bg-content-alt p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-accent-indigo-ghost px-2 py-0.5 font-medium text-accent-indigo text-xs">
              {elementInfo.tagName}
            </span>
            {elementInfo.id && (
              <span className="text-text-3 text-xs">#{elementInfo.id}</span>
            )}
            {elementInfo.className && (
              <span className="text-text-4 text-xs">
                .{elementInfo.className.split(" ")[0]}
              </span>
            )}
          </div>
          <Button variant="ghost" size="xs" onClick={onReselect}>
            <Icon icon="mdi:refresh" className="mr-1 h-3.5 w-3.5" />
            {t("batch.preview.reselect")}
          </Button>
        </div>
      )}

      {/* 过滤栏 */}
      {links.length > 0 && (
        <LinkFilterBar
          links={links}
          filteredLinks={filteredLinks}
          pattern={filterState.pattern}
          target={filterState.target}
          mode={filterState.mode}
          isValid={filterState.isValid}
          error={filterState.error}
          onPatternChange={setPattern}
          onTargetChange={setTarget}
          onModeChange={setMode}
          onApplyPreset={applyPreset}
          onClear={clearFilter}
        />
      )}

      {/* 链接统计和导出 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-line-1 text-success focus:ring-success"
            />
            <span className="text-text-3 text-xs">
              {t("batch.preview.selectAll")}
            </span>
          </label>
          <span className="text-line-1">|</span>
          <span className="text-sm text-text-2">
            {t("batch.preview.selected")}{" "}
            <span className="font-bold text-success">{selectedCount}</span>/
            {filteredLinks.length}
            {filteredLinks.length !== links.length && (
              <span className="ml-1 text-text-4 text-xs">
                {t("batch.preview.total", { total: links.length })}
              </span>
            )}
          </span>
        </div>
        {links.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-text-4">{t("batch.preview.export")}</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleExportMarkdown}
              disabled={isExporting}>
              <Icon
                icon="mdi:file-document-outline"
                className="mr-1 h-3.5 w-3.5"
              />
              MD
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleExportJson}
              disabled={isExporting}>
              <Icon icon="mdi:code-json" className="mr-1 h-3.5 w-3.5" />
              JSON
            </Button>
          </div>
        )}
      </div>

      {/* 链接列表 */}
      <div className="max-h-64 overflow-y-auto rounded-lg border border-line-1">
        {filteredLinks.map((link, idx) => (
          <div
            key={link.index}
            className={cn(
              "flex items-start gap-3 px-3 py-2 transition-colors hover:bg-content-alt",
              idx !== filteredLinks.length - 1 && "border-line-2 border-b",
              !isSelected(link.index) && "opacity-50"
            )}>
            <input
              type="checkbox"
              checked={isSelected(link.index)}
              onChange={() => toggleLink(link.index)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-line-1 text-success focus:ring-success"
            />
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-content-alt text-text-3 text-xs">
              {link.index + 1}
            </span>

            {editingIndex === link.index ? (
              // 编辑模式
              <div className="min-w-0 flex-1 space-y-1.5">
                <input
                  type="text"
                  value={editForm.text}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_EDIT_FORM", text: e.target.value })
                  }
                  placeholder={t("batch.preview.linkTitle")}
                  className="w-full rounded border border-line-1 bg-content-solid px-2 py-1 text-sm text-text-1 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
                <input
                  type="text"
                  value={editForm.url}
                  onChange={(e) =>
                    dispatch({ type: "UPDATE_EDIT_FORM", url: e.target.value })
                  }
                  placeholder={t("batch.preview.linkUrl")}
                  className="w-full rounded border border-line-1 bg-content-solid px-2 py-1 text-text-1 text-xs focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                />
                <div className="flex gap-2">
                  <Button variant="success" size="xs" onClick={saveEdit}>
                    <Icon icon="mdi:check" className="mr-1 h-3 w-3" />
                    {t("batch.preview.save")}
                  </Button>
                  <Button variant="secondary" size="xs" onClick={cancelEdit}>
                    {t("batch.preview.cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              // 正常模式
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-sm text-text-1">
                    {link.text || t("batch.preview.noTitle")}
                  </div>
                  <div className="truncate text-text-4 text-xs">{link.url}</div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => startEdit(link)}
                    title={t("batch.preview.edit")}>
                    <Icon icon="mdi:pencil" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => onRemoveLink(link.index)}
                    title={t("batch.preview.delete")}>
                    <Icon icon="mdi:close" className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 添加链接 */}
      {isAdding ? (
        <div className="space-y-2 rounded-lg border border-accent-blue/30 bg-accent-blue-ghost p-3">
          <div className="font-medium text-text-2 text-xs">
            {t("batch.preview.addNew")}
          </div>
          <input
            type="text"
            value={addForm.url}
            onChange={(e) =>
              dispatch({ type: "UPDATE_ADD_FORM", url: e.target.value })
            }
            placeholder={t("batch.preview.linkUrl")}
            className="w-full rounded border border-line-1 bg-content-solid px-2.5 py-1.5 text-sm text-text-1 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
          <input
            type="text"
            value={addForm.text}
            onChange={(e) =>
              dispatch({ type: "UPDATE_ADD_FORM", text: e.target.value })
            }
            placeholder={t("batch.preview.linkTitleOptional")}
            className="w-full rounded border border-line-1 bg-content-solid px-2.5 py-1.5 text-sm text-text-1 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
          />
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleAddLink}
              disabled={!addForm.url.trim()}>
              <Icon icon="mdi:plus" className="mr-1 h-4 w-4" />
              {t("batch.preview.add")}
            </Button>
            <Button variant="secondary" size="sm" onClick={cancelAdd}>
              {t("batch.preview.cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="border-dashed"
          onClick={() => dispatch({ type: "START_ADD" })}>
          <Icon icon="mdi:plus" className="mr-1 h-4 w-4" />
          {t("batch.preview.addLink")}
        </Button>
      )}

      {/* 下一页按钮选择 */}
      <div className="rounded-lg border border-line-1 bg-content-alt p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:page-next-outline"
              className="h-4 w-4 text-accent-indigo"
            />
            <span className="font-medium text-sm text-text-1">
              {t("batch.preview.pagination.title")}
            </span>
          </div>
          {nextPageButton && (
            <Button
              variant="ghost"
              size="xs"
              className="text-text-4 hover:text-error"
              onClick={onClearNextPage}>
              {t("batch.preview.pagination.clear")}
            </Button>
          )}
        </div>
        {isSelectingNextPage ? (
          <div className="flex items-center gap-2 rounded-md bg-accent-indigo-ghost px-3 py-2">
            <Icon
              icon="mdi:loading"
              className="h-4 w-4 animate-spin text-accent-indigo"
            />
            <span className="text-accent-indigo text-sm">
              {t("batch.preview.pagination.selecting")}
            </span>
          </div>
        ) : nextPageButton ? (
          <div className="flex items-center justify-between rounded-md bg-success/10 px-3 py-2">
            <div className="flex items-center gap-2">
              <Icon icon="mdi:check-circle" className="h-4 w-4 text-success" />
              <div>
                <div className="font-medium text-sm text-text-1">
                  {nextPageButton.text}
                </div>
                <div className="max-w-[200px] truncate text-text-4 text-xs">
                  {nextPageButton.xpath}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="xs" onClick={onSelectNextPage}>
              {t("batch.preview.pagination.reselect")}
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            fullWidth
            className="border-dashed"
            onClick={onSelectNextPage}>
            <Icon icon="mdi:cursor-default-click" className="mr-1 h-4 w-4" />
            {t("batch.preview.pagination.select")}
          </Button>
        )}
        <p className="mt-2 text-text-4 text-xs">
          {t("batch.preview.pagination.hint")}
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button variant="outline" size="lg" fullWidth onClick={onCancel}>
          {t("batch.preview.cancel")}
        </Button>
        <Button
          variant="success"
          size="lg"
          fullWidth
          onClick={() =>
            onStartScrape(
              selectedLinks,
              nextPageButton?.xpath,
              elementInfo?.selector,
              filterState.pattern
                ? {
                    pattern: filterState.pattern,
                    target: filterState.target,
                    mode: filterState.mode
                  }
                : undefined
            )
          }
          disabled={selectedCount === 0}>
          <Icon icon="mdi:play" className="mr-1 h-4 w-4" />
          {t("batch.preview.startScrape", {
            selected: selectedCount,
            total: filteredLinks.length
          })}
        </Button>
      </div>
    </div>
  )
})

export default LinkPreviewList
