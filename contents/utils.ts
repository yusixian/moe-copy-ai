// 导入pino和存储API
import pino, { type LevelWithSilentOrString } from "pino"

import { Storage } from "@plasmohq/storage"

// 定义日志对象类型
interface LogObject {
  time: number
  msg: string
  level: number
  args?: any[]
  [key: string]: any
}

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
    return level || (isDevelopment() ? "debug" : "error")
  } catch (err) {
    console.error("获取日志级别失败:", err)
    return isDevelopment() ? "debug" : "error"
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
  level: isDevelopment() ? "debug" : "error", // 初始默认值，后续会更新
  browser: {
    serialize: true, // 序列化对象
    write: {
      // 自定义日志格式，使其在控制台中更易识别
      debug: (o: LogObject) => {
        const time = new Date(o.time).toLocaleTimeString()
        console.log(
          `%c[萌抓✿]%c[DEBUG]%c[${time}] ${o.msg}`,
          "color:#ff9ed8;font-weight:bold",
          "color:#8e8e8e;font-weight:normal",
          "color:inherit",
          ...(o.args || [])
        )
      },
      info: (o: LogObject) => {
        const time = new Date(o.time).toLocaleTimeString()
        console.log(
          `%c[萌抓✿]%c[INFO]%c[${time}] ${o.msg}`,
          "color:#ff9ed8;font-weight:bold",
          "color:#36a3ff;font-weight:bold",
          "color:inherit",
          ...(o.args || [])
        )
      },
      warn: (o: LogObject) => {
        const time = new Date(o.time).toLocaleTimeString()
        console.log(
          `%c[萌抓✿]%c[WARN]%c[${time}] ${o.msg}`,
          "color:#ff9ed8;font-weight:bold",
          "color:#ffb340;font-weight:bold",
          "color:inherit",
          ...(o.args || [])
        )
      },
      error: (o: LogObject) => {
        const time = new Date(o.time).toLocaleTimeString()
        console.error(
          `%c[萌抓✿]%c[ERROR]%c[${time}] ${o.msg}`,
          "color:#ff9ed8;font-weight:bold",
          "color:#ff6259;font-weight:bold",
          "color:inherit",
          ...(o.args || [])
        )
      },
      fatal: (o: LogObject) => {
        const time = new Date(o.time).toLocaleTimeString()
        console.error(
          `%c[萌抓✿]%c[FATAL]%c[${time}] ${o.msg}`,
          "color:#ff9ed8;font-weight:bold",
          "color:white;background-color:#ff4040;font-weight:bold",
          "color:inherit",
          ...(o.args || [])
        )
      }
    }
  }
})

// 初始化：从存储中获取日志级别并应用
getLogLevel().then((level: LevelWithSilentOrString) => {
  logger.level = level
  logger.debug(`日志级别已设置为: ${level}`)
})

// 监听日志级别变化
storage.watch({
  log_level: (change) => {
    const newLevel = change.newValue as LevelWithSilentOrString
    if (newLevel) {
      logger.level = newLevel
      logger.debug(`日志级别已更新为: ${newLevel}`)
    }
  }
})

// 增强的日志输出，兼容旧代码
export function debugLog(...args: any[]): void {
  if (isDevelopment()) {
    // 如果只有一个参数（消息），直接记录
    if (args.length === 1) {
      logger.debug(args[0])
    } else {
      // 提取第一个参数作为消息，其余作为对象数据
      const msg = args[0]
      // 将剩余参数作为单个对象传递，而不是作为data属性
      const restData = args.length > 1 ? args.slice(1) : []

      // 直接传递消息和数据，而不是嵌套在data对象中
      logger.debug(msg, ...restData)
    }
  }
}

// 从元素中获取属性或文本内容
export function getElementContent(
  element: Element,
  attributeName?: string
): string {
  if (!element) return ""

  if (attributeName) {
    return element.getAttribute(attributeName) || ""
  }

  return element.textContent?.trim() || ""
}

// 使用选择器获取元素内容
export function getContentBySelector(
  selector: string,
  attributeName?: string
): string {
  const element = document.querySelector(selector)
  if (!element) return ""

  return getElementContent(element, attributeName)
}

// 从选择器列表中获取第一个匹配的内容
export function getFirstMatchContent(
  selectors: string[],
  getContentFn: (el: Element) => string
): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) {
      const content = getContentFn(element)
      if (content) {
        debugLog(`从${selector}获取内容:`, content)
        return content
      }
    }
  }
  return ""
}
