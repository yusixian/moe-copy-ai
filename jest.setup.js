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

// Mock CSS.escape for selector-generator tests (not available in jsdom)
if (!global.CSS) {
  global.CSS = {}
}
if (!global.CSS.escape) {
  global.CSS.escape = (value) => {
    // Simple polyfill for CSS.escape
    return value.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, "\\$&")
  }
}

// 在测试中过滤console输出
const originalError = console.error
const originalWarn = console.warn

// 过滤掉 React act() 警告和测试中预期的错误输出
console.error = (...args) => {
  // 忽略 React act() 警告
  if (
    typeof args[0] === "string" &&
    args[0].includes("Warning: An update to")
  ) {
    return
  }
  // 忽略测试中预期的错误日志
  if (
    typeof args[0] === "string" &&
    (args[0].includes("获取系统提示词失败") ||
      args[0].includes("摘要生成失败") ||
      args[0].includes("保存聊天历史记录失败") ||
      args[0].includes("抓取内容时出错") ||
      args[0].includes("Markdown 转换失败") ||
      args[0].includes("Failed to scrape"))
  ) {
    return
  }
  originalError.call(console, ...args)
}

console.warn = (...args) => {
  // 忽略所有 React 警告
  if (typeof args[0] === "string" && args[0].includes("Warning:")) {
    return
  }
  originalWarn.call(console, ...args)
}

// Mock JSZip for zip-exporter tests
jest.mock("jszip", () => {
  return jest.fn().mockImplementation(() => ({
    file: jest.fn(),
    folder: jest.fn().mockReturnValue({
      file: jest.fn()
    }),
    generateAsync: jest.fn().mockResolvedValue(new Blob())
  }))
})

// Mock @plasmohq/messaging for hooks tests
jest.mock("@plasmohq/messaging", () => ({
  sendToBackground: jest.fn()
}))

// Mock @plasmohq/storage/hook for hooks tests
jest.mock("@plasmohq/storage/hook", () => ({
  useStorage: jest.fn()
}))

// Mock react-toastify for hooks tests
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn()
  }
}))
