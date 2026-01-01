import { Icon } from "@iconify/react"
import type React from "react"
import { useEffect, useState } from "react"

import type { ExtractionMode } from "../../constants/types"
import { getExtractionMode, setExtractionMode } from "../../utils/storage"
import OptionSection from "./OptionSection"

const EXTRACTION_MODE_OPTIONS = [
  {
    label: "选择器模式",
    value: "selector",
    description: "使用 CSS 选择器提取内容，精确度高，适合博客网站等结构",
    icon: "heroicons-solid:selector",
    color: "sky",
    borderColor: "border-sky-300",
    textColor: "text-sky-700",
    bgColor: "bg-sky-50"
  },
  {
    label: "Readability 模式",
    value: "readability",
    description:
      "使用 Mozilla Firefox 阅读模式的底层算法 Readability 智能提取内容，通用性强，适合各种网站",
    icon: "ant-design:read-filled",
    color: "emerald",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50"
  },
  {
    label: "混合模式",
    value: "hybrid",
    description: "同时使用两种方式，自动选择更好的结果，推荐使用 (〃∀〃)",
    icon: "radix-icons:mix",
    color: "purple",
    borderColor: "border-purple-300",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50"
  }
]

export const ExtractionModeSection: React.FC = () => {
  const [extractionMode, setExtractionModeState] =
    useState<ExtractionMode>("hybrid")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const mode = await getExtractionMode()
        // 确保始终使用从存储中获取的模式，如果获取失败则强制设为混合模式
        const finalMode = mode || "hybrid"
        setExtractionModeState(finalMode)
        // 如果存储中没有值或获取失败，主动设置一次以确保存储中有正确的默认值
        if (!mode || mode !== finalMode) {
          try {
            await setExtractionMode(finalMode)
          } catch (setError) {
            console.error("初始化抓取模式失败:", setError)
          }
        }
      } catch (error) {
        console.error("加载抓取模式设置失败:", error)
        // 出错时强制设为混合模式并保存到存储
        setExtractionModeState("hybrid")
        try {
          await setExtractionMode("hybrid")
        } catch (saveError) {
          console.error("保存默认抓取模式失败:", saveError)
        }
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleModeChange = async (newMode: ExtractionMode) => {
    try {
      setSaving(true)
      await setExtractionMode(newMode)
      setExtractionModeState(newMode)
    } catch (error) {
      console.error("保存抓取模式设置失败:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <OptionSection title="内容抓取模式" icon="line-md:cog-loop">
        <div className="space-y-3">
          <div className="animate-pulse rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-4 w-4 rounded-full bg-purple-200"></div>
              <div className="flex-1">
                <div className="mb-2 h-4 w-3/4 rounded bg-purple-200"></div>
                <div className="h-3 w-1/2 rounded bg-purple-100"></div>
              </div>
            </div>
          </div>
          <div className="text-center text-purple-500 text-sm">
            <span className="animate-bounce">加载中...</span>
            <span className="ml-2 animate-pulse">(&gt;ω&lt;)</span>
          </div>
        </div>
      </OptionSection>
    )
  }

  return (
    <OptionSection title="内容抓取模式" icon="line-md:cog-loop">
      <div className="space-y-4">
        <div className="space-y-3">
          {EXTRACTION_MODE_OPTIONS.map((option) => (
            <label
              key={option.value}
              htmlFor={`mode-${option.value}`}
              className={`group relative flex cursor-pointer items-start space-x-3 rounded-xl border-2 p-4 transition-all duration-300 ${
                extractionMode === option.value
                  ? `${option.borderColor} transform shadow-md`
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
              } ${saving && "cursor-not-allowed opacity-50"}`}>
              <div className="relative flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  checked={extractionMode === option.value}
                  onChange={() =>
                    !saving && handleModeChange(option.value as ExtractionMode)
                  }
                  disabled={saving}
                  className="sr-only"
                  id={`mode-${option.value}`}
                />
                <div
                  className={`mt-0.5 h-5 w-5 rounded-full border-2 transition-all duration-300 ${
                    extractionMode === option.value
                      ? `${option.borderColor} ${option.bgColor}`
                      : "border-gray-300 bg-white"
                  }`}>
                  <div
                    className={`m-0.5 h-3 w-3 rounded-full transition-all duration-300 ${
                      extractionMode === option.value
                        ? `${option.bgColor.replace("bg-", "bg-")}${option.bgColor.includes("-50") ? option.bgColor.replace("-50", "-400") : ""} scale-100`
                        : "scale-0"
                    }`}
                    style={{
                      backgroundColor:
                        extractionMode === option.value
                          ? option.color === "sky"
                            ? "#0ea5e9"
                            : option.color === "emerald"
                              ? "#10b981"
                              : "#a855f7"
                          : "transparent"
                    }}
                  />
                </div>
              </div>

              <div className="relative flex-1">
                <div className="flex flex-wrap items-center space-x-2">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon={option.icon}
                      className={`${extractionMode === option.value ? option.textColor : ""}`}
                      width="18"
                      height="18"
                    />
                  </div>
                  <span
                    className={`font-medium text-sm/5 ${extractionMode === option.value ? option.textColor : "text-gray-900"}`}>
                    {option.label}
                  </span>
                  {extractionMode === option.value && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-xs shadow-sm ${option.bgColor} ${option.textColor} border ${option.borderColor}`}>
                      <Icon
                        icon="line-md:confirm-circle-twotone"
                        className={option.textColor}
                        width="14"
                        height="14"
                      />
                      已选
                    </span>
                  )}
                  {option.value === "hybrid" && extractionMode !== "hybrid" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 font-medium text-purple-600 text-xs shadow-sm">
                      <Icon
                        icon="line-md:heart-twotone"
                        width="14"
                        height="14"
                        className="text-purple-500"
                      />
                      <span>推荐</span>
                      <span className="opacity-70">♡</span>
                    </span>
                  )}
                </div>
                <p
                  className={`mt-2 text-sm ${extractionMode === option.value ? option.textColor.replace("-700", "-600") : "text-gray-600"}`}>
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>

        {extractionMode === "readability" && (
          <div className="mt-4 rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <Icon
                icon="line-md:lightbulb-twotone"
                className="animate-pulse text-emerald-500"
                width="18"
                height="18"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-medium text-emerald-700">
                    Readability 模式说明
                  </p>
                </div>
                <p className="text-emerald-600 text-sm leading-relaxed">
                  使用 Mozilla Firefox
                  阅读模式的底层算法，能更准确地识别文章内容，
                  自动移除广告和无关元素。适合大多数新闻网站、博客和文章页面呢～
                </p>
              </div>
            </div>
          </div>
        )}

        {extractionMode === "hybrid" && (
          <div className="mt-4 rounded-xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <Icon
                icon="line-md:lightbulb-twotone"
                className="animate-pulse text-purple-500"
                width="18"
                height="18"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-medium text-purple-700">混合模式说明</p>
                </div>
                <p className="text-purple-600 text-sm leading-relaxed">
                  同时使用选择器和 Readability
                  两种方式提取内容，智能评估并选择质量更高的结果。
                  这种方式结合了两种方法的优点，适合各种类型的网站呢～
                </p>
              </div>
            </div>
          </div>
        )}

        {extractionMode === "selector" && (
          <div className="mt-4 rounded-xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <Icon
                icon="line-md:lightbulb-twotone"
                className="animate-pulse text-sky-500"
                width="18"
                height="18"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-medium text-sky-700">选择器模式说明</p>
                </div>
                <p className="text-sky-600 text-sm leading-relaxed">
                  使用预定义的 CSS 选择器提取内容，精确度高。
                  可以在"选择器设置"中添加自定义选择器以适配特定网站呢～
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </OptionSection>
  )
}

export default ExtractionModeSection
