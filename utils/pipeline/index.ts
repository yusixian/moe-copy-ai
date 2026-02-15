export {
  type AspectContext,
  createDebugLogAspect,
  type PipelineAspect,
  withAspects
} from "./aspects"
export {
  cloneScrapedContent,
  createBaseScrapedContent,
  finalizeScrapedContent,
  getErrorMessage
} from "./content-factory"
export {
  runScrapePipeline,
  type ScrapePipelineActions,
  type ScrapePipelineContext,
  type ScrapePipelineResult
} from "./machine"
export { buildScrapeActions, type SelectorScraper } from "./strategies"
