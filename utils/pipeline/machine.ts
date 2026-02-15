import {
  createMachine,
  guard,
  immediate,
  interpret,
  invoke,
  reduce,
  state,
  transition
} from "robot3"

import type { ExtractorOptions, ScrapedContent } from "../../constants/types"

type DoneEvent = { type: "done"; data: ScrapedContent }
type ErrorEvent = { type: "error"; error: unknown }

export type ScrapePipelineContext<T = ScrapedContent> = {
  options: ExtractorOptions
  base: T
  result?: T
  error?: unknown
}

export type ScrapePipelineActions = {
  selector: (context: ScrapePipelineContext) => Promise<ScrapedContent>
  readability: (context: ScrapePipelineContext) => Promise<ScrapedContent>
  hybrid: (context: ScrapePipelineContext) => Promise<ScrapedContent>
  selectorFallback: (context: ScrapePipelineContext) => Promise<ScrapedContent>
  finalize: (context: ScrapePipelineContext) => Promise<ScrapedContent>
}

export type ScrapePipelineResult = {
  status: "success" | "failed"
  result?: ScrapedContent
  error?: unknown
}

const setResult = () =>
  reduce(
    (ctx: ScrapePipelineContext, event: DoneEvent) =>
      ({ ...ctx, result: event.data }) as ScrapePipelineContext
  )

const setError = () =>
  reduce(
    (ctx: ScrapePipelineContext, event: ErrorEvent) =>
      ({ ...ctx, error: event.error }) as ScrapePipelineContext
  )

function invokeState(
  action: (ctx: ScrapePipelineContext) => Promise<ScrapedContent>,
  successTarget: string,
  errorTarget: string
) {
  return invoke(
    action,
    transition("done", successTarget, setResult()),
    transition("error", errorTarget, setError())
  )
}

export async function runScrapePipeline(
  initialContext: ScrapePipelineContext,
  actions: ScrapePipelineActions
): Promise<ScrapePipelineResult> {
  const modeGuard = (mode: string) =>
    guard((ctx: ScrapePipelineContext) => ctx.options.mode === mode)

  const machine = createMachine(
    "modeSelect",
    {
      modeSelect: state(
        immediate("selector", modeGuard("selector")),
        immediate("readability", modeGuard("readability")),
        immediate("hybrid", modeGuard("hybrid"))
      ),
      selector: invokeState(actions.selector, "finalize", "failed"),
      readability: invokeState(
        actions.readability,
        "finalize",
        "selectorFallback"
      ),
      hybrid: invokeState(actions.hybrid, "finalize", "selectorFallback"),
      selectorFallback: invokeState(
        actions.selectorFallback,
        "finalize",
        "failed"
      ),
      finalize: invokeState(actions.finalize, "success", "failed"),
      success: state(),
      failed: state()
    },
    (ctx: ScrapePipelineContext) => ctx
  )

  return await new Promise((resolve) => {
    interpret(
      machine,
      (service) => {
        if (service.machine.state.value.final) {
          resolve({
            status:
              service.machine.state.name === "success" ? "success" : "failed",
            result: service.context.result,
            error: service.context.error
          })
        }
      },
      initialContext
    )
  })
}
