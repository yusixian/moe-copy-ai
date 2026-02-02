// Facade for backwards compatibility
// All functionality now in ./readability.ts (deep module)
export {
  convertHtmlToMarkdown,
  type ExtractionResult,
  evaluateContentQuality,
  extractImagesFromMarkdown,
  extractWithReadability,
  type QualityEvaluation
} from "./readability"
