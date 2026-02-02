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

import type { ExtractorOptions } from "../../constants/types"

type DoneEvent<T> = { type: "done"; data: T }
type ErrorEvent = { type: "error"; error: unknown }

export type ScrapePipelineContext<T> = {
  options: ExtractorOptions
  base: T
  result?: T
  error?: unknown
}

export type ScrapePipelineActions<T> = {
  selector: (context: ScrapePipelineContext<T>) => Promise<T>
  readability: (context: ScrapePipelineContext<T>) => Promise<T>
  hybrid: (context: ScrapePipelineContext<T>) => Promise<T>
  selectorFallback: (context: ScrapePipelineContext<T>) => Promise<T>
  finalize: (context: ScrapePipelineContext<T>) => Promise<T>
}

export type ScrapePipelineResult<T> = {
  status: "success" | "failed"
  result?: T
  error?: unknown
}

// Reducer factories to eliminate repetitive callback definitions
const setResult = <T>() =>
  reduce(
    (ctx: ScrapePipelineContext<T>, event: DoneEvent<T>) =>
      ({ ...ctx, result: event.data }) as ScrapePipelineContext<T>
  )

const setError = <T>() =>
  reduce(
    (ctx: ScrapePipelineContext<T>, event: ErrorEvent) =>
      ({ ...ctx, error: event.error }) as ScrapePipelineContext<T>
  )

// Reusable state builder for invoke states with standard done/error transitions
function invokeState<T>(
  action: (ctx: ScrapePipelineContext<T>) => Promise<T>,
  successTarget: string,
  errorTarget: string
) {
  return invoke(
    action,
    transition("done", successTarget, setResult<T>()),
    transition("error", errorTarget, setError<T>())
  )
}

export async function runScrapePipeline<T>(
  initialContext: ScrapePipelineContext<T>,
  actions: ScrapePipelineActions<T>
): Promise<ScrapePipelineResult<T>> {
  const modeGuard = (mode: string) =>
    guard((ctx: ScrapePipelineContext<T>) => ctx.options.mode === mode)

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
    (ctx: ScrapePipelineContext<T>) => ctx
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
