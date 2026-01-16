import { useI18n } from "~utils/i18n"

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

  return (
    <div className="overflow-hidden rounded-xl border-2 border-sky-200 bg-blue-50 shadow-sm">
      <table className="min-w-full divide-y divide-sky-200">
        <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
          <tr>
            <th className="w-1/5 px-3 py-2 text-left font-medium text-sky-600 text-xs uppercase tracking-wider">
              {t("metadata.property")}
            </th>
            <th className="w-4/5 px-3 py-2 text-left font-medium text-sky-600 text-xs uppercase tracking-wider">
              {t("metadata.value")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-100 bg-white">
          {filteredEntries.map(([key, value], index) => (
            <tr
              key={key}
              className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
              <td className="w-1/5 px-3 py-2 font-medium text-indigo-600 text-xs">
                {key}
              </td>
              <td className="w-4/5 whitespace-pre-wrap break-all px-3 py-2 text-gray-700 text-xs">
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
                      <div className="relative h-[80px] w-[120px] transform overflow-hidden rounded-lg border-2 border-sky-200 bg-white shadow-sm transition-all hover:scale-105">
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
      <div className="border-blue-100 border-t bg-blue-50 p-1 text-center text-sky-400 text-xs">
        {t("metadata.help")}
      </div>
    </div>
  )
}

export default MetadataTable
