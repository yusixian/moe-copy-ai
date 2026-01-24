import { useCallback, useState } from "react"

import { logger } from "~utils/logger"

/**
 * Hook for managing debug log state
 * Reusable across different components for debugging purposes
 */
export function useDebugLog() {
  const [debugInfo, setDebugInfo] = useState<string>("")

  const addDebugInfo = useCallback((info: string) => {
    logger.debug(info)
    setDebugInfo((prev) => prev + (prev ? "\n" : "") + info)
  }, [])

  const clearDebugInfo = useCallback(() => {
    setDebugInfo("")
  }, [])

  return {
    debugInfo,
    addDebugInfo,
    clearDebugInfo
  }
}

export default useDebugLog
