import { useState } from "react"

import type { ImageDisplayProps } from "./types"

/**
 * 通用图片显示组件，带有加载状态和错误处理
 */
export const ImageDisplay: React.FC<ImageDisplayProps> = ({
  src,
  alt,
  title,
  className = "",
  onLoadError
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  return (
    <div
      className={`relative size-full flex items-center justify-center bg-white ${className}`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-full flex items-center justify-center bg-gradient-to-r from-pink-50 to-purple-50 animate-pulse">
            <div className="text-pink-400 animate-bounce">加载中...</div>
          </div>
        </div>
      )}

      {!hasError ? (
        <img
          src={src}
          alt={alt || "可爱图片"}
          title={title || alt || ""}
          className="relative z-10 max-w-full max-h-full object-contain rounded"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
            if (onLoadError) onLoadError(src)
          }}
        />
      ) : (
        <div className="text-red-500 text-sm p-2 flex flex-col items-center justify-center">
          <span className="mb-1">(˃̣̣̥⌓˂̣̣̥) </span>
          <span>图片加载失败</span>
        </div>
      )}
    </div>
  )
}

export default ImageDisplay
