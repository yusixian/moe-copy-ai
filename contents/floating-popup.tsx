import cssText from "data-text:~styles/global.css"
import {
  autoUpdate,
  FloatingFocusManager,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole
} from "@floating-ui/react"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useMemo, useState } from "react"

import FloatingButton from "~components/FloatingButton"
import PopupContent from "~components/PopupContent"
import { useFloatButtonStorage } from "~hooks/useFloatButtonStorage"
import { I18nProvider, useI18n } from "~utils/i18n"
import { ThemeProvider } from "~utils/theme"

// 注入全局样式
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

// 配置内容脚本
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: false
}

// 主组件
const FloatingPopup = () => {
  const { t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  // 使用 useSyncExternalStore 订阅外部存储状态
  const storageState = useFloatButtonStorage()

  // CSS 变量样式（固定使用暗色主题）
  const themeStyles: React.CSSProperties = {
    "--color-app": "#0f0f10",
    "--color-text-1": "oklch(92% 0.01 264)",
    "--color-text-2": "oklch(70% 0.02 257)",
    "--color-text-3": "oklch(50% 0.02 257)",
    "--color-text-4": "oklch(30% 0.01 255)",
    "--color-content": "oklch(20% 0.01 264 / 0.6)",
    "--color-content-solid": "oklch(18% 0.01 264)",
    "--color-content-alt": "oklch(22% 0.012 264 / 0.6)",
    "--color-content-alt-solid": "oklch(22% 0.012 264)",
    "--color-elevated-1": "rgba(40, 40, 45, 0.6)",
    "--color-elevated-solid-1": "#1a1a1d",
    "--color-line-1": "rgba(180, 180, 185, 0.2)",
    "--color-line-2": "rgba(180, 180, 185, 0.3)",
    "--color-fill-1": "rgba(180, 180, 185, 0.08)",
    "--color-fill-2": "rgba(180, 180, 185, 0.16)",
    "--color-fill-3": "rgba(180, 180, 185, 0.24)",
    "--shadow-highlight": "rgb(255 255 255 / 0.05)",
    "--shadow-highlight-weak": "rgb(255 255 255 / 0.03)"
  }

  // 使用floating-ui来定位弹窗
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [
      offset(10), // 移动设备上减小偏移量
      flip({
        fallbackAxisSideDirection: "end" // 优先翻转到底部
      }),
      shift({
        padding: 8 // 边缘填充
      })
    ],
    whileElementsMounted: autoUpdate // 自动更新位置
  })

  // 使用floating-ui提供的交互hooks
  const click = useClick(context)
  const dismiss = useDismiss(context, {
    outsidePress: true, // 点击外部关闭
    escapeKey: true // ESC键关闭
  })
  const role = useRole(context)

  // 组合所有交互
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role
  ])

  // 锁定背景滚动
  useEffect(() => {
    if (isOpen) {
      // 保存当前滚动位置
      const scrollY = window.scrollY
      // 锁定背景滚动
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"

      return () => {
        // 解锁背景滚动
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        document.body.style.overflow = ""
        // 恢复滚动位置
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  // 处理按钮点击
  const handleButtonClick = () => {
    setIsOpen(!isOpen)
  }

  // 处理关闭弹窗
  const handleClose = () => {
    setIsOpen(false)
  }

  // 解构存储状态
  const { showFloatButton, tempHideButton, isReady } = storageState

  // 存储未加载完成时不渲染，防止闪烁
  if (!isReady) {
    return null
  }

  // 如果设置为不显示悬浮窗或临时隐藏，则直接返回null
  if (showFloatButton === "false" || tempHideButton) {
    return null
  }

  return (
    <div data-moe-copy-ai>
      {/* 浮动按钮 */}
      <div ref={refs.setReference} {...getReferenceProps()}>
        <FloatingButton onClick={handleButtonClick} isOpen={isOpen} />
      </div>
      {isOpen && (
        <>
          {/* 自定义遮罩层 */}
          <button
            type="button"
            className="fixed inset-0 z-[998] border-none bg-black/50"
            onClick={handleClose} // 点击遮罩层关闭弹窗
            aria-label={t("aria.closePopup")}
          />
          {/* 弹窗内容 */}
          <FloatingFocusManager context={context}>
            <div
              ref={refs.setFloating}
              style={themeStyles}
              className="dialog fixed top-1/2 left-1/2 z-[999] max-h-[90vh] w-[80vw] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-app/80 text-text-1 backdrop-blur-md backdrop-brightness-110 md:fixed md:h-[90vh] md:max-h-[90vh] md:w-[95vw]"
              {...getFloatingProps()}>
              <PopupContent
                onClose={handleClose}
                className="h-full max-h-[90vh]"
                enablePortal={false}
              />
            </div>
          </FloatingFocusManager>
        </>
      )}
    </div>
  )
}

function FloatingPopupWithI18n() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <FloatingPopup />
      </I18nProvider>
    </ThemeProvider>
  )
}

export default FloatingPopupWithI18n
