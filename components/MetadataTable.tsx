import type { MetadataTableProps } from "./types"
import { Image } from "./ui/image"

/**
 * 元数据表格组件
 */
export const MetadataTable: React.FC<MetadataTableProps> = ({
  metadata,
  truncateText,
  onLoadError
}) => {
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
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-sky-600">
              属性 🏷️
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-sky-600">
              值 ✨
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-blue-100 bg-white">
          {filteredEntries.map(([key, value], index) => (
            <tr
              key={key}
              className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
              <td className="px-3 py-2 text-xs font-medium text-indigo-600">
                {key}
              </td>
              <td className="whitespace-pre-wrap break-all px-3 py-2 text-xs text-gray-700">
                {truncateText(value, 200)}
                {/* 为图片类型显示缩略图 */}
                {(key === "og:image" ||
                  key === "twitter:image" ||
                  key === "image") &&
                  value && (
                    <div className="mt-1">
                      <div className="relative h-[80px] w-[120px] transform overflow-hidden rounded-lg border-2 border-sky-200 bg-white shadow-sm transition-all hover:scale-105">
                        <Image
                          src={value}
                          alt={`${key} 预览`}
                          variant="rounded"
                          size="full"
                          containerClassName="size-full"
                          onLoadError={() => onLoadError && onLoadError(key)}
                        />
                      </div>
                    </div>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-blue-100 bg-blue-50 p-1 text-center text-xs text-sky-400">
        ✨ 元数据可以帮助 AI 更好地理解页面内容 ✨
      </div>
    </div>
  )
}

export default MetadataTable
