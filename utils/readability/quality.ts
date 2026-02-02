import { debugLog } from "../logger"

export type QualityEvaluation = {
  betterContent: string
  reason: string
  scores: { selector: number; readability: number }
}

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

  // Length score (0-40)
  if (factors.length > 1000) score += 40
  else if (factors.length > 500) score += 30
  else if (factors.length > 200) score += 20
  else score += 10

  // Paragraph structure score (0-20)
  if (factors.paragraphs > 5) score += 20
  else if (factors.paragraphs > 2) score += 15
  else score += 5

  // Heading structure score (0-20)
  if (factors.headings > 2) score += 20
  else if (factors.headings > 0) score += 10

  // HTML tag density score (lower is better) (0-20)
  if (factors.htmlTagRatio < 1) score += 20
  else if (factors.htmlTagRatio < 3) score += 10

  return Math.min(score, 100)
}

const SCORE_THRESHOLD = 10

export function evaluateContentQuality(
  selectorContent: string,
  readabilityContent: string
): QualityEvaluation {
  const selectorScore = calculateScore(selectorContent)
  const readabilityScore = calculateScore(readabilityContent)

  debugLog("Content quality scores:", {
    selector: selectorScore,
    readability: readabilityScore
  })

  const scores = { selector: selectorScore, readability: readabilityScore }

  if (readabilityScore > selectorScore + SCORE_THRESHOLD) {
    return {
      betterContent: readabilityContent,
      reason: `Readability quality higher (${readabilityScore} vs ${selectorScore})`,
      scores
    }
  }

  if (selectorScore > readabilityScore + SCORE_THRESHOLD) {
    return {
      betterContent: selectorContent,
      reason: `Selector quality higher (${selectorScore} vs ${readabilityScore})`,
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
