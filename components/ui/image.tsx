import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef, useState } from "react"

import { cn } from "~/utils"
import { useI18n } from "~utils/i18n"

const imageContainerVariants = cva(
  "relative flex items-center justify-center bg-fill-1",
  {
    variants: {
      variant: {
        default: "",
        rounded: "rounded-md",
        circle: "rounded-full overflow-hidden"
      },
      size: {
        full: "size-full",
        auto: "h-auto w-auto"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "full"
    }
  }
)

export interface ImageProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "size">,
    VariantProps<typeof imageContainerVariants> {
  containerClassName?: string
  onLoadError?: (src: string) => void
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      title,
      className,
      containerClassName,
      variant,
      size,
      onLoadError,
      ...props
    },
    ref
  ) => {
    const { t } = useI18n()
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)

    return (
      <div
        className={cn(
          imageContainerVariants({
            variant,
            size,
            className: containerClassName
          })
        )}>
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-full animate-pulse items-center justify-center bg-fill-1">
              <div className="animate-bounce text-text-1">
                {t("image.loading")}
              </div>
            </div>
          </div>
        )}

        {!hasError ? (
          <img
            ref={ref}
            src={src}
            alt={alt || t("image.defaultAlt")}
            title={title || alt || ""}
            className={cn("max-h-full max-w-full object-contain", className)}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false)
              setHasError(true)
              if (onLoadError) onLoadError(src)
            }}
            {...props}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-2 text-error text-sm">
            <span className="mb-1">(˃̣̣̥⌓˂̣̣̥) </span>
            <span>{t("image.loadError")}</span>
          </div>
        )}
      </div>
    )
  }
)

Image.displayName = "Image"

export { Image, imageContainerVariants }
