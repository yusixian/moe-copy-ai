import { decode, encode } from "gpt-tokenizer"
import { useMemo, useState } from "react"

import { useI18n } from "~utils/i18n"

import { Button } from "./ui/button"
import { Card } from "./ui/card"

interface TokenizationDisplayProps {
  className?: string
  content: string
  isVisible: boolean
  showOnlySummary?: boolean
}

const TokenizationDisplay: React.FC<TokenizationDisplayProps> = ({
  content,
  isVisible,
  className,
  showOnlySummary = false
}) => {
  const { t } = useI18n()
  const [showTokenIds, setShowTokenIds] = useState(false)

  // 使用gpt-tokenizer对内容进行分词
  const tokens = useMemo(() => {
    if (!content || !isVisible) return []
    try {
      return encode(content)
    } catch (error) {
      console.error("分词失败:", error)
      return []
    }
  }, [content, isVisible])

  // 获取每个token对应的文本片段
  const tokenTextPairs = useMemo(() => {
    if (!tokens.length || !isVisible || showOnlySummary) return []

    const pairs: { token: number; text: string }[] = []

    // 逐个解码每个token，获取对应的文本
    for (const token of tokens) {
      try {
        const text = decode([token])
        pairs.push({ token, text })
      } catch (error) {
        console.error(`解码token ${token} 失败:`, error)
        pairs.push({ token, text: "" })
      }
    }

    return pairs
  }, [tokens, isVisible, showOnlySummary])

  // 用于生成随机颜色的函数
  const getTokenColor = (token: number) => {
    // 使用token值作为种子生成一致的颜色
    const hue = (token * 137) % 360
    return `hsl(${hue}, 80%, 85%)`
  }

  if (!isVisible || !content) {
    return null
  }

  return (
    <div className={className}>
      {!showOnlySummary && (
        <>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-medium text-sm text-text-1">
              {t("content.tokenization.title")}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTokenIds(!showTokenIds)}>
              {showTokenIds
                ? t("content.tokenization.hideIds")
                : t("content.tokenization.showIds")}
            </Button>
          </div>

          <Card className="h-[12.5rem] overflow-auto p-4">
            <div className="flex flex-wrap gap-1">
              {tokenTextPairs.map((pair, index) => (
                <div
                  key={`${pair.token}-${index}`}
                  className="group relative rounded px-1 py-0.5 text-sm text-text-2 transition-all hover:shadow-md"
                  style={{ backgroundColor: getTokenColor(pair.token) }}>
                  {showTokenIds ? pair.token : pair.text}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <div className="mt-2 text-text-3 text-xs">
        {t("content.tokenization.stats", {
          chars: content.length,
          tokens: tokens.length
        })}
        {"("}
        <a
          href="https://github.com/niieani/gpt-tokenizer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent-blue hover:text-accent-blue-hover">
          gpt-tokenizer
        </a>
        {t("content.tokenization.disclaimer")}
      </div>
    </div>
  )
}

export default TokenizationDisplay
