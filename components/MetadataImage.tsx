import { useI18n } from "~utils/i18n"

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
  const { t } = useI18n()
  return (
    <div className="transform overflow-hidden rounded-lg border border-accent-blue/30 bg-content-solid shadow-sm transition-all hover:scale-105 hover:shadow-md">
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
          title={t("metadata.downloadTitle")}
          className="absolute top-2 right-2 z-10"
        />
      </div>
      <div className="border-accent-blue/30 border-t bg-accent-blue-ghost p-1.5 text-center text-accent-blue text-xs">
        {label}
      </div>
    </div>
  )
}

export default MetadataImage
