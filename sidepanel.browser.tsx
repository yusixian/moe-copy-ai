import { beforeAll, expect, test, vi } from "vitest"
import { render } from "vitest-browser-react"

vi.mock("~components/batch/BatchScrapePanel", () => ({
  default: function MockBatchScrapePanel() {
    return <div>BatchScrapePanel</div>
  }
}))

vi.mock("~components/extraction/ContentExtractionPanel", () => ({
  default: function MockContentExtractionPanel() {
    return <div>ContentExtractionPanel</div>
  }
}))

vi.mock("~components/singlescrape/SingleScrapePanel", () => ({
  default: function MockSingleScrapePanel() {
    return <div>SingleScrapePanel</div>
  }
}))

vi.mock("~components/sidepanel/SidePanelSettings", () => ({
  default: function MockSidePanelSettings() {
    return <div>SidePanelSettings</div>
  }
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

const createMockStorage = () => {
  const store = new Map<string, unknown>()

  return {
    get: vi.fn(async (key: string) => store.get(key)),
    set: vi.fn(async (key: string, value: unknown) => {
      store.set(key, value)
    }),
    setMany: vi.fn(async (items: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(items)) {
        store.set(key, value)
      }
    }),
    clear: vi.fn(() => {
      store.clear()
    }),
    watch: vi.fn().mockReturnValue(true),
    unwatch: vi.fn()
  }
}

vi.mock("~utils/storage", () => ({
  syncStorage: createMockStorage(),
  localStorage: createMockStorage()
}))

beforeAll(() => {
  const chrome = {
    runtime: {
      getManifest: () => ({ version: "0.0.0" })
    },
    i18n: {
      getUILanguage: () => "en-US"
    }
  }

  Object.assign(globalThis, { chrome })
})

async function renderSidePanel() {
  const { default: SidePanel } = await import("./sidepanel")
  return render(<SidePanel />)
}

test("renders single scrape view by default", async () => {
  const screen = (await renderSidePanel()) as Awaited<
    ReturnType<typeof renderSidePanel>
  > & {
    getByRole: (...args: any[]) => any
    getByText: (...args: any[]) => any
    getByTitle: (...args: any[]) => any
  }

  await expect
    .element(screen.getByRole("heading", { name: "Scrape" }))
    .toBeVisible()
  await expect.element(screen.getByText("SingleScrapePanel")).toBeVisible()
})

test("switches to batch view", async () => {
  const screen = (await renderSidePanel()) as Awaited<
    ReturnType<typeof renderSidePanel>
  > & {
    getByRole: (...args: any[]) => any
    getByText: (...args: any[]) => any
    getByTitle: (...args: any[]) => any
  }

  await expect
    .element(screen.getByRole("heading", { name: "Scrape" }))
    .toBeVisible()
  await screen.getByText("Batch").click()

  await expect
    .element(screen.getByRole("heading", { name: "Batch" }))
    .toBeVisible()
  await expect.element(screen.getByText("BatchScrapePanel")).toBeVisible()
})

test("switches to settings view via the gear button", async () => {
  const screen = (await renderSidePanel()) as Awaited<
    ReturnType<typeof renderSidePanel>
  > & {
    getByRole: (...args: any[]) => any
    getByText: (...args: any[]) => any
    getByTitle: (...args: any[]) => any
  }

  await expect
    .element(screen.getByRole("heading", { name: "Scrape" }))
    .toBeVisible()
  await screen.getByTitle("Settings").click()

  await expect
    .element(screen.getByRole("heading", { name: "Settings" }))
    .toBeVisible()
  await expect.element(screen.getByText("SidePanelSettings")).toBeVisible()
})
