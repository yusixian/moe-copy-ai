import { Icon } from "@iconify/react"
import { useState } from "react"

import type { ImageInfo } from "~contents/types"

import { openInNewTab, preventBubbling } from "../utils/clipboard"
import CopyableTextField from "./CopyableTextField"
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
const ImageLoadError = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-2 text-center">
    <span className="mt-2 text-xs text-red-400">
      <SadFaceDecoration />
      <br />
      图片加载失败
    </span>
  </div>
)

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

const ImageCard = ({
  img,
  index,
  isHovered,
  isFailed,
  onHover,
  onOpen,
  onError
}: ImageCardProps) => (
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
        alt={img.alt || "萌萌哒图片"}
        title={img.title || img.alt || ""}
        variant="rounded"
        size="full"
        containerClassName={`transition-all duration-300 ${isHovered ? "scale-110" : ""}`}
        onLoadError={() => onError(img.src)}
      />

      {isFailed && <ImageLoadError />}

      {isHovered && (
        <AnimatedContainer
          animation="pulse"
          className="absolute right-2.5 top-2.5">
          <HeartDecoration />
        </AnimatedContainer>
      )}
    </div>
    <div className="truncate border-t border-sky-100/50 bg-gradient-to-r from-blue-50/80 to-sky-50/80 p-2 text-center text-xs font-medium text-sky-700">
      {img.alt || img.title || `图片 #${img.index} ✨`}
    </div>

    <div className="border-t border-sky-100/50 bg-gradient-to-r from-blue-50/60 to-sky-50/60 px-3 py-2 transition-all duration-300">
      <CopyableTextField text={img.src} isUrl={true} />
      <div className="mt-2 flex justify-end">
        <Button
          onClick={preventBubbling(() => onOpen(img.src))}
          variant="ghost"
          size="sm"
          className="text-xs text-sky-600 hover:bg-sky-50 hover:text-sky-700"
          icon={
            <Icon icon="line-md:external-link" className="mr-1 h-3.5 w-3.5" />
          }>
          查看原图
        </Button>
      </div>
    </div>
  </Card>
)

// 底部统计信息组件
interface ImageGridFooterProps {
  count: number
}

const ImageGridFooter = ({ count }: ImageGridFooterProps) => (
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
      <span className="text-sm font-medium text-sky-700">
        总共 {count} 张图片
      </span>
      <AnimatedContainer animation="bounce" className="ml-1 inline-block">
        <StarDecoration />
      </AnimatedContainer>
    </Badge>
  </div>
)

interface ImageGridProps {
  images: ImageInfo[]
  onLoadError?: (src: string) => void
  title?: React.ReactNode
  defaultExpanded?: boolean
}

/**
 * 图片网格组件，用于显示页面中抓取的图片
 */
export const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  onLoadError,
  title,
  defaultExpanded = true
}) => {
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
    <span className="flex items-center text-xs font-medium">
      <Icon
        icon="line-md:image-twotone"
        className="mr-1.5 h-4 w-4 text-sky-500"
      />
      {images.length} 张图片
    </span>
  )

  return (
    <Collapsible
      title={title || defaultTitle}
      defaultExpanded={defaultExpanded}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((img, index) => (
          <ImageCard
            key={index}
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
