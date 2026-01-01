import { Icon } from "@iconify/react"
import { useClipboard } from "foxact/use-clipboard"
import { useEffect, useMemo } from "react"

import { cn } from "~/utils"

import { CopyIcon } from "./svg/CopyIcon"
import { AnimatedContainer } from "./ui/animated-container"
import { Button } from "./ui/button"

// 防止事件冒泡的工具函数
const preventBubbling =
  (callback: () => void) => (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
    callback()
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
  const { copy, copied } = useClipboard({ timeout: 2000 })
  const isLongText = useMemo(
    () => !isUrl && text.length > textareaThreshold,
    [text, textareaThreshold, isUrl]
  )

  // 复制功能
  const handleCopy = preventBubbling(() => {
    copy(text)
  })

  // 触发 onCopied 回调
  useEffect(() => {
    if (copied) {
      onCopied?.()
    }
  }, [copied, onCopied])

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
              className="w-full resize-none overflow-hidden rounded-l-md border border-sky-200/70 border-r-0 bg-white bg-opacity-70 px-2.5 py-1.5 text-slate-600 text-xs focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300"
            />
          ) : (
            <input
              type="text"
              value={text}
              readOnly={readOnly}
              placeholder={placeholder}
              className="w-full truncate rounded-l-md border border-sky-200/70 border-r-0 bg-white bg-opacity-70 px-2.5 py-1.5 text-slate-600 text-xs focus:border-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-300"
            />
          )}
          <Button
            onClick={handleCopy}
            variant="secondary"
            size="icon"
            className={cn(
              "border border-blue-200/70 bg-white transition-all duration-200 hover:bg-blue-50",
              isLongText
                ? "absolute top-0 right-0 border-none opacity-80 hover:opacity-100"
                : "rounded-r-md rounded-l-none shadow-none",
              {
                "border-green-200 bg-green-50": copied
              }
            )}>
            {copied ? (
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
