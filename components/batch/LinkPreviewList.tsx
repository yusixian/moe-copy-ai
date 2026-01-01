import { Icon } from "@iconify/react"
import { memo, useMemo, useState } from "react"

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
import { exportLinksToJson, exportLinksToMarkdown } from "~utils/link-exporter"

import LinkFilterBar from "./LinkFilterBar"

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
  const [isExporting, setIsExporting] = useState(false)

  // 编辑状态
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ url: "", text: "" })

  // 添加链接状态
  const [isAdding, setIsAdding] = useState(false)
  const [addForm, setAddForm] = useState({ url: "", text: "" })

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
    setEditingIndex(link.index)
    setEditForm({ url: link.url, text: link.text })
  }

  // 保存编辑
  const saveEdit = () => {
    if (editingIndex !== null && editForm.url.trim()) {
      onUpdateLink(
        editingIndex,
        editForm.url.trim(),
        editForm.text.trim() || editForm.url.trim()
      )
      setEditingIndex(null)
      setEditForm({ url: "", text: "" })
    }
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingIndex(null)
    setEditForm({ url: "", text: "" })
  }

  // 添加新链接
  const handleAddLink = () => {
    if (addForm.url.trim()) {
      onAddLink(addForm.url.trim(), addForm.text.trim() || undefined)
      setAddForm({ url: "", text: "" })
      setIsAdding(false)
    }
  }

  // 取消添加
  const cancelAdd = () => {
    setIsAdding(false)
    setAddForm({ url: "", text: "" })
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
    setIsExporting(true)
    try {
      const content = exportLinksToMarkdown(links)
      const date = new Date().toISOString().split("T")[0]
      downloadTextFile(content, `links-${date}.md`, "text/markdown")
    } catch (error) {
      console.error("导出 Markdown 失败:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导出为 JSON
  const handleExportJson = () => {
    setIsExporting(true)
    try {
      const content = exportLinksToJson(links)
      const date = new Date().toISOString().split("T")[0]
      downloadTextFile(content, `links-${date}.json`, "application/json")
    } catch (error) {
      console.error("导出 JSON 失败:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* 元素信息 */}
      {elementInfo && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 font-medium text-indigo-700 text-xs">
              {elementInfo.tagName}
            </span>
            {elementInfo.id && (
              <span className="text-gray-500 text-xs">#{elementInfo.id}</span>
            )}
            {elementInfo.className && (
              <span className="text-gray-400 text-xs">
                .{elementInfo.className.split(" ")[0]}
              </span>
            )}
          </div>
          <Button variant="ghost" size="xs" onClick={onReselect}>
            <Icon icon="mdi:refresh" className="mr-1 h-3.5 w-3.5" />
            重新选择
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
              className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="text-gray-500 text-xs">全选</span>
          </label>
          <span className="text-gray-300">|</span>
          <span className="text-gray-600 text-sm">
            已选{" "}
            <span className="font-bold text-emerald-500">{selectedCount}</span>/
            {filteredLinks.length}
            {filteredLinks.length !== links.length && (
              <span className="ml-1 text-gray-400 text-xs">
                (共{links.length})
              </span>
            )}
          </span>
        </div>
        {links.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">导出</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={handleExportMarkdown}
              disabled={isExporting}>
              <Icon icon="mdi:file-document-outline" className="mr-1 h-3.5 w-3.5" />
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
      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
        {filteredLinks.map((link, idx) => (
          <div
            key={link.index}
            className={cn(
              "flex items-start gap-3 px-3 py-2 transition-colors hover:bg-gray-50",
              idx !== filteredLinks.length - 1 && "border-gray-100 border-b",
              !isSelected(link.index) && "opacity-50"
            )}>
            <input
              type="checkbox"
              checked={isSelected(link.index)}
              onChange={() => toggleLink(link.index)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xs">
              {link.index + 1}
            </span>

            {editingIndex === link.index ? (
              // 编辑模式
              <div className="min-w-0 flex-1 space-y-1.5">
                <input
                  type="text"
                  value={editForm.text}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, text: e.target.value }))
                  }
                  placeholder="链接标题"
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={editForm.url}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, url: e.target.value }))
                  }
                  placeholder="链接 URL"
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <div className="flex gap-2">
                  <Button variant="success" size="xs" onClick={saveEdit}>
                    <Icon icon="mdi:check" className="mr-1 h-3 w-3" />
                    保存
                  </Button>
                  <Button variant="secondary" size="xs" onClick={cancelEdit}>
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              // 正常模式
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-gray-800 text-sm">
                    {link.text || "无标题"}
                  </div>
                  <div className="truncate text-gray-400 text-xs">
                    {link.url}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => startEdit(link)}
                    title="编辑">
                    <Icon icon="mdi:pencil" className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => onRemoveLink(link.index)}
                    title="删除">
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
        <div className="space-y-2 rounded-lg border border-sky-200 bg-sky-50 p-3">
          <div className="font-medium text-gray-600 text-xs">添加新链接</div>
          <input
            type="text"
            value={addForm.url}
            onChange={(e) => setAddForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="链接 URL"
            className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <input
            type="text"
            value={addForm.text}
            onChange={(e) =>
              setAddForm((f) => ({ ...f, text: e.target.value }))
            }
            placeholder="链接标题（可选）"
            className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleAddLink}
              disabled={!addForm.url.trim()}>
              <Icon icon="mdi:plus" className="mr-1 h-4 w-4" />
              添加
            </Button>
            <Button variant="secondary" size="sm" onClick={cancelAdd}>
              取消
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          fullWidth
          className="border-dashed"
          onClick={() => setIsAdding(true)}>
          <Icon icon="mdi:plus" className="mr-1 h-4 w-4" />
          添加链接
        </Button>
      )}

      {/* 下一页按钮选择 */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon
              icon="mdi:page-next-outline"
              className="h-4 w-4 text-indigo-500"
            />
            <span className="font-medium text-gray-700 text-sm">
              自动翻页（可选）
            </span>
          </div>
          {nextPageButton && (
            <Button
              variant="ghost"
              size="xs"
              className="text-gray-400 hover:text-red-500"
              onClick={onClearNextPage}>
              清除
            </Button>
          )}
        </div>
        {isSelectingNextPage ? (
          <div className="flex items-center gap-2 rounded-md bg-indigo-100 px-3 py-2">
            <Icon
              icon="mdi:loading"
              className="h-4 w-4 animate-spin text-indigo-500"
            />
            <span className="text-indigo-700 text-sm">
              请在页面上点击"下一页"按钮...
            </span>
          </div>
        ) : nextPageButton ? (
          <div className="flex items-center justify-between rounded-md bg-emerald-50 px-3 py-2">
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:check-circle"
                className="h-4 w-4 text-emerald-500"
              />
              <div>
                <div className="font-medium text-gray-700 text-sm">
                  {nextPageButton.text}
                </div>
                <div className="max-w-[200px] truncate text-gray-400 text-xs">
                  {nextPageButton.xpath}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="xs" onClick={onSelectNextPage}>
              重新选择
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
            选择"下一页"按钮
          </Button>
        )}
        <p className="mt-2 text-gray-400 text-xs">
          选择后，抓取完当前页会自动点击下一页继续抓取
        </p>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <Button variant="outline" size="lg" fullWidth onClick={onCancel}>
          取消
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
          开始抓取 ({selectedCount}/{filteredLinks.length})
        </Button>
      </div>
    </div>
  )
})

export default LinkPreviewList
