import { debugLog } from "../logger"
import type { QualityEvaluation } from "./quality-core"
import { evaluateContentQualityCore } from "./quality-core"

export type { QualityEvaluation } from "./quality-core"

export function evaluateContentQuality(
  selectorContent: string,
  readabilityContent: string
): QualityEvaluation {
  const result = evaluateContentQualityCore(selectorContent, readabilityContent)

  debugLog("Content quality scores:", result.scores)

  return result
}
