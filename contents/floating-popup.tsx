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
import { useStorage } from "@plasmohq/storage/hook"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"

import FloatingButton from "~components/FloatingButton"
import PopupContent from "~components/PopupContent"

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
  const [isOpen, setIsOpen] = useState(false)
  // 从存储中获取悬浮窗显示设置，默认为显示
  const [showFloatButton] = useStorage<string>("show_float_button", "true")
  // 添加临时隐藏状态，使用Plasmo的状态管理
  const [tempHideButton, setTempHideButton] = useStorage<boolean>(
    "temp_hide_button",
    false
  )

  // 在页面刷新后重置临时隐藏状态
  useEffect(() => {
    // 页面加载时重置临时隐藏状态，确保刷新后悬浮窗恢复显示
    setTempHideButton(false)
  }, [
    // 页面加载时重置临时隐藏状态，确保刷新后悬浮窗恢复显示
    setTempHideButton
  ])

  // 使用floating-ui来定位弹窗
  const { refs, floatingStyles, context } = useFloating({
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

  // 如果设置为不显示悬浮窗或临时隐藏，则直接返回null
  if (showFloatButton === "false" || tempHideButton) {
    return null
  }

  return (
    <>
      {/* 浮动按钮 */}
      <div ref={refs.setReference} {...getReferenceProps()}>
        <FloatingButton onClick={handleButtonClick} isOpen={isOpen} />
      </div>
      {isOpen && (
        <>
          {/* 自定义遮罩层 */}
          <div
            className="fixed inset-0 z-[998] bg-black/50 backdrop-blur"
            onClick={handleClose} // 点击遮罩层关闭弹窗
          />
          {/* 弹窗内容 */}
          <FloatingFocusManager context={context}>
            <div
              ref={refs.setFloating}
              className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 z-[999] max-h-[90vh] max-w-[95vw] rounded-xl border-2 border-sky-200 bg-white text-black md:fixed md:h-[90vh] md:max-h-[90vh] md:w-[95vw]"
              {...getFloatingProps()}>
              <PopupContent
                onClose={handleClose}
                className="h-full max-h-[90vh]"
              />
            </div>
          </FloatingFocusManager>
        </>
      )}
    </>
  )
}

export default FloatingPopup
