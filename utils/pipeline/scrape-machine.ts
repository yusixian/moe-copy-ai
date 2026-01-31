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
  selectorFallbackFromReadability: (
    context: ScrapePipelineContext<T>,
    event?: ErrorEvent
  ) => Promise<T>
  selectorFallbackFromHybrid: (
    context: ScrapePipelineContext<T>,
    event?: ErrorEvent
  ) => Promise<T>
  finalize: (context: ScrapePipelineContext<T>) => Promise<T>
}

export type ScrapePipelineResult<T> = {
  status: "success" | "failed"
  result?: T
  error?: unknown
}

export async function runScrapePipeline<T>(
  initialContext: ScrapePipelineContext<T>,
  actions: ScrapePipelineActions<T>
): Promise<ScrapePipelineResult<T>> {
  const machine = createMachine(
    "modeSelect",
    {
      modeSelect: state(
        immediate(
          "selector",
          guard(
            (ctx: ScrapePipelineContext<T>) => ctx.options.mode === "selector"
          )
        ),
        immediate(
          "readability",
          guard(
            (ctx: ScrapePipelineContext<T>) =>
              ctx.options.mode === "readability"
          )
        ),
        immediate(
          "hybrid",
          guard(
            (ctx: ScrapePipelineContext<T>) => ctx.options.mode === "hybrid"
          )
        )
      ),
      selector: invoke(
        actions.selector,
        transition(
          "done",
          "finalize",
          reduce((ctx: ScrapePipelineContext<T>, event: DoneEvent<T>) => ({
            ...ctx,
            result: event.data
          }))
        ),
        transition(
          "error",
          "failed",
          reduce((ctx: ScrapePipelineContext<T>, event: ErrorEvent) => ({
            ...ctx,
            error: event.error
          }))
        )
      ),
      readability: invoke(
        actions.readability,
        transition(
          "done",
          "finalize",
          reduce((ctx: ScrapePipelineContext<T>, event: DoneEvent<T>) => ({
            ...ctx,
            result: event.data
          }))
        ),
        transition(
          "error",
          "readabilityFallback",
          reduce((ctx: ScrapePipelineContext<T>, event: ErrorEvent) => ({
            ...ctx,
            error: event.error
          }))
        )
      ),
      readabilityFallback: invoke(
        actions.selectorFallbackFromReadability,
        transition(
          "done",
          "finalize",
          reduce((ctx: ScrapePipelineContext<T>, event: DoneEvent<T>) => ({
            ...ctx,
            result: event.data
          }))
        ),
        transition(
          "error",
          "failed",
          reduce((ctx: ScrapePipelineContext<T>, event: ErrorEvent) => ({
            ...ctx,
            error: event.error
          }))
        )
      ),
      hybrid: invoke(
        actions.hybrid,
        transition(
          "done",
          "finalize",
          reduce((ctx: ScrapePipelineContext<T>, event: DoneEvent<T>) => ({
            ...ctx,
            result: event.data
          }))
        ),
        transition(
          "error",
          "hybridFallback",
          reduce((ctx: ScrapePipelineContext<T>, event: ErrorEvent) => ({
            ...ctx,
            error: event.error
          }))
        )
      ),
      hybridFallback: invoke(
        actions.selectorFallbackFromHybrid,
        transition(
          "done",
          "finalize",
          reduce((ctx: ScrapePipelineContext<T>, event: DoneEvent<T>) => ({
            ...ctx,
            result: event.data
          }))
        ),
        transition(
          "error",
          "failed",
          reduce((ctx: ScrapePipelineContext<T>, event: ErrorEvent) => ({
            ...ctx,
            error: event.error
          }))
        )
      ),
      finalize: invoke(
        actions.finalize,
        transition(
          "done",
          "success",
          reduce((ctx: ScrapePipelineContext<T>, event: DoneEvent<T>) => ({
            ...ctx,
            result: event.data
          }))
        ),
        transition(
          "error",
          "failed",
          reduce((ctx: ScrapePipelineContext<T>, event: ErrorEvent) => ({
            ...ctx,
            error: event.error
          }))
        )
      ),
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
