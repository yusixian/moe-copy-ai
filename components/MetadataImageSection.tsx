import { useI18n } from "~utils/i18n"

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
  const { t } = useI18n()
  // 检查是否有任何图片元数据
  const hasImages =
    metadata["og:image"] || metadata["twitter:image"] || metadata.image

  if (!hasImages) {
    return null
  }

  return (
    <div className="mb-4">
      <h3 className="mb-2 font-medium text-md text-sky-600">
        {t("metadata.images")}
      </h3>
      <div className="flex flex-wrap gap-3">
        {metadata["og:image"] && (
          <MetadataImage
            src={metadata["og:image"]}
            alt={t("metadata.ogImage")}
            label="og:image"
            onLoadError={onLoadError}
          />
        )}
        {metadata["twitter:image"] && (
          <MetadataImage
            src={metadata["twitter:image"]}
            alt={t("metadata.twitterImage")}
            label="twitter:image"
            onLoadError={onLoadError}
          />
        )}
        {metadata.image && (
          <MetadataImage
            src={metadata.image}
            alt={t("metadata.image")}
            label="image"
            onLoadError={onLoadError}
          />
        )}
      </div>
    </div>
  )
}

export default MetadataImageSection
