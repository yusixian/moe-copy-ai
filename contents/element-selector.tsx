import cssText from "data-text:~styles/element-selector.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useCallback, useEffect, useRef, useState } from "react"

import type {
  ElementSelectorPurpose,
  ExtractedContent,
  ExtractedLink,
  NextPageButtonInfo,
  SelectedElementInfo
} from "~constants/types"
import { extractContentFromElement } from "~utils/content-extractor"
import {
  DEFAULT_FILTER_OPTIONS,
  extractAndProcessLinks,
  getElementInfo
} from "~utils/link-extractor"
import { debugLog } from "~utils/logger"
import { generateNextPageButtonSelector } from "~utils/selector-generator"

// z-index 常量 - 使用最大安全值确保覆盖层在最顶层
const Z_INDEX = {
  OVERLAY: 2147483645,
  HIGHLIGHT: 2147483646,
  PANEL: 2147483647
} as const

// 配置内容脚本
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

// 注入样式
export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// 高亮覆盖层组件
function HighlightOverlay({
  rect,
  isSelected
}: {
  rect: DOMRect | null
  isSelected: boolean
}) {
  if (!rect) return null

  const style: React.CSSProperties = {
    position: "fixed",
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    pointerEvents: "none",
    zIndex: Z_INDEX.HIGHLIGHT,
    border: isSelected ? "3px solid #10b981" : "2px dashed #3b82f6",
    backgroundColor: isSelected
      ? "rgba(16, 185, 129, 0.1)"
      : "rgba(59, 130, 246, 0.1)",
    borderRadius: "4px",
    transition: "all 0.15s ease"
  }

  return <div style={style} />
}

// 信息面板组件
function InfoPanel({
  elementInfo,
  links,
  sameDomainOnly,
  onToggleSameDomain,
  onConfirm,
  onCancel,
  purpose,
  contentPreview,
  nextPageButton
}: {
  elementInfo: SelectedElementInfo | null
  links: ExtractedLink[]
  sameDomainOnly: boolean
  onToggleSameDomain: () => void
  onConfirm: () => void
  onCancel: () => void
  purpose: ElementSelectorPurpose
  contentPreview?: string
  nextPageButton?: NextPageButtonInfo | null
}) {
  if (!elementInfo) return null

  const isContentMode = purpose === "content-extraction"
  const isNextPageButtonMode = purpose === "next-page-button"

  return (
    <div
      style={{
        position: "fixed",
        top: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: Z_INDEX.PANEL,
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        padding: "16px 20px",
        minWidth: "320px",
        maxWidth: "90vw",
        fontFamily: "system-ui, -apple-system, sans-serif"
      }}>
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#1f2937",
            marginBottom: "4px"
          }}>
          已选中元素
        </div>
        <div style={{ fontSize: "12px", color: "#6b7280" }}>
          <span
            style={{
              backgroundColor: isContentMode ? "#fef3c7" : "#e0e7ff",
              color: isContentMode ? "#92400e" : "#4338ca",
              padding: "2px 6px",
              borderRadius: "4px",
              marginRight: "8px"
            }}>
            {elementInfo.tagName}
          </span>
          {elementInfo.id && (
            <span style={{ marginRight: "8px" }}>#{elementInfo.id}</span>
          )}
          {elementInfo.className && (
            <span style={{ color: "#9ca3af" }}>
              .{elementInfo.className.split(" ")[0]}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          padding: "12px 0",
          borderTop: "1px solid #e5e7eb",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "12px"
        }}>
        {isNextPageButtonMode ? (
          // 下一页按钮选择模式：显示按钮信息
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "8px"
              }}>
              已选中下一页按钮
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#374151",
                backgroundColor: "#ecfdf5",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #a7f3d0"
              }}>
              <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                {nextPageButton?.text || "下一页"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  wordBreak: "break-all"
                }}>
                {nextPageButton?.xpath}
              </div>
            </div>
            <div
              style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
              确认后将在抓取完成时自动点击此按钮加载下一页
            </div>
          </div>
        ) : isContentMode ? (
          // 内容提取模式：显示内容预览
          <div>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                marginBottom: "8px"
              }}>
              内容预览
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#374151",
                backgroundColor: "#f9fafb",
                padding: "8px 12px",
                borderRadius: "6px",
                maxHeight: "80px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: "1.5"
              }}>
              {contentPreview || "（无文本内容）"}
            </div>
            <div
              style={{ fontSize: "12px", color: "#9ca3af", marginTop: "8px" }}>
              确认后将提取 HTML / Markdown / 纯文本
            </div>
          </div>
        ) : (
          // 链接提取模式：显示链接数量
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px"
              }}>
              <div>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: "#10b981"
                  }}>
                  {links.length}
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginLeft: "8px"
                  }}>
                  个链接
                </span>
              </div>
              {links.length > 0 && (
                <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                  点击确认开始批量抓取
                </div>
              )}
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "#4b5563",
                cursor: "pointer",
                userSelect: "none"
              }}>
              <input
                type="checkbox"
                checked={sameDomainOnly}
                onChange={onToggleSameDomain}
                style={{
                  width: "16px",
                  height: "16px",
                  accentColor: "#10b981",
                  cursor: "pointer"
                }}
              />
              仅同域名链接
            </label>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            backgroundColor: "white",
            color: "#374151",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer"
          }}>
          取消
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={
            !isContentMode && !isNextPageButtonMode && links.length === 0
          }
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: "8px",
            border: "none",
            backgroundColor:
              isContentMode || isNextPageButtonMode || links.length > 0
                ? "#10b981"
                : "#d1d5db",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            cursor:
              isContentMode || isNextPageButtonMode || links.length > 0
                ? "pointer"
                : "not-allowed"
          }}>
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
  const [elementInfo, setElementInfo] = useState<SelectedElementInfo | null>(
    null
  )
  const [extractedLinks, setExtractedLinks] = useState<ExtractedLink[]>([])
  const [sameDomainOnly, setSameDomainOnly] = useState(false)
  const [purpose, setPurpose] =
    useState<ElementSelectorPurpose>("link-extraction")
  const [extractedContent, setExtractedContent] =
    useState<ExtractedContent | null>(null)
  const [nextPageButtonInfo, setNextPageButtonInfo] =
    useState<NextPageButtonInfo | null>(null)

  // 使用 ref 访问最新状态，避免事件监听器循环依赖
  const hoveredElementRef = useRef<Element | null>(null)
  const selectedElementRef = useRef<Element | null>(null)
  const elementInfoRef = useRef<SelectedElementInfo | null>(null)
  const extractedLinksRef = useRef<ExtractedLink[]>([])
  const purposeRef = useRef<ElementSelectorPurpose>("link-extraction")
  const extractedContentRef = useRef<ExtractedContent | null>(null)
  const nextPageButtonInfoRef = useRef<NextPageButtonInfo | null>(null)

  // 同步 ref 和 state
  selectedElementRef.current = selectedElement
  elementInfoRef.current = elementInfo
  extractedLinksRef.current = extractedLinks
  purposeRef.current = purpose
  extractedContentRef.current = extractedContent
  nextPageButtonInfoRef.current = nextPageButtonInfo

  // 重置所有状态
  const resetState = useCallback(() => {
    setIsActive(false)
    setSelectedElement(null)
    setSelectedRect(null)
    setHoveredRect(null)
    setElementInfo(null)
    setExtractedLinks([])
    setSameDomainOnly(false)
    setPurpose("link-extraction")
    setExtractedContent(null)
    setNextPageButtonInfo(null)
    hoveredElementRef.current = null
  }, [])

  // 切换同域名过滤
  const handleToggleSameDomain = () => {
    if (!selectedElement) return
    const newValue = !sameDomainOnly
    setSameDomainOnly(newValue)
    const links = extractAndProcessLinks(
      selectedElement,
      window.location.href,
      {
        ...DEFAULT_FILTER_OPTIONS,
        sameDomainOnly: newValue
      }
    )
    setExtractedLinks(links)
  }

  // 确认选择
  const handleConfirm = () => {
    const currentPurpose = purposeRef.current

    if (currentPurpose === "content-extraction") {
      // 内容提取模式：发送提取的内容
      chrome.runtime.sendMessage({
        action: "elementSelected",
        purpose: currentPurpose,
        elementInfo: elementInfoRef.current,
        content: extractedContentRef.current
      })
    } else if (currentPurpose === "next-page-button") {
      // 下一页按钮选择模式：发送按钮信息
      if (!nextPageButtonInfoRef.current) return

      chrome.runtime.sendMessage({
        action: "elementSelected",
        purpose: currentPurpose,
        elementInfo: elementInfoRef.current,
        nextPageButton: nextPageButtonInfoRef.current
      })
    } else {
      // 链接提取模式：发送链接列表
      if (extractedLinksRef.current.length === 0) return

      chrome.runtime.sendMessage({
        action: "elementSelected",
        purpose: currentPurpose,
        elementInfo: elementInfoRef.current,
        links: extractedLinksRef.current
      })
    }

    resetState()
  }

  // 取消选择
  const handleCancel = () => {
    // 发送取消消息
    chrome.runtime.sendMessage({
      action: "selectionCancelled"
    })

    resetState()
  }

  // 监听来自 popup 的消息
  useEffect(() => {
    const handleMessage = (
      message: { action: string; purpose?: ElementSelectorPurpose },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: { success: boolean }) => void
    ) => {
      if (message.action === "activateSelector") {
        const msgPurpose = message.purpose || "link-extraction"
        setIsActive(true)
        setPurpose(msgPurpose)
        setSelectedElement(null)
        setSelectedRect(null)
        setHoveredRect(null)
        setElementInfo(null)
        setExtractedLinks([])
        setExtractedContent(null)
        setNextPageButtonInfo(null)
        hoveredElementRef.current = null
        sendResponse({ success: true })
      } else if (message.action === "deactivateSelector") {
        // 发送取消消息
        chrome.runtime.sendMessage({ action: "selectionCancelled" })
        resetState()
        sendResponse({ success: true })
      }
      // 不需要异步响应，不返回 true
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage)
    }
  }, [resetState]) // 只在挂载时订阅一次

  // 添加/移除事件监听 - 使用 ref 避免循环依赖
  useEffect(() => {
    if (!isActive) return

    // 处理鼠标移动 - 定义在 effect 内部，通过 ref 访问状态
    const handleMouseMove = (e: MouseEvent) => {
      if (selectedElementRef.current) return

      const element = document.elementFromPoint(e.clientX, e.clientY)
      if (element && element !== hoveredElementRef.current) {
        // 排除选择器自身的元素
        if (element.closest("[data-element-selector]")) {
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
        if (element.closest("[data-element-selector]")) {
          return
        }

        e.preventDefault()
        e.stopPropagation()

        setSelectedElement(element)
        setSelectedRect(element.getBoundingClientRect())
        setHoveredRect(null)

        // 获取元素信息
        const info = getElementInfo(element)
        setElementInfo(info)

        // 根据 purpose 提取不同数据
        if (purposeRef.current === "content-extraction") {
          // 内容提取模式：提取完整内容
          const content = extractContentFromElement(element)
          setExtractedContent(content)
        } else if (purposeRef.current === "next-page-button") {
          // 下一页按钮选择模式：使用专用的下一页按钮选择器生成（XPath）
          try {
            const selectorResult = generateNextPageButtonSelector(element)
            const text =
              element.textContent?.trim() ||
              element.getAttribute("aria-label") ||
              "下一页"
            debugLog("[ElementSelector] 下一页按钮 XPath:", {
              element: `<${element.tagName.toLowerCase()}> "${text}"`,
              xpath: selectorResult.xpath,
              description: selectorResult.description
            })
            setNextPageButtonInfo({
              xpath: selectorResult.xpath,
              text,
              description: selectorResult.description
            })
          } catch (err) {
            debugLog("[ElementSelector] 生成 XPath 失败:", err)
          }
        } else {
          // 链接提取模式：提取链接
          const links = extractAndProcessLinks(
            element,
            window.location.href,
            DEFAULT_FILTER_OPTIONS
          )
          setExtractedLinks(links)
        }
      }
    }

    // 处理 ESC 键取消
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        chrome.runtime.sendMessage({ action: "selectionCancelled" })
        resetState()
      }
    }

    document.addEventListener("mousemove", handleMouseMove, true)
    document.addEventListener("click", handleClick, true)
    document.addEventListener("keydown", handleKeyDown)

    // 添加全局样式禁止选择
    document.body.style.userSelect = "none"
    document.body.style.cursor = "crosshair"

    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true)
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }
  }, [isActive, resetState]) // 只依赖 isActive

  if (!isActive) return null

  return (
    <div data-element-selector="true">
      {/* 半透明遮罩 - 点击由 document 事件监听器捕获处理 */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          zIndex: Z_INDEX.OVERLAY,
          pointerEvents: selectedElement ? "auto" : "none"
        }}
      />

      {/* 悬停高亮 */}
      {!selectedElement && (
        <HighlightOverlay rect={hoveredRect} isSelected={false} />
      )}

      {/* 选中高亮 */}
      {selectedElement && (
        <HighlightOverlay rect={selectedRect} isSelected={true} />
      )}

      {/* 信息面板 */}
      {selectedElement && (
        <InfoPanel
          elementInfo={elementInfo}
          links={extractedLinks}
          sameDomainOnly={sameDomainOnly}
          onToggleSameDomain={handleToggleSameDomain}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          purpose={purpose}
          contentPreview={extractedContent?.text?.substring(0, 200)}
          nextPageButton={nextPageButtonInfo}
        />
      )}

      {/* 提示文字 */}
      {!selectedElement && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: Z_INDEX.PANEL,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: "system-ui, -apple-system, sans-serif"
          }}>
          {purpose === "content-extraction"
            ? "点击选择要提取内容的元素区域 · 按 ESC 取消"
            : purpose === "next-page-button"
              ? '点击选择"下一页"按钮 · 按 ESC 取消'
              : "点击选择包含链接的元素区域 · 按 ESC 取消"}
        </div>
      )}
    </div>
  )
}

export default ElementSelector
