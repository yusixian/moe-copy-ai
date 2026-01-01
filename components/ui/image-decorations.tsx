/**
 * 图片装饰元素组件集合
 * 提供各种可爱的装饰元素，用于图片展示
 */

interface CornerDotsProps {
  variant?: "blue" | "pink" | "mixed"
  opacity?: number
  size?: number
}

/**
 * 四角装饰小圆点
 */
export const CornerDots = ({
  variant = "blue",
  opacity = 0.6,
  size = 2
}: CornerDotsProps) => {
  const getColors = () => {
    switch (variant) {
      case "pink":
        return ["bg-pink-200", "bg-pink-200", "bg-pink-200", "bg-pink-200"]
      case "mixed":
        return ["bg-pink-200", "bg-sky-200", "bg-sky-200", "bg-pink-200"]
      default:
        return ["bg-sky-200", "bg-sky-200", "bg-sky-200", "bg-sky-200"]
    }
  }

  const [topLeft, topRight, bottomLeft, bottomRight] = getColors()

  return (
    <div className="absolute top-0 left-0 size-full">
      <div
        className={`absolute top-1.5 left-1.5 h-${size} w-${size} rounded-full ${topLeft}`}
        style={{ opacity }}
      />
      <div
        className={`absolute top-1.5 right-1.5 h-${size} w-${size} rounded-full ${topRight}`}
        style={{ opacity }}
      />
      <div
        className={`absolute bottom-1.5 left-1.5 h-${size} w-${size} rounded-full ${bottomLeft}`}
        style={{ opacity }}
      />
      <div
        className={`absolute right-1.5 bottom-1.5 h-${size} w-${size} rounded-full ${bottomRight}`}
        style={{ opacity }}
      />
    </div>
  )
}

/**
 * 心形装饰
 */
export const HeartDecoration = ({ className = "" }) => (
  <span className={`text-pink-500 ${className}`}>❤</span>
)

/**
 * 星星装饰
 */
export const StarDecoration = ({ className = "" }) => (
  <span className={`text-amber-400 ${className}`}>✨</span>
)

/**
 * 失败表情装饰
 */
export const SadFaceDecoration = ({ className = "" }) => (
  <span className={`text-red-400 ${className}`}>(˃̣̣̥⌓˂̣̣̥)</span>
)
