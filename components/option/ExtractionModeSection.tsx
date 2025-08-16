import { Icon } from "@iconify/react"
import React, { useEffect, useState } from "react"

import type { ExtractionMode } from "../../constants/types"
import { getExtractionMode, setExtractionMode } from "../../utils/storage"
import OptionSection from "./OptionSection"

const EXTRACTION_MODE_OPTIONS = [
  {
    label: "选择器模式",
    value: "selector",
    description: "使用 CSS 选择器提取内容，精确度高，适合博客网站等结构",
    icon: "heroicons-solid:selector",
    color: "purple",
    borderColor: "border-purple-300",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50"
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
        setExtractionModeState(mode)
      } catch (error) {
        console.error("加载抓取模式设置失败:", error)
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
          <div className="text-center text-sm text-purple-500">
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
              className={`group relative flex cursor-pointer items-start space-x-3 rounded-xl border-2 p-4 transition-all duration-300 ${
                extractionMode === option.value
                  ? `${option.borderColor} scale-[1.02] transform shadow-md`
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
              } ${saving ? "cursor-not-allowed opacity-50" : "hover:scale-[1.01]"}`}>
              <div className="relative flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  checked={extractionMode === option.value}
                  onChange={() =>
                    !saving && handleModeChange(option.value as ExtractionMode)
                  }
                  disabled={saving}
                  className={`form-radio mt-1 ${option.textColor.replace("text-", "text-")} focus:ring-${option.color}-400`}
                />
              </div>

              <div className="relative flex-1">
                <div className="flex flex-wrap items-center space-x-2">
                  <div className="flex items-center gap-1.5">
                    <Icon
                      icon={option.icon}
                      className={`${option.textColor} ${extractionMode === option.value ? "animate-pulse" : ""}`}
                      width="18"
                      height="18"
                    />
                  </div>
                  <span
                    className={`font-medium ${extractionMode === option.value ? option.textColor : "text-gray-900"}`}>
                    {option.label}
                  </span>
                  {extractionMode === option.value && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 from-pink-100 to-purple-100 px-2 py-1 text-xs font-medium text-purple-700 shadow-sm">
                      <Icon
                        icon="line-md:star-filled"
                        className="text-yellow-500"
                      />
                      <span>当前选择</span>
                      <span className="opacity-75">(〃∀〃)</span>
                    </span>
                  )}
                  {option.value === "hybrid" && extractionMode !== "hybrid" && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-yellow-200 from-yellow-100 to-orange-100 px-2 py-1 text-xs font-medium text-orange-700">
                      <Icon
                        icon="line-md:star-pulsating-loop"
                        width="10"
                        height="10"
                        className="text-yellow-500"
                      />
                      <span>推荐</span>
                      <span className="opacity-75">✨</span>
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
                <p className="text-sm leading-relaxed text-emerald-600">
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
                icon="line-md:star-pulsating-loop"
                className="animate-pulse text-purple-500"
                width="18"
                height="18"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-medium text-purple-700">混合模式说明</p>
                </div>
                <p className="text-sm leading-relaxed text-purple-600">
                  同时使用选择器和 Readability
                  两种方式提取内容，智能评估并选择质量更高的结果。
                  这种方式结合了两种方法的优点，适合各种类型的网站呢～。
                </p>
              </div>
            </div>
          </div>
        )}

        {extractionMode === "selector" && (
          <div className="mt-4 rounded-xl border-2 border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50 p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <Icon
                icon="line-md:cog-twotone"
                className="animate-pulse text-slate-500"
                width="18"
                height="18"
              />
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="font-medium text-slate-700">选择器模式说明</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  使用预定义的 CSS 选择器提取内容，精确度高。
                  可以在"选择器设置"中添加自定义选择器以适配特定网站呢～
                </p>
              </div>
            </div>
          </div>
        )}

        {saving && (
          <div className="flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 p-3 text-sm">
            <Icon
              icon="line-md:loading-alt-loop"
              className="animate-spin text-purple-500"
              width="16"
              height="16"
            />
            <span className="font-medium text-purple-600">保存中...</span>
            <span className="animate-bounce text-purple-500">(｡◕‿◕｡)</span>
          </div>
        )}
      </div>
    </OptionSection>
  )
}

export default ExtractionModeSection
