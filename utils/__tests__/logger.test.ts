import pino from "pino"

// 模拟chrome API
const mockChrome = {
  runtime: {
    getManifest: jest.fn().mockReturnValue({})
  }
}

// 存储原始process.env
const originalEnv = process.env

// 保存传输函数
let transmitSendFunction: Function | null = null

// 创建pino实例mock
const mockPinoInstance = {
  level: "debug",
  levelVal: 20, // debug level value in pino
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn()
}

// Watch回调函数
let watchCallback: Function | null = null

// 模拟Storage
const mockStorage = {
  get: jest.fn().mockResolvedValue("debug"),
  set: jest.fn(),
  watch: jest.fn().mockImplementation((config) => {
    if (config && config.log_level) {
      watchCallback = config.log_level
    }
    return jest.fn()
  })
}

// 模拟pino
jest.mock("pino", () => {
  const mockPino = jest.fn().mockImplementation((options) => {
    if (options && options.browser && options.browser.transmit) {
      transmitSendFunction = options.browser.transmit.send
    }
    mockPinoInstance.level = options.level || "info"
    // Set levelVal based on level
    switch (options.level) {
      case "debug":
        mockPinoInstance.levelVal = 20
        break
      case "info":
        mockPinoInstance.levelVal = 30
        break
      case "warn":
        mockPinoInstance.levelVal = 40
        break
      case "error":
        mockPinoInstance.levelVal = 50
        break
      case "silent":
        mockPinoInstance.levelVal = Infinity
        break
      default:
        mockPinoInstance.levelVal = 30 // default to info
    }
    return mockPinoInstance
  })
  return mockPino
})

// 模拟Storage
jest.mock("@plasmohq/storage", () => {
  return {
    Storage: jest.fn().mockImplementation(() => mockStorage)
  }
})

describe("logger", () => {
  let logger: any
  let debugLog: any
  let isDevelopment: any

  beforeAll(() => {
    // 设置全局chrome对象
    global.chrome = mockChrome as unknown as typeof chrome

    // 保存原始console方法
    const originalConsole = { ...console }

    // 模拟console方法
    global.console = {
      ...originalConsole,
      debug: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    }

    // 导入模块
    const loggerModule = require("../logger")
    logger = loggerModule.logger
    debugLog = loggerModule.debugLog
    isDevelopment = loggerModule.isDevelopment
  })

  beforeEach(() => {
    jest.clearAllMocks()

    // 重置process.env
    process.env = { ...originalEnv }
    
    // 确保mockPinoInstance在开发环境下允许debug输出
    mockPinoInstance.levelVal = 20 // debug level
  })

  afterEach(() => {
    // 恢复process.env
    process.env = originalEnv
  })

  describe("isDevelopment函数", () => {
    test("当NODE_ENV为development时应返回true", () => {
      process.env.NODE_ENV = "development"
      expect(isDevelopment()).toBe(true)
    })

    test("当没有update_url时应返回true", () => {
      process.env.NODE_ENV = "production"
      global.chrome.runtime.getManifest = jest.fn().mockReturnValue({})
      expect(isDevelopment()).toBe(true)
    })

    test("当有update_url时应返回false", () => {
      process.env.NODE_ENV = "production"
      global.chrome.runtime.getManifest = jest.fn().mockReturnValue({
        update_url: "https://example.com/update.xml"
      })
      expect(isDevelopment()).toBe(false)
    })
  })

  describe("debugLog函数", () => {
    test("在debug级别下应调用logger.debug", () => {
      // 设置debug级别
      mockPinoInstance.levelVal = 20
      
      debugLog("测试消息")
      expect(mockPinoInstance.debug).toHaveBeenCalledWith("测试消息")
    })

    test("带有多个参数时应正确调用logger.debug", () => {
      // 设置debug级别
      mockPinoInstance.levelVal = 20
      
      const data = { test: "value" }
      debugLog("测试消息", data)
      expect(mockPinoInstance.debug).toHaveBeenCalledWith("测试消息", data)
    })

    test("在silent级别下不应调用logger.debug", () => {
      // 设置silent级别 (Infinity)
      mockPinoInstance.levelVal = Infinity
      
      jest.clearAllMocks()
      debugLog("测试消息")
      expect(mockPinoInstance.debug).not.toHaveBeenCalled()
    })
  })

  describe("Pino配置", () => {
    test("应正确配置pino实例", () => {
      jest.isolateModules(() => {
        // 清除之前的模拟调用
        jest.clearAllMocks()

        // 重新导入模块以触发pino调用
        require("../logger")

        expect(pino).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "moe-copy-ai",
            browser: expect.objectContaining({
              asObject: true,
              serialize: true
            })
          })
        )
      })
    })

    test("应使用默认的silent日志级别", () => {
      jest.isolateModules(() => {
        // 重置
        jest.clearAllMocks()

        // 设置生产环境
        process.env.NODE_ENV = "production"
        global.chrome.runtime.getManifest = jest.fn().mockReturnValue({
          update_url: "https://example.com/update.xml"
        })

        // 重新导入模块
        require("../logger")

        // 检查pino是否被正确调用
        expect(pino).toHaveBeenCalledWith(
          expect.objectContaining({
            level: "silent"
          })
        )
      })
    })

    test("当storage.get抛出异常时应返回默认日志级别", async () => {
      // 使用Promise确保异步操作完成
      return new Promise<void>((resolve) => {
        jest.isolateModules(async () => {
          // 清除之前的模拟调用
          jest.clearAllMocks()

          // 模拟storage.get抛出异常
          mockStorage.get.mockRejectedValueOnce(new Error("存储错误"))

          // 设置开发环境
          process.env.NODE_ENV = "development"
          global.chrome.runtime.getManifest = jest.fn().mockReturnValue({})

          // 重新导入模块
          require("../logger")

          // 等待异步操作完成
          await new Promise((resolve) => setTimeout(resolve, 100))

          // 验证console.error被调用
          expect(console.error).toHaveBeenCalledWith(
            "获取日志级别失败:",
            expect.any(Error)
          )

          resolve()
        })
      })
    })
  })

  describe("日志级别监听", () => {
    test("应在日志级别变化时更新logger.level", () => {
      // 检查回调是否被保存
      expect(watchCallback).toBeDefined()
      expect(typeof watchCallback).toBe("function")

      if (watchCallback) {
        // 调用回调
        watchCallback({ newValue: "info" })

        // 验证级别被更新
        expect(mockPinoInstance.level).toBe("info")
        expect(mockPinoInstance.debug).toHaveBeenCalledWith(
          "日志级别已更新为: info"
        )
      }
    })

    test("空值不应更新日志级别", () => {
      // 重置
      jest.clearAllMocks()
      mockPinoInstance.level = "debug"

      // 检查回调是否被保存
      expect(watchCallback).toBeDefined()

      if (watchCallback) {
        // 调用回调
        watchCallback({ newValue: null })

        // 验证debug未被调用
        expect(mockPinoInstance.debug).not.toHaveBeenCalled()
      }
    })
  })

  describe("transmit.send函数", () => {
    test("应处理各种日志级别", () => {
      // 验证传输函数被保存
      expect(transmitSendFunction).toBeDefined()
      expect(typeof transmitSendFunction).toBe("function")

      if (transmitSendFunction) {
        // 准备测试数据
        const testLogEvent = {
          ts: new Date().getTime(),
          messages: ["测试消息"]
        }

        // 测试各种日志级别
        const levels = ["debug", "info", "warn", "error", "fatal", "trace"]

        levels.forEach((level) => {
          // 重置模拟
          jest.clearAllMocks()

          // 调用传输函数
          transmitSendFunction(level, testLogEvent)

          // 确定期望的console方法
          let expectedMethod
          switch (level) {
            case "debug":
              expectedMethod = "debug"
              break
            case "info":
              expectedMethod = "log"
              break
            case "warn":
              expectedMethod = "warn"
              break
            case "error":
            case "fatal":
              expectedMethod = "error"
              break
            default:
              expectedMethod = "log"
          }

          // 验证正确的console方法被调用
          expect(console[expectedMethod]).toHaveBeenCalled()
        })
      }
    })

    test("应处理额外的日志数据", () => {
      expect(typeof transmitSendFunction).toBe("function")

      if (transmitSendFunction) {
        // 准备测试数据
        const extraData = { userId: 123, action: "测试" }
        const testLogEvent = {
          ts: new Date().getTime(),
          messages: ["用户活动", extraData]
        }

        // 重置console模拟
        jest.clearAllMocks()

        // 调用传输函数
        transmitSendFunction("info", testLogEvent)

        // 验证额外数据被输出
        expect(console.log).toHaveBeenCalledTimes(2)
        expect(console.log).toHaveBeenNthCalledWith(2, extraData)
      }
    })
  })
})
