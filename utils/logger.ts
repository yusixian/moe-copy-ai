// 导入pino和存储API
import pino from "pino"
import type { LevelWithSilentOrString } from "pino"

import { Storage } from "@plasmohq/storage"

// 创建存储实例
const storage = new Storage({ area: "sync" })

// 定义有效的日志级别类型
export type LogLevel =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal"
  | "silent"

// 获取存储的日志级别或返回默认值
async function getLogLevel(): Promise<LogLevel> {
  try {
    const level = await storage.get<LogLevel>("log_level")
    return level || "silent" // 总是默认使用silent，与UI设置保持一致
  } catch (err) {
    console.error("获取日志级别失败:", err)
    return "silent" // 出错时也使用silent
  }
}

// 判断浏览器是否处于开发模式
export function isDevelopment(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    !("update_url" in chrome.runtime.getManifest())
  )
}

// 创建pino日志实例（初始使用默认配置）
export const logger = pino({
  name: "moe-copy-ai",
  level: "silent", // 初始默认使用silent，与UI设置保持一致
  browser: {
    asObject: true, // 将日志作为对象传递给console方法，以便正确显示对象
    serialize: true, // 序列化对象
    transmit: {
      send: (level, logEvent) => {
        // 这个函数允许我们自定义如何处理日志事件
        const time = new Date(logEvent.ts).toLocaleTimeString()
        let levelColor = ""
        let methodName = ""

        // 根据日志级别设置颜色和方法
        switch (level) {
          case "debug":
            levelColor = "color:#8e8e8e;font-weight:normal"
            methodName = "debug"
            break
          case "info":
            levelColor = "color:#36a3ff;font-weight:bold"
            methodName = "log"
            break
          case "warn":
            levelColor = "color:#ffb340;font-weight:bold"
            methodName = "warn"
            break
          case "error":
            levelColor = "color:#ff6259;font-weight:bold"
            methodName = "error"
            break
          case "fatal":
            levelColor = "color:white;background-color:#ff4040;font-weight:bold"
            methodName = "error"
            break
          default:
            levelColor = "color:inherit"
            methodName = "log"
        }

        // 提取消息和其他数据
        const msg = logEvent.messages[0] || ""

        // 格式化日志标题
        console[methodName](
          `%c[萌抓✿]%c[${level.toUpperCase()}]%c[${time}] ${msg}`,
          "color:#ff9ed8;font-weight:bold",
          levelColor,
          "color:inherit"
        )

        // 如果有额外的数据，打印出来
        if (logEvent.messages.length > 1) {
          console[methodName](...logEvent.messages.slice(1))
        }
      }
    }
  }
})

// 初始化：从存储中获取日志级别并应用
getLogLevel().then((level: LevelWithSilentOrString) => {
  logger.level = level
  // 只在非silent模式下输出初始化日志
  if (level !== 'silent') {
    logger.debug(`日志级别已设置为: ${level}`)
  }
})

// 监听日志级别变化
storage.watch({
  log_level: (change) => {
    const newLevel = change.newValue as LevelWithSilentOrString
    if (newLevel) {
      logger.level = newLevel
      // 只在非silent模式下输出更新日志
      if (newLevel !== 'silent') {
        logger.debug(`日志级别已更新为: ${newLevel}`)
      }
    }
  }
})

// 增强的日志输出，兼容旧代码
export function debugLog(...args: any[]): void {
  // 检查当前日志级别是否允许debug输出
  // pino的level是数字，debug对应20，silent对应Infinity
  if (logger.levelVal <= 20) { // 20是debug级别的数值
    // 如果只有一个参数
    if (args.length === 1) {
      logger.debug(args[0])
    } else {
      // 多个参数时，第一个作为消息，其余作为数据
      logger.debug(args[0], ...args.slice(1))
    }
  }
}
