import type { RefObject } from "react"
import { useEffect, useRef } from "react"

/**
 * 用于检测点击指定元素外部的自定义Hook
 * @param ref 目标元素的引用
 * @param callback 点击外部时触发的回调函数
 * @param deps 依赖数组，当依赖变化时重新绑定事件
 */
const useOutsideClick = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T> | RefObject<T>[],
  callback: (event: MouseEvent) => void,
  deps: unknown[] = []
): void => {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 确保触发事件的元素是有效的
      if (!event.target) return

      const refs = Array.isArray(ref) ? ref : [ref]

      // 检查是否存在有效的ref
      const validRefs = refs.filter((r) => r?.current)
      if (validRefs.length === 0) return

      // 检查点击是否发生在所有引用元素之外
      const isOutside = validRefs.every((r) => {
        const element = r.current
        if (!element) return true

        // 检查点击的元素是否是目标元素或其子元素
        return !element.contains(event.target as Node)
      })

      // 只有当点击发生在所有元素外部时才调用回调
      if (isOutside) {
        callbackRef.current(event)
      }
    }

    // 添加事件监听器，使用捕获阶段
    document.addEventListener("mousedown", handleClickOutside, true)

    // 清理函数
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true)
    }
  }, [ref, ...deps])
}

export default useOutsideClick
