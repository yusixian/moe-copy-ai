import DownloadButton from "./DownloadButton"
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
          onLoadError={() => onLoadError?.(label)}
        />
        <DownloadButton
          fileUrl={src}
          fileName={`${label}.jpg`}
          title="点击下载可爱图片～"
          className="absolute top-2 right-2 z-10"
        />
      </div>
      <div className="border-sky-200 border-t bg-gradient-to-r from-blue-50 to-indigo-50 p-1.5 text-center text-sky-600 text-xs">
        {label} ✨
      </div>
    </div>
  )
}

export default MetadataImage
