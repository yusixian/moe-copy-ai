import { Icon } from '@iconify/react'
import { memo, useMemo, useState } from 'react'

import type { ExtractedLink, SelectedElementInfo } from '~constants/types'
import { useSelectionSet } from '~hooks/useSelectionSet'
import { cn } from '~utils'
import { downloadTextFile } from '~utils/download'
import { exportLinksToJson, exportLinksToMarkdown } from '~utils/link-exporter'

interface LinkPreviewListProps {
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  onStartScrape: (selectedLinks: ExtractedLink[]) => void
  onCancel: () => void
  onReselect: () => void
  onAddLink: (url: string, text?: string) => void
  onUpdateLink: (index: number, url: string, text: string) => void
  onRemoveLink: (index: number) => void
}

const LinkPreviewList = memo(function LinkPreviewList({
  elementInfo,
  links,
  onStartScrape,
  onCancel,
  onReselect,
  onAddLink,
  onUpdateLink,
  onRemoveLink,
}: LinkPreviewListProps) {
  const [showAll, setShowAll] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // 编辑状态
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({ url: '', text: '' })

  // 添加链接状态
  const [isAdding, setIsAdding] = useState(false)
  const [addForm, setAddForm] = useState({ url: '', text: '' })

  // 开始编辑
  const startEdit = (link: ExtractedLink) => {
    setEditingIndex(link.index)
    setEditForm({ url: link.url, text: link.text })
  }

  // 保存编辑
  const saveEdit = () => {
    if (editingIndex !== null && editForm.url.trim()) {
      onUpdateLink(editingIndex, editForm.url.trim(), editForm.text.trim() || editForm.url.trim())
      setEditingIndex(null)
      setEditForm({ url: '', text: '' })
    }
  }

  // 取消编辑
  const cancelEdit = () => {
    setEditingIndex(null)
    setEditForm({ url: '', text: '' })
  }

  // 添加新链接
  const handleAddLink = () => {
    if (addForm.url.trim()) {
      onAddLink(addForm.url.trim(), addForm.text.trim() || undefined)
      setAddForm({ url: '', text: '' })
      setIsAdding(false)
    }
  }

  // 取消添加
  const cancelAdd = () => {
    setIsAdding(false)
    setAddForm({ url: '', text: '' })
  }

  // 使用 useSelectionSet 管理选中状态
  const {
    selectedItems: selectedLinks,
    selectedCount,
    isSelected,
    isAllSelected,
    toggle: toggleLink,
    toggleAll
  } = useSelectionSet({
    items: links,
    getKey: (_, index) => index
  })

  // 导出为 Markdown
  const handleExportMarkdown = () => {
    setIsExporting(true)
    try {
      const content = exportLinksToMarkdown(links)
      const date = new Date().toISOString().split('T')[0]
      downloadTextFile(content, `links-${date}.md`, 'text/markdown')
    } catch (error) {
      console.error('导出 Markdown 失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 导出为 JSON
  const handleExportJson = () => {
    setIsExporting(true)
    try {
      const content = exportLinksToJson(links)
      const date = new Date().toISOString().split('T')[0]
      downloadTextFile(content, `links-${date}.json`, 'application/json')
    } catch (error) {
      console.error('导出 JSON 失败:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // 显示的链接数量
  const displayLinks = useMemo(() => {
    if (showAll || links.length <= 10) {
      return links
    }
    return links.slice(0, 10)
  }, [links, showAll])

  const hasMore = links.length > 10

  return (
    <div className="flex flex-col gap-4">
      {/* 元素信息 */}
      {elementInfo && (
        <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {elementInfo.tagName}
            </span>
            {elementInfo.id && <span className="text-xs text-gray-500">#{elementInfo.id}</span>}
            {elementInfo.className && (
              <span className="text-xs text-gray-400">.{elementInfo.className.split(' ')[0]}</span>
            )}
          </div>
          <button
            onClick={onReselect}
            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700"
          >
            <Icon icon="mdi:refresh" className="h-3.5 w-3.5" />
            重新选择
          </button>
        </div>
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
            <span className="text-xs text-gray-500">全选</span>
          </label>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-600">
            已选 <span className="font-bold text-emerald-500">{selectedCount}</span>/{links.length}
          </span>
        </div>
        {links.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">导出</span>
            <button
              onClick={handleExportMarkdown}
              disabled={isExporting}
              className="flex items-center gap-1 text-gray-500 hover:text-sky-600 disabled:opacity-50"
            >
              <Icon icon="mdi:file-document-outline" className="h-3.5 w-3.5" />
              MD
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={handleExportJson}
              disabled={isExporting}
              className="flex items-center gap-1 text-gray-500 hover:text-sky-600 disabled:opacity-50"
            >
              <Icon icon="mdi:code-json" className="h-3.5 w-3.5" />
              JSON
            </button>
          </div>
        )}
      </div>

      {/* 链接列表 */}
      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
        {displayLinks.map((link, idx) => (
          <div
            key={link.index}
            className={cn(
              'flex items-start gap-3 px-3 py-2 transition-colors hover:bg-gray-50',
              idx !== displayLinks.length - 1 && 'border-b border-gray-100',
              !isSelected(link.index) && 'opacity-50'
            )}
          >
            <input
              type="checkbox"
              checked={isSelected(link.index)}
              onChange={() => toggleLink(link.index)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
            />
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500">
              {link.index + 1}
            </span>

            {editingIndex === link.index ? (
              // 编辑模式
              <div className="min-w-0 flex-1 space-y-1.5">
                <input
                  type="text"
                  value={editForm.text}
                  onChange={(e) => setEditForm((f) => ({ ...f, text: e.target.value }))}
                  placeholder="链接标题"
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={editForm.url}
                  onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="链接 URL"
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1 rounded bg-emerald-500 px-2 py-0.5 text-xs text-white hover:bg-emerald-600"
                  >
                    <Icon icon="mdi:check" className="h-3 w-3" />
                    保存
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700 hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              // 正常模式
              <>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-800">{link.text || '无标题'}</div>
                  <div className="truncate text-xs text-gray-400">{link.url}</div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <button
                    onClick={() => startEdit(link)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-sky-600"
                    title="编辑"
                  >
                    <Icon icon="mdi:pencil" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onRemoveLink(link.index)}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                    title="删除"
                  >
                    <Icon icon="mdi:close" className="h-4 w-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 显示更多 */}
      {hasMore && !showAll && (
        <button onClick={() => setShowAll(true)} className="text-center text-sm text-sky-600 hover:text-sky-700">
          显示全部 {links.length} 个链接
        </button>
      )}

      {/* 添加链接 */}
      {isAdding ? (
        <div className="space-y-2 rounded-lg border border-sky-200 bg-sky-50 p-3">
          <div className="text-xs font-medium text-gray-600">添加新链接</div>
          <input
            type="text"
            value={addForm.url}
            onChange={(e) => setAddForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="链接 URL"
            className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            autoFocus
          />
          <input
            type="text"
            value={addForm.text}
            onChange={(e) => setAddForm((f) => ({ ...f, text: e.target.value }))}
            placeholder="链接标题（可选）"
            className="w-full rounded border border-gray-300 px-2.5 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddLink}
              disabled={!addForm.url.trim()}
              className="flex items-center gap-1 rounded bg-sky-500 px-3 py-1 text-sm text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon icon="mdi:plus" className="h-4 w-4" />
              添加
            </button>
            <button
              onClick={cancelAdd}
              className="rounded bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 transition-colors hover:border-sky-400 hover:bg-sky-50 hover:text-sky-600"
        >
          <Icon icon="mdi:plus" className="h-4 w-4" />
          添加链接
        </button>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          取消
        </button>
        <button
          onClick={() => onStartScrape(selectedLinks)}
          disabled={selectedCount === 0}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-all',
            selectedCount > 0
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg'
              : 'cursor-not-allowed bg-gray-300'
          )}
        >
          <Icon icon="mdi:play" className="h-4 w-4" />
          开始抓取 ({selectedCount}/{links.length})
        </button>
      </div>
    </div>
  )
})

export default LinkPreviewList
