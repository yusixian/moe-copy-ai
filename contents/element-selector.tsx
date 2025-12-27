import cssText from 'data-text:~styles/element-selector.css'
import type { PlasmoCSConfig, PlasmoGetStyle } from 'plasmo'
import { useEffect, useRef, useState } from 'react'

import type { ExtractedLink, SelectedElementInfo } from '~constants/types'
import { DEFAULT_FILTER_OPTIONS, extractAndProcessLinks, getElementInfo } from '~utils/link-extractor'

// 配置内容脚本
export const config: PlasmoCSConfig = {
  matches: ['<all_urls>'],
  all_frames: false,
}

// 注入样式
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

// 高亮覆盖层组件
function HighlightOverlay({
  rect,
  isSelected,
}: {
  rect: DOMRect | null
  isSelected: boolean
}) {
  if (!rect) return null

  const style: React.CSSProperties = {
    position: 'fixed',
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    pointerEvents: 'none',
    zIndex: 2147483646,
    border: isSelected ? '3px solid #10b981' : '2px dashed #3b82f6',
    backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
    borderRadius: '4px',
    transition: 'all 0.15s ease',
  }

  return <div style={style} />
}

// 信息面板组件
function InfoPanel({
  elementInfo,
  links,
  onConfirm,
  onCancel,
}: {
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!elementInfo) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2147483647,
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '16px 20px',
        minWidth: '320px',
        maxWidth: '90vw',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
          已选中元素
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <span
            style={{
              backgroundColor: '#e0e7ff',
              color: '#4338ca',
              padding: '2px 6px',
              borderRadius: '4px',
              marginRight: '8px',
            }}
          >
            {elementInfo.tagName}
          </span>
          {elementInfo.id && (
            <span style={{ marginRight: '8px' }}>#{elementInfo.id}</span>
          )}
          {elementInfo.className && (
            <span style={{ color: '#9ca3af' }}>.{elementInfo.className.split(' ')[0]}</span>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 0',
          borderTop: '1px solid #e5e7eb',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '12px',
        }}
      >
        <div>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
            {links.length}
          </span>
          <span style={{ fontSize: '14px', color: '#6b7280', marginLeft: '8px' }}>
            个链接
          </span>
        </div>
        {links.length > 0 && (
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            点击确认开始批量抓取
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          取消
        </button>
        <button
          onClick={onConfirm}
          disabled={links.length === 0}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: links.length > 0 ? '#10b981' : '#d1d5db',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            cursor: links.length > 0 ? 'pointer' : 'not-allowed',
          }}
        >
          确认选择
        </button>
      </div>
    </div>
  )
}

// 主组件
function ElementSelector() {
  const [isActive, setIsActive] = useState(false)
  const [hoveredRect, setHoveredRect] = useState<DOMRect | null>(null)
  const [selectedElement, setSelectedElement] = useState<Element | null>(null)
  const [selectedRect, setSelectedRect] = useState<DOMRect | null>(null)
  const [elementInfo, setElementInfo] = useState<SelectedElementInfo | null>(null)
  const [extractedLinks, setExtractedLinks] = useState<ExtractedLink[]>([])

  // 使用 ref 访问最新状态，避免事件监听器循环依赖
  const hoveredElementRef = useRef<Element | null>(null)
  const selectedElementRef = useRef<Element | null>(null)
  const elementInfoRef = useRef<SelectedElementInfo | null>(null)
  const extractedLinksRef = useRef<ExtractedLink[]>([])

  // 同步 ref 和 state
  selectedElementRef.current = selectedElement
  elementInfoRef.current = elementInfo
  extractedLinksRef.current = extractedLinks

  // 重置所有状态
  const resetState = () => {
    setIsActive(false)
    setSelectedElement(null)
    setSelectedRect(null)
    setHoveredRect(null)
    setElementInfo(null)
    setExtractedLinks([])
    hoveredElementRef.current = null
  }

  // 确认选择
  const handleConfirm = () => {
    if (extractedLinksRef.current.length === 0) return

    // 发送消息到 popup
    chrome.runtime.sendMessage({
      action: 'elementSelected',
      elementInfo: elementInfoRef.current,
      links: extractedLinksRef.current,
    })

    resetState()
  }

  // 取消选择
  const handleCancel = () => {
    // 发送取消消息
    chrome.runtime.sendMessage({
      action: 'selectionCancelled',
    })

    resetState()
  }

  // 监听来自 popup 的消息
  useEffect(() => {
    const handleMessage = (message: { action: string }) => {
      if (message.action === 'activateSelector') {
        setIsActive(true)
        setSelectedElement(null)
        setSelectedRect(null)
        setHoveredRect(null)
        setElementInfo(null)
        setExtractedLinks([])
        hoveredElementRef.current = null
      } else if (message.action === 'deactivateSelector') {
        // 发送取消消息
        chrome.runtime.sendMessage({ action: 'selectionCancelled' })
        resetState()
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, []) // 只在挂载时订阅一次

  // 添加/移除事件监听 - 使用 ref 避免循环依赖
  useEffect(() => {
    if (!isActive) return

    // 处理鼠标移动 - 定义在 effect 内部，通过 ref 访问状态
    const handleMouseMove = (e: MouseEvent) => {
      if (selectedElementRef.current) return

      const element = document.elementFromPoint(e.clientX, e.clientY)
      if (element && element !== hoveredElementRef.current) {
        // 排除选择器自身的元素
        if (element.closest('[data-element-selector]')) {
          return
        }

        hoveredElementRef.current = element
        setHoveredRect(element.getBoundingClientRect())
      }
    }

    // 处理点击选择
    const handleClick = (e: MouseEvent) => {
      if (selectedElementRef.current) return

      const element = document.elementFromPoint(e.clientX, e.clientY)
      if (element) {
        // 排除选择器自身的元素
        if (element.closest('[data-element-selector]')) {
          return
        }

        e.preventDefault()
        e.stopPropagation()

        setSelectedElement(element)
        setSelectedRect(element.getBoundingClientRect())
        setHoveredRect(null)

        // 获取元素信息和链接
        const info = getElementInfo(element)
        setElementInfo(info)

        const links = extractAndProcessLinks(element, window.location.href, DEFAULT_FILTER_OPTIONS)
        setExtractedLinks(links)
      }
    }

    // 处理 ESC 键取消
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        chrome.runtime.sendMessage({ action: 'selectionCancelled' })
        resetState()
      }
    }

    document.addEventListener('mousemove', handleMouseMove, true)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKeyDown)

    // 添加全局样式禁止选择
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'crosshair'

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isActive]) // 只依赖 isActive

  if (!isActive) return null

  return (
    <div data-element-selector="true">
      {/* 半透明遮罩 - 点击由 document 事件监听器捕获处理 */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 2147483645,
          pointerEvents: selectedElement ? 'auto' : 'none',
        }}
      />

      {/* 悬停高亮 */}
      {!selectedElement && <HighlightOverlay rect={hoveredRect} isSelected={false} />}

      {/* 选中高亮 */}
      {selectedElement && <HighlightOverlay rect={selectedRect} isSelected={true} />}

      {/* 信息面板 */}
      {selectedElement && (
        <InfoPanel
          elementInfo={elementInfo}
          links={extractedLinks}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* 提示文字 */}
      {!selectedElement && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2147483647,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          点击选择包含链接的元素区域 · 按 ESC 取消
        </div>
      )}
    </div>
  )
}

export default ElementSelector
