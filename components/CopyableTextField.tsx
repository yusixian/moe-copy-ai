import { Icon } from "@iconify/react"
import { useEffect, useMemo, useState } from "react"

import { cn } from "~/utils"

import { CopyIcon } from "./svg/CopyIcon"
import { AnimatedContainer } from "./ui/animated-container"
import { Button } from "./ui/button"

// 防止事件冒泡的工具函数
const preventBubbling =
  (callback: Function) => (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    callback(e)
  }

interface CopyableTextFieldProps {
  /**
   * 需要显示和复制的文本内容
   */
  text: string
  /**
   * 文本长度超过此阈值时使用textarea而非input
   */
  textareaThreshold?: number
  /**
   * 是否为只读模式（默认为true）
   */
  readOnly?: boolean
  /**
   * 复制成功时的回调函数
   */
  onCopied?: () => void
  /**
   * 自定义样式类名
   */
  className?: string
  /**
   * textarea的行数（仅在使用textarea时有效）
   */
  rows?: number
  /**
   * 占位符文本
   */
  placeholder?: string
  /**
   * 是否为 url
   */
  isUrl?: boolean
}

/**
 * 可复制文本字段组件
 * 根据文本长度自动选择使用textarea或input
 */
export const CopyableTextField: React.FC<CopyableTextFieldProps> = ({
  text,
  isUrl,
  textareaThreshold = 50,
  readOnly = true,
  onCopied,
  className,
  rows = 3,
  placeholder = ""
}) => {
  const [isCopied, setIsCopied] = useState(false)
  const isLongText = useMemo(
    () => !isUrl && text.length > textareaThreshold,
    [text, textareaThreshold, isUrl]
  )
  // 复制功能
  const handleCopy = preventBubbling(() => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true)
      onCopied?.()
    })
  })

  // 复制状态重置
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-0">
        <div className="relative flex w-full items-center">
          {isLongText ? (
            <textarea
              value={text}
              readOnly={readOnly}
              rows={rows}
              placeholder={placeholder}
              className="w-full resize-none overflow-hidden rounded-l-md border border-r-0 border-sky-200/70 bg-white bg-opacity-70 px-2.5 py-1.5 text-xs text-slate-600 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300"
            />
          ) : (
            <input
              type="text"
              value={text}
              readOnly={readOnly}
              placeholder={placeholder}
              className="w-full truncate rounded-l-md border border-r-0 border-sky-200/70 bg-white bg-opacity-70 px-2.5 py-1.5 text-xs text-slate-600 focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300"
            />
          )}
          <Button
            onClick={handleCopy}
            variant="copy"
            size="icon"
            className={cn(
              "border border-sky-200/70 bg-white transition-all duration-200 hover:bg-sky-50",
              isLongText
                ? "absolute right-0 top-0 border-none opacity-80 hover:opacity-100"
                : "rounded-l-none rounded-r-md shadow-none",
              {
                "border-green-200 bg-green-50": isCopied
              }
            )}>
            {isCopied ? (
              <AnimatedContainer animation="fadeIn">
                <Icon
                  icon="line-md:check-all"
                  className="size-4 text-green-600"
                />
              </AnimatedContainer>
            ) : (
              <CopyIcon size={16} />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CopyableTextField
