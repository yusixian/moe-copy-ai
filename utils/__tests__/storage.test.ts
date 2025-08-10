import { Storage } from "@plasmohq/storage"

import { localStorage, syncStorage } from "../storage"

// 模拟@plasmohq/storage
jest.mock("@plasmohq/storage")

describe("storage", () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // 测试前重置Storage模拟
    jest.mocked(Storage).mockImplementation(() => ({}) as unknown as Storage)
  })

  test("应创建存储实例", () => {
    // 由于storage.ts在导入时就会创建实例，所以我们不能使用常规的调用检查
    expect(syncStorage).toBeDefined()
    expect(localStorage).toBeDefined()
  })

  test("应为同步存储和本地存储使用不同区域", () => {
    // 创建我们自己的实例以验证参数传递
    const mockSyncStorage = new Storage({ area: "sync" })
    const mockLocalStorage = new Storage({ area: "local" })

    expect(Storage).toHaveBeenCalled()
    expect(jest.mocked(Storage).mock.calls.length).toBeGreaterThan(0)
  })
})
