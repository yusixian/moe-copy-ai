import { useState } from "react"

import type { ImageInfo } from "~contents/types"

import ImageDisplay from "./ImageDisplay"

interface ImageGridProps {
  images: ImageInfo[]
  onLoadError?: (src: string) => void
}

/**
 * 图片网格组件，用于显示页面中抓取的图片
 */
export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onLoadError
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {images.map((img, index) => (
        <div
          key={index}
          className="border-2 border-sky-200 rounded-lg overflow-hidden shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-md hover:-rotate-1"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}>
          <div className="relative w-full h-[120px] flex items-center justify-center bg-white overflow-hidden">
            {/* 可爱的图片装饰元素 */}
            <div className="absolute top-0 left-0 size-full">
              <div className="absolute top-1 left-1 w-3 h-3 bg-blue-200 rounded-full opacity-60"></div>
              <div className="absolute top-1 right-1 w-3 h-3 bg-blue-200 rounded-full opacity-60"></div>
              <div className="absolute bottom-1 left-1 w-3 h-3 bg-blue-200 rounded-full opacity-60"></div>
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-blue-200 rounded-full opacity-60"></div>
            </div>

            <ImageDisplay
              src={img.src}
              alt={img.alt || "萌萌哒图片"}
              title={img.title || img.alt || ""}
              onLoadError={onLoadError}
              className={`transition-all duration-300 ${hoveredIndex === index ? "scale-110" : ""}`}
            />

            {/* 悬浮时显示的小爱心 */}
            {hoveredIndex === index && (
              <div className="absolute top-2 right-2 text-sky-500 animate-pulse">
                ❤
              </div>
            )}
          </div>
          <div className="p-1.5 text-xs bg-gradient-to-r from-blue-50 to-indigo-50 truncate text-center border-t border-sky-200 text-sky-600">
            {img.alt || img.title || `可爱图片 #${img.index} ✨`}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ImageGrid
