import { Icon } from "@iconify/react"
import { memo, useState } from "react"

import type { ImageInfo } from "~constants/types"
import { useI18n } from "~utils/i18n"

import { openInNewTab, preventBubbling } from "../utils"
import CopyableTextField from "./CopyableTextField"
import DownloadButton from "./DownloadButton"
import { AnimatedContainer } from "./ui/animated-container"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Collapsible } from "./ui/collapsible"
import { Image } from "./ui/image"
import {
  CornerDots,
  HeartDecoration,
  SadFaceDecoration,
  StarDecoration
} from "./ui/image-decorations"

// 图片加载失败显示组件
const ImageLoadError = () => {
  const { t } = useI18n()
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-2 text-center">
      <span className="mt-2 text-red-400 text-xs">
        <SadFaceDecoration />
        <br />
        {t("image.loadError")}
      </span>
    </div>
  )
}

// 单张图片卡片组件
interface ImageCardProps {
  img: ImageInfo
  index: number
  isHovered: boolean
  isFailed: boolean
  onHover: (index: number | null) => void
  onOpen: (src: string) => void
  onError: (src: string) => void
}

const ImageCard = memo(
  ({
    img,
    index,
    isHovered,
    isFailed,
    onHover,
    onOpen,
    onError
  }: ImageCardProps) => {
    const { t } = useI18n()
    return (
      <Card
        key={index}
        variant="image"
        padding="none"
        className="overflow-hidden border border-sky-100/60 shadow-sm transition-all duration-300 hover:shadow-md hover:shadow-sky-100/50"
        onMouseEnter={() => onHover(index)}
        onMouseLeave={() => onHover(null)}>
        <div className="relative flex h-[140px] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-white">
          <CornerDots variant="blue" />
          <Image
            src={img.src}
            alt={img.alt || t("image.noImages")}
            title={img.title || img.alt || ""}
            variant="rounded"
            size="full"
            containerClassName={`transition-all duration-300 ${isHovered ? "scale-110" : ""}`}
            onLoadError={() => onError(img.src)}
          />
          <DownloadButton
            fileUrl={img.src}
            fileName={`${img.alt}.jpg`}
            className="absolute top-2 right-2 z-10"
          />
          {isFailed && <ImageLoadError />}

          {isHovered && (
            <AnimatedContainer
              animation="pulse"
              className="absolute top-2.5 right-2.5">
              <HeartDecoration />
            </AnimatedContainer>
          )}
        </div>
        <div className="truncate border-sky-100/50 border-t bg-gradient-to-r from-blue-50/80 to-sky-50/80 p-2 text-center font-medium text-sky-700 text-xs">
          {img.alt || img.title || `${t("image.noImages")} #${img.index}`}
        </div>

        <div className="border-sky-100/50 border-t bg-gradient-to-r from-blue-50/60 to-sky-50/60 px-3 py-2 transition-all duration-300">
          <CopyableTextField text={img.src} isUrl={true} />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={preventBubbling(() => onOpen(img.src))}
              variant="ghost"
              size="sm"
              className="text-sky-600 text-xs hover:bg-sky-50 hover:text-sky-700"
              icon={
                <Icon
                  icon="line-md:external-link"
                  className="mr-1 h-3.5 w-3.5"
                />
              }>
              {t("image.openOriginal")}
            </Button>
          </div>
        </div>
      </Card>
    )
  }
)
ImageCard.displayName = "ImageCard"

// 底部统计信息组件
interface ImageGridFooterProps {
  count: number
}

const ImageGridFooter = ({ count }: ImageGridFooterProps) => {
  const { t } = useI18n()
  return (
    <div className="mt-5 flex justify-center">
      <Badge
        variant="info"
        size="lg"
        className="relative bg-white/80 px-6 py-2 shadow-sm">
        <CornerDots variant="mixed" />

        <Icon
          icon="line-md:image-twotone"
          className="mr-1.5 h-4 w-4 text-sky-500"
        />
        <span className="font-medium text-sky-700 text-sm">
          {t("image.count", { count })}
        </span>
        <AnimatedContainer animation="bounce" className="ml-1 inline-block">
          <StarDecoration />
        </AnimatedContainer>
      </Badge>
    </div>
  )
}

interface ImageGridProps {
  images: ImageInfo[]
  onLoadError?: (src: string) => void
  title?: React.ReactNode
}

/**
 * 图片网格组件，用于显示页面中抓取的图片
 */
export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onLoadError,
  title
}) => {
  const { t } = useI18n()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [failedImages, setFailedImages] = useState<{ [key: string]: boolean }>(
    {}
  )

  // 处理图片加载失败
  const handleImageError = (src: string) => {
    setFailedImages((prev) => ({ ...prev, [src]: true }))
    if (onLoadError) onLoadError(src)
  }

  // 在新标签页中打开图片
  const handleOpenInNewTab = (src: string) => {
    openInNewTab(src)
  }

  if (!images?.length) return null

  const defaultTitle = (
    <span className="flex items-center font-medium text-xs">
      <Icon
        icon="line-md:image-twotone"
        className="mr-1.5 h-4 w-4 text-sky-500"
      />
      {t("image.count", { count: images.length })}
    </span>
  )

  return (
    <Collapsible title={title || defaultTitle}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
        {images.map((img, index) => (
          <ImageCard
            key={img.src || `img-${index}`}
            img={img}
            index={index}
            isHovered={hoveredIndex === index}
            isFailed={!!failedImages[img.src]}
            onHover={setHoveredIndex}
            onOpen={handleOpenInNewTab}
            onError={handleImageError}
          />
        ))}
      </div>

      <ImageGridFooter count={images.length} />
    </Collapsible>
  )
}

export default ImageGrid
