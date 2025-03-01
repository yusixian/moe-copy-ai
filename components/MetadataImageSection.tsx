import MetadataImage from "./MetadataImage"

interface MetadataImageSectionProps {
  metadata: Record<string, string>
  onLoadError?: (label: string) => void
}

/**
 * 元数据图片区域组件
 */
export const MetadataImageSection: React.FC<MetadataImageSectionProps> = ({
  metadata,
  onLoadError
}) => {
  // 检查是否有任何图片元数据
  const hasImages =
    metadata["og:image"] || metadata["twitter:image"] || metadata["image"]

  if (!hasImages) {
    return null
  }

  return (
    <div className="mb-4">
      <h3 className="text-md font-medium mb-2 text-sky-600">元数据图片</h3>
      <div className="flex flex-wrap gap-3">
        {metadata["og:image"] && (
          <MetadataImage
            src={metadata["og:image"]}
            alt="Open Graph 图片"
            label="og:image"
            onLoadError={onLoadError}
          />
        )}
        {metadata["twitter:image"] && (
          <MetadataImage
            src={metadata["twitter:image"]}
            alt="Twitter 图片"
            label="twitter:image"
            onLoadError={onLoadError}
          />
        )}
        {metadata["image"] && (
          <MetadataImage
            src={metadata["image"]}
            alt="元数据图片"
            label="image"
            onLoadError={onLoadError}
          />
        )}
      </div>
    </div>
  )
}

export default MetadataImageSection
