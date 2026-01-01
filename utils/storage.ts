import { Storage } from "@plasmohq/storage"

import type { ExtractionMode } from "../constants/types"
import { debugLog } from "./logger"

// 创建存储实例 sync 有大小限制(通常每个项目不超过8KB，总大小约100KB）适合存储配置信息
// 如果需要存储大量数据，可以使用 local 存储
export const syncStorage = new Storage({ area: "sync" })
export const localStorage = new Storage({ area: "local" })

// 存储键定义
const STORAGE_KEYS = {
  EXTRACTION_MODE: "extraction_mode",
  READABILITY_CONFIG: "readability_config"
}

// 获取抓取模式
export async function getExtractionMode(): Promise<ExtractionMode> {
  try {
    const mode = await syncStorage.get<ExtractionMode>(
      STORAGE_KEYS.EXTRACTION_MODE
    )
    debugLog("从存储中获取抓取模式:", mode)
    // 确保返回有效的抓取模式，如果存储中的值无效则返回默认值
    const validModes: ExtractionMode[] = ["hybrid", "selector", "readability"]
    if (mode && validModes.includes(mode)) {
      return mode
    }
    debugLog("存储中的抓取模式无效或为空，使用默认值: hybrid")
    return "hybrid"
  } catch (error) {
    debugLog("获取抓取模式时出错:", error)
    return "hybrid"
  }
}

export function getReadabilityConfig() {
  return {
    charThreshold: 500,
    keepClasses: ["highlight", "code-block", "important"],
    debug: false
  }
}

// 设置抓取模式
export async function setExtractionMode(mode: ExtractionMode): Promise<void> {
  try {
    // 验证模式是否有效
    const validModes: ExtractionMode[] = ["hybrid", "selector", "readability"]
    if (!validModes.includes(mode)) {
      throw new Error(`无效的抓取模式: ${mode}`)
    }

    await syncStorage.set(STORAGE_KEYS.EXTRACTION_MODE, mode)
    debugLog("抓取模式已设置为:", mode)

    // 验证设置是否成功
    const savedMode = await syncStorage.get<ExtractionMode>(
      STORAGE_KEYS.EXTRACTION_MODE
    )
    if (savedMode !== mode) {
      debugLog("警告: 设置的抓取模式与保存的不一致", {
        expected: mode,
        actual: savedMode
      })
    }
  } catch (error) {
    debugLog("设置抓取模式时出错:", error)
    throw error // 重新抛出错误以便上层处理
  }
}
