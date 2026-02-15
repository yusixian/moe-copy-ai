export type AspectContext<TArgs extends unknown[]> = {
  name: string
  args: TArgs
  metadata: Record<string, unknown>
  startAt: number
}

export type PipelineAspect<TArgs extends unknown[], TResult> = {
  before?: (context: AspectContext<TArgs>) => void
  after?: (context: AspectContext<TArgs>, result: TResult) => void
  onError?: (context: AspectContext<TArgs>, error: unknown) => void
}

export function withAspects<TArgs extends unknown[], TResult>(
  name: string,
  fn: (...args: TArgs) => Promise<TResult>,
  aspects: Array<PipelineAspect<TArgs, TResult>>,
  metadataFactory?: (...args: TArgs) => Record<string, unknown>
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    const context: AspectContext<TArgs> = {
      name,
      args,
      metadata: metadataFactory ? metadataFactory(...args) : {},
      startAt: Date.now()
    }

    for (const aspect of aspects) {
      aspect.before?.(context)
    }

    try {
      const result = await fn(...args)
      context.metadata.durationMs = Date.now() - context.startAt
      for (const aspect of aspects) {
        aspect.after?.(context, result)
      }
      return result
    } catch (error) {
      context.metadata.durationMs = Date.now() - context.startAt
      for (const aspect of aspects) {
        aspect.onError?.(context, error)
      }
      throw error
    }
  }
}

export function createDebugLogAspect<TArgs extends unknown[], TResult>(
  log: (...args: unknown[]) => void
): PipelineAspect<TArgs, TResult> {
  return {
    before(context) {
      log(`[pipeline] start:${context.name}`, context.metadata)
    },
    after(context) {
      log(`[pipeline] done:${context.name}`, context.metadata)
    },
    onError(context, error) {
      log(`[pipeline] error:${context.name}`, context.metadata, error)
    }
  }
}
