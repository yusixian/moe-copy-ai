import ImageDisplay from "./ImageDisplay"
import type { MetadataTableProps } from "./types"

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
    <div className="bg-blue-50 rounded-xl border-2 border-sky-200 overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-sky-200">
        <thead className="bg-gradient-to-r from-blue-100 to-indigo-100">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">
              属性 🏷️
            </th>
            <th className="px-3 py-2 text-left text-xs font-medium text-sky-600 uppercase tracking-wider">
              值 ✨
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-blue-100">
          {filteredEntries.map(([key, value], index) => (
            <tr
              key={key}
              className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
              <td className="px-3 py-2 text-xs text-indigo-600 font-medium">
                {key}
              </td>
              <td className="px-3 py-2 text-xs text-gray-700 whitespace-pre-wrap break-all">
                {truncateText(value, 200)}
                {/* 为图片类型显示缩略图 */}
                {(key === "og:image" ||
                  key === "twitter:image" ||
                  key === "image") &&
                  value && (
                    <div className="mt-1">
                      <div className="relative w-[120px] h-[80px] border-2 border-sky-200 rounded-lg overflow-hidden bg-white shadow-sm transform hover:scale-105 transition-all">
                        <ImageDisplay
                          src={value}
                          alt={`${key} 预览`}
                          className="size-full"
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
      <div className="text-center p-1 text-xs text-sky-400 bg-blue-50 border-t border-blue-100">
        ✨ 元数据可以帮助 AI 更好地理解页面内容 ✨
      </div>
    </div>
  )
}

export default MetadataTable
