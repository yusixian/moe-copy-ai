import { Icon } from '@iconify/react'
import { memo, useMemo, useState } from 'react'

import type { ExtractedLink, SelectedElementInfo } from '~constants/types'
import { cn } from '~utils'

interface LinkPreviewListProps {
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  onStartScrape: () => void
  onCancel: () => void
  onReselect: () => void
}

const LinkPreviewList = memo(function LinkPreviewList({
  elementInfo,
  links,
  onStartScrape,
  onCancel,
  onReselect,
}: LinkPreviewListProps) {
  const [showAll, setShowAll] = useState(false)

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

      {/* 链接统计 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-emerald-500">{links.length}</span>
          <span className="text-sm text-gray-600">个链接待抓取</span>
        </div>
      </div>

      {/* 链接列表 */}
      <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200">
        {displayLinks.map((link, index) => (
          <div
            key={link.url}
            className={cn(
              'flex items-start gap-3 px-3 py-2',
              index !== displayLinks.length - 1 && 'border-b border-gray-100'
            )}
          >
            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500">
              {link.index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-800">{link.text || '无标题'}</div>
              <div className="truncate text-xs text-gray-400">{link.url}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 显示更多 */}
      {hasMore && !showAll && (
        <button onClick={() => setShowAll(true)} className="text-center text-sm text-sky-600 hover:text-sky-700">
          显示全部 {links.length} 个链接
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
          onClick={onStartScrape}
          disabled={links.length === 0}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-all',
            links.length > 0
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg'
              : 'cursor-not-allowed bg-gray-300'
          )}
        >
          <Icon icon="mdi:play" className="h-4 w-4" />
          开始抓取
        </button>
      </div>
    </div>
  )
})

export default LinkPreviewList
