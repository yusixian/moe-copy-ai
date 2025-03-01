import ImageDisplay from "./ImageDisplay"
import type { MetadataImageProps } from "./types"

/**
 * 元数据图片显示组件
 */
export const MetadataImage: React.FC<MetadataImageProps> = ({
  src,
  alt,
  label,
  onLoadError
}) => {
  return (
    <div className="border-2 border-sky-200 rounded-lg overflow-hidden bg-white shadow-sm transform hover:scale-105 transition-all hover:shadow-md">
      <div className="relative w-full h-[150px] flex items-center justify-center">
        <ImageDisplay
          src={src}
          alt={alt}
          onLoadError={() => onLoadError && onLoadError(label)}
        />
      </div>
      <div className="text-xs p-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-center border-t border-sky-200 text-sky-600">
        {label} ✨
      </div>
    </div>
  )
}

export default MetadataImage
