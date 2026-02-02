import { beforeAll, beforeEach, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"

import {
  createPlasmoStorageMock,
  MockStorage,
  resetMockStorage
} from "~utils/__tests__/mocks"

vi.mock("@plasmohq/storage", () => createPlasmoStorageMock())

vi.mock("~components/batch/BatchScrapePanel", () => ({
  default: () => <div>BatchScrapePanel</div>
}))

vi.mock("~components/extraction/ContentExtractionPanel", () => ({
  default: () => <div>ContentExtractionPanel</div>
}))

vi.mock("~components/singlescrape/SingleScrapePanel", () => ({
  default: () => <div>SingleScrapePanel</div>
}))

vi.mock("~components/sidepanel/SidePanelSettings", () => ({
  default: () => <div>SidePanelSettings</div>
}))

vi.mock("~hooks/useBatchScrape", () => ({
  default: () => ({
    mode: "idle",
    elementInfo: null,
    links: [],
    progress: null,
    results: [],
    error: null,
    paginationProgress: null,
    setLinks: vi.fn(),
    addLink: vi.fn(),
    updateLink: vi.fn(),
    removeLink: vi.fn(),
    startScrape: vi.fn(),
    pauseScrape: vi.fn(),
    resumeScrape: vi.fn(),
    cancelScrape: vi.fn(),
    reset: vi.fn()
  })
}))

vi.mock("~hooks/useContentExtraction", () => ({
  default: () => ({
    mode: "idle",
    content: null,
    elementInfo: null,
    error: null,
    tabInfo: null,
    startSelection: vi.fn(),
    cancelSelection: vi.fn(),
    reset: vi.fn()
  })
}))

vi.mock("~hooks/useElementSelector", () => ({
  default: () => ({
    isSelecting: false,
    elementInfo: null,
    extractedLinks: [],
    nextPageButton: null,
    activateSelector: vi.fn(),
    deactivateSelector: vi.fn(),
    clearSelection: vi.fn(),
    clearNextPageButton: vi.fn()
  })
}))

vi.mock("~utils/storage", () => ({
  syncStorage: new MockStorage({ area: "sync" }),
  localStorage: new MockStorage({ area: "local" })
}))

beforeAll(() => {
  Object.assign(globalThis, {
    chrome: {
      runtime: { getManifest: () => ({ version: "0.0.0" }) },
      i18n: { getUILanguage: () => "en-US" }
    }
  })
})

beforeEach(() => {
  resetMockStorage()
})

async function renderSidePanel() {
  const { default: SidePanel } = await import("./sidepanel")
  return render(<SidePanel />)
}

test("renders single scrape view by default", async () => {
  const { locator } = await renderSidePanel()

  await expect
    .element(locator.getByRole("heading", { name: "Scrape" }))
    .toBeVisible()
  await expect.element(locator.getByText("SingleScrapePanel")).toBeVisible()
})

test("switches to batch view", async () => {
  const { locator } = await renderSidePanel()

  await expect
    .element(locator.getByRole("heading", { name: "Scrape" }))
    .toBeVisible()
  await locator.getByText("Batch").click()

  await expect
    .element(locator.getByRole("heading", { name: "Batch" }))
    .toBeVisible()
  await expect.element(locator.getByText("BatchScrapePanel")).toBeVisible()
})

test("switches to settings view via the gear button", async () => {
  const { locator } = await renderSidePanel()

  await expect
    .element(locator.getByRole("heading", { name: "Scrape" }))
    .toBeVisible()
  await locator.getByTitle("Settings").click()

  await expect
    .element(locator.getByRole("heading", { name: "Settings" }))
    .toBeVisible()
  await expect.element(locator.getByText("SidePanelSettings")).toBeVisible()
})
