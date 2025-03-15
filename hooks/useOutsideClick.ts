import { useEffect, type RefObject } from "react"

// 点击外部区域关闭弹窗的自定义Hook
export function useOutsideClick(
  ref: RefObject<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    // 点击事件处理函数
    function handleClickOutside(event: MouseEvent) {
      // 如果点击的元素不在ref引用的元素内部，则触发回调
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }

    // 添加事件监听器
    document.addEventListener("mousedown", handleClickOutside)

    // 清理函数，移除事件监听器
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [ref, callback])
}
