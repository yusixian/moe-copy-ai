// 扩展Jest的expect
// expect.extend({
//   // 添加自定义匹配器（如果需要）
// })

// 模拟window.location
Object.defineProperty(window, "location", {
  value: {
    href: "https://example.com/test-page",
    pathname: "/test-page",
    origin: "https://example.com",
    protocol: "https:",
    host: "example.com",
    hostname: "example.com",
    port: "",
    search: "",
    hash: ""
  },
  writable: true
})

// 模拟Storage类
jest.mock("@plasmohq/storage", () => {
  return {
    Storage: jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      watch: jest.fn()
    }))
  }
})

// 模拟chrome API（如果测试中需要）
global.chrome = {
  runtime: {
    getManifest: jest.fn().mockReturnValue({})
  }
}

// 在测试中隐藏console.log等输出
// global.console = {
//   ...console,
//   log: jest.fn(),
//   info: jest.fn(),
//   debug: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn()
// };
