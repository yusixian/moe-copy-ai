import type { LocatorSelectors } from "@vitest/browser"

declare module "vitest-browser-react" {
  interface RenderResult extends LocatorSelectors {}
}

export {}
