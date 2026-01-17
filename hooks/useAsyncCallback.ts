import { useCallback, useRef, useState } from "react"

interface UseAsyncCallbackOptions<T> {
  /** Called when the async operation succeeds */
  onSuccess?: (result: T) => void
  /** Called when the async operation fails */
  onError?: (error: Error) => void
  /** Called when the async operation completes (success or failure) */
  onSettled?: () => void
}

interface UseAsyncCallbackReturn<TArgs extends unknown[], TResult> {
  /** Execute the async callback */
  execute: (...args: TArgs) => Promise<TResult | undefined>
  /** Whether the async operation is in progress */
  isLoading: boolean
  /** Error from the last execution, if any */
  error: Error | null
  /** Reset the error state */
  reset: () => void
}

/**
 * A hook that wraps an async callback with loading and error state management.
 * Reduces boilerplate for common try/catch/finally patterns.
 *
 * Uses refs internally to avoid stale closure issues with callbacks.
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error } = useAsyncCallback(
 *   async (id: string) => {
 *     const data = await fetchData(id)
 *     return data
 *   },
 *   { onSuccess: (data) => console.log('Fetched:', data) }
 * )
 *
 * // Later:
 * await execute('123')
 * ```
 */
export function useAsyncCallback<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => Promise<TResult>,
  options: UseAsyncCallbackOptions<TResult> = {}
): UseAsyncCallbackReturn<TArgs, TResult> {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Use refs to avoid stale closure issues
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const optionsRef = useRef(options)
  optionsRef.current = options

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await callbackRef.current(...args)
        optionsRef.current.onSuccess?.(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        optionsRef.current.onError?.(error)
        return undefined
      } finally {
        setIsLoading(false)
        optionsRef.current.onSettled?.()
      }
    },
    []
  )

  const reset = useCallback(() => {
    setError(null)
  }, [])

  return { execute, isLoading, error, reset }
}

export default useAsyncCallback
