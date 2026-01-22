import "vitest-browser-react"
import "@vitest/browser/matchers"

if (typeof globalThis.process === "undefined") {
  Object.assign(globalThis, { process: { env: {} } })
}
