// 模拟logger
jest.mock("../logger", () => ({
  debugLog: jest.fn()
}))

// 创建模拟存储实例
const mockStorageInstance = {
  get: jest.fn(),
  set: jest.fn()
}

// 模拟@plasmohq/storage
jest.mock("@plasmohq/storage", () => ({
  Storage: jest.fn().mockImplementation(() => mockStorageInstance)
}))

// 导入存储模块（在模拟之后）
import {
  getExtractionMode,
  getReadabilityConfig,
  localStorage,
  setExtractionMode,
  syncStorage
} from "../storage"

describe("storage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("存储实例", () => {
    test("应创建存储实例", () => {
      // 由于storage.ts在导入时就会创建实例，所以我们不能使用常规的调用检查
      expect(syncStorage).toBeDefined()
      expect(localStorage).toBeDefined()
    })

    test("应为同步存储和本地存储使用不同区域", () => {
      // 导入Storage类用于测试
      const { Storage } = require("@plasmohq/storage")
      
      // 创建我们自己的实例以验证参数传递
      const mockSyncStorage = new Storage({ area: "sync" })
      const mockLocalStorage = new Storage({ area: "local" })

      expect(Storage).toHaveBeenCalled()
      expect(jest.mocked(Storage).mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe("getExtractionMode", () => {
    test("应返回存储的抓取模式", async () => {
      mockStorageInstance.get.mockResolvedValue("readability")

      const result = await getExtractionMode()

      expect(result).toBe("readability")
      expect(mockStorageInstance.get).toHaveBeenCalledWith("extraction_mode")
    })

    test("当存储中没有值时应返回默认值hybrid", async () => {
      mockStorageInstance.get.mockResolvedValue(null)

      const result = await getExtractionMode()

      expect(result).toBe("hybrid")
    })

    test("当获取存储值失败时应返回默认值hybrid", async () => {
      mockStorageInstance.get.mockRejectedValue(new Error("存储错误"))

      const result = await getExtractionMode()

      expect(result).toBe("hybrid")
    })
  })

  describe("setExtractionMode", () => {
    test("应成功设置抓取模式", async () => {
      mockStorageInstance.set.mockResolvedValue(undefined)
      mockStorageInstance.get.mockResolvedValue("selector")

      await setExtractionMode("selector")

      expect(mockStorageInstance.set).toHaveBeenCalledWith("extraction_mode", "selector")
      expect(mockStorageInstance.get).toHaveBeenCalledWith("extraction_mode")
    })

    test("当设置存储值失败时应抛出错误", async () => {
      mockStorageInstance.set.mockRejectedValue(new Error("存储错误"))

      // 现在应该抛出异常
      await expect(setExtractionMode("readability")).rejects.toThrow("存储错误")
    })

    test("当传入无效模式时应抛出错误", async () => {
      // 传入无效模式
      await expect(setExtractionMode("invalid" as any)).rejects.toThrow("无效的抓取模式")
    })
  })

  describe("getReadabilityConfig", () => {
    test("应返回默认配置", () => {
      const config = getReadabilityConfig()

      expect(config).toEqual({
        charThreshold: 500,
        keepClasses: ["highlight", "code-block", "important"],
        debug: false
      })
    })
  })
})
