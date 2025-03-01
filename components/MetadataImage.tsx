import { Image } from "./ui/image"

// 元数据图片组件属性
interface MetadataImageProps {
  src: string
  alt: string
  label: string
  onLoadError?: (label: string) => void
}

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
    <div className="transform overflow-hidden rounded-lg border-2 border-sky-200 bg-white shadow-sm transition-all hover:scale-105 hover:shadow-md">
      <div className="relative flex h-[150px] w-full items-center justify-center">
        <Image
          src={src}
          alt={alt}
          variant="rounded"
          size="full"
          onLoadError={() => onLoadError && onLoadError(label)}
        />
      </div>
      <div className="border-t border-sky-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 text-center text-xs text-sky-600">
        {label} ✨
      </div>
    </div>
  )
}

export default MetadataImage
