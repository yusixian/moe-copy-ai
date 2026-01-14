import { playwright } from "@vitest/browser-playwright"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    setupFiles: ["vitest.browser.setup.ts"],
    include: ["./**/*.browser.{ts,tsx}"],
    globals: true,
    browser: {
      enabled: true,
      headless: process.env.CI === "true",
      provider: playwright(),
      screenshotDirectory: "vitest-test-results",
      instances: [{ browser: "chromium" }]
    }
  }
})
