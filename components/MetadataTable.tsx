import { cn } from "~utils/cn"
import { useI18n } from "~utils/i18n"
import { useTheme } from "~utils/theme"

import CopyableTextField from "./CopyableTextField"
import { Image } from "./ui/image"

// 元数据表格组件属性
export interface MetadataTableProps {
  metadata: Record<string, string>
  onLoadError?: (key: string) => void
}

/**
 * 元数据表格组件
 */
export const MetadataTable: React.FC<MetadataTableProps> = ({
  metadata,
  onLoadError
}) => {
  const { t } = useI18n()
  const { resolvedTheme } = useTheme()

  // 重要的元数据字段
  const importantKeys = [
    "description",
    "keywords",
    "og:title",
    "og:description",
    "og:image",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "image"
  ]

  // 过滤出重要的元数据
  const filteredEntries = Object.entries(metadata).filter(([key]) =>
    importantKeys.includes(key)
  )

  if (filteredEntries.length === 0) {
    return null
  }

  const isLight = resolvedTheme === "light"

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border shadow-sm",
        isLight
          ? "border-sky-200 bg-blue-50"
          : "border-accent-blue/30 bg-content-alt"
      )}>
      <table className="min-w-full divide-y divide-line-2">
        <thead
          className={cn(
            isLight
              ? "bg-gradient-to-r from-blue-100 to-indigo-100"
              : "bg-accent-blue-ghost"
          )}>
          <tr>
            <th
              className={cn(
                "w-1/5 px-3 py-2 text-left font-medium text-xs uppercase tracking-wider",
                isLight ? "text-sky-700" : "text-accent-blue"
              )}>
              {t("metadata.property")}
            </th>
            <th
              className={cn(
                "w-4/5 px-3 py-2 text-left font-medium text-xs uppercase tracking-wider",
                isLight ? "text-sky-700" : "text-accent-blue"
              )}>
              {t("metadata.value")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-1 bg-content-solid">
          {filteredEntries.map(([key, value], index) => (
            <tr
              key={key}
              className={
                index % 2 === 0 ? "bg-content-alt" : "bg-content-solid"
              }>
              <td
                className={cn(
                  "w-1/5 px-3 py-2 font-medium text-xs",
                  isLight ? "text-sky-700" : "text-accent-blue"
                )}>
                {key}
              </td>
              <td className="w-4/5 whitespace-pre-wrap break-all px-3 py-2 text-text-2 text-xs">
                <CopyableTextField
                  text={value}
                  readOnly={true}
                  rows={3}
                  className="w-full"
                />
                {/* 为图片类型显示缩略图 */}
                {(key === "og:image" ||
                  key === "twitter:image" ||
                  key === "image") &&
                  value && (
                    <div className="mt-1">
                      <div
                        className={cn(
                          "relative h-[80px] w-[120px] transform overflow-hidden rounded-lg border bg-content-solid shadow-sm transition-all hover:scale-105",
                          isLight ? "border-sky-200" : "border-accent-blue/30"
                        )}>
                        <Image
                          src={value}
                          alt={`${key} ${t("metadata.preview")}`}
                          variant="rounded"
                          size="full"
                          containerClassName="size-full"
                          onLoadError={() => onLoadError?.(key)}
                        />
                      </div>
                    </div>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className={cn(
          "border-t p-1 text-center text-xs",
          isLight
            ? "border-sky-200 bg-blue-50/50 text-sky-700"
            : "border-accent-blue/20 bg-content-alt text-accent-blue"
        )}>
        {t("metadata.help")}
      </div>
    </div>
  )
}

export default MetadataTable
