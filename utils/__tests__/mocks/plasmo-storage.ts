/**
 * Shared mock for @plasmohq/storage
 * Centralized mock definition to avoid duplication across test files
 */

// Shared stores for all MockStorage instances
const syncStore = new Map<string, unknown>()
const localStore = new Map<string, unknown>()

export class MockStorage {
  private store: Map<string, unknown>

  constructor(options?: { area?: "sync" | "local" }) {
    // Use the appropriate shared store based on area
    this.store = options?.area === "local" ? localStore : syncStore
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value)
  }

  async setMany(items: Record<string, unknown>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      this.store.set(key, value)
    }
  }

  watch(): () => void {
    return () => {}
  }

  clear(): void {
    this.store.clear()
  }

  /** Get current store size (for testing) */
  get size(): number {
    return this.store.size
  }
}

/**
 * Reset all mock storage instances
 * Call this in beforeEach/afterEach to ensure test isolation
 */
export function resetMockStorage(): void {
  syncStore.clear()
  localStore.clear()
}

/**
 * Create the mock factory for vi.mock("@plasmohq/storage", ...)
 * Usage: vi.mock("@plasmohq/storage", () => createPlasmoStorageMock())
 */
export function createPlasmoStorageMock() {
  return {
    Storage: MockStorage
  }
}

// Legacy exports for backwards compatibility
export function getMockSyncStorage(): MockStorage {
  return new MockStorage({ area: "sync" })
}

export function getMockLocalStorage(): MockStorage {
  return new MockStorage({ area: "local" })
}
