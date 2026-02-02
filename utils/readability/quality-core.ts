export type QualityEvaluation = {
  betterContent: string
  reason: string
  scores: { selector: number; readability: number }
}

export type QualityScores = {
  selector: number
  readability: number
}

export type QualityStrategy = {
  name: string
  threshold: number
  score: (content: string) => number
  decide?: (
    scores: QualityScores,
    selectorContent: string,
    readabilityContent: string
  ) => QualityEvaluation
}

// 用于结构化评估的中间指标，便于保持评分可解释。
type ScoreFactors = {
  length: number
  paragraphs: number
  headings: number
  htmlTagRatio: number
}

function calculateScoreFactors(content: string): ScoreFactors {
  const length = content.length
  const paragraphs = content
    .split("\n\n")
    .filter((p) => p.trim().length > 20).length
  const headings = (content.match(/^#+\s/gm) || []).length
  const htmlTagCount = (content.match(/<[^>]+>/g) || []).length
  const htmlTagRatio = length > 0 ? htmlTagCount / (length / 100) : 0

  return { length, paragraphs, headings, htmlTagRatio }
}

function calculateScore(content: string): number {
  if (!content) return 0

  const factors = calculateScoreFactors(content)
  let score = 0

  // 评分刻意偏向结构完整的长文本，避免短文本误判为高质量。
  if (factors.length > 1000) score += 40
  else if (factors.length > 500) score += 30
  else if (factors.length > 200) score += 20
  else score += 10

  if (factors.paragraphs > 5) score += 20
  else if (factors.paragraphs > 2) score += 15
  else score += 5

  if (factors.headings > 2) score += 20
  else if (factors.headings > 0) score += 10

  if (factors.htmlTagRatio < 1) score += 20
  else if (factors.htmlTagRatio < 3) score += 10

  return Math.min(score, 100)
}

const SCORE_THRESHOLD = 10

// 默认策略：以结构化分数为主，明显差距才切换，避免抖动。
export const DefaultQualityStrategy: QualityStrategy = {
  name: "default",
  threshold: SCORE_THRESHOLD,
  score: calculateScore,
  decide: undefined
}

export function evaluateContentQualityWithStrategy(
  strategy: QualityStrategy,
  selectorContent: string,
  readabilityContent: string
): QualityEvaluation {
  // 策略可替换，调用方不需要了解评分细节。
  const selectorScore = strategy.score(selectorContent)
  const readabilityScore = strategy.score(readabilityContent)
  const scores = { selector: selectorScore, readability: readabilityScore }

  if (strategy.decide) {
    return strategy.decide(scores, selectorContent, readabilityContent)
  }

  if (scores.readability > scores.selector + strategy.threshold) {
    return {
      betterContent: readabilityContent,
      reason: `Readability quality higher (${scores.readability} vs ${scores.selector})`,
      scores
    }
  }

  if (scores.selector > scores.readability + strategy.threshold) {
    return {
      betterContent: selectorContent,
      reason: `Selector quality higher (${scores.selector} vs ${scores.readability})`,
      scores
    }
  }

  const betterContent =
    readabilityContent.length > selectorContent.length
      ? readabilityContent
      : selectorContent

  return {
    betterContent,
    reason: "Scores similar, choosing more detailed content",
    scores
  }
}

export function evaluateContentQualityCore(
  selectorContent: string,
  readabilityContent: string
): QualityEvaluation {
  return evaluateContentQualityWithStrategy(
    DefaultQualityStrategy,
    selectorContent,
    readabilityContent
  )
}
