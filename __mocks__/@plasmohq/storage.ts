/**
 * Mock for @plasmohq/storage
 * Used in tests to avoid Chrome extension API dependencies
 */
export class Storage {
  private store = new Map<string, unknown>()

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key) as T | undefined
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value)
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key)
  }

  async clear(): Promise<void> {
    this.store.clear()
  }

  watch(_callback: (changes: Record<string, unknown>) => void): () => void {
    return () => {}
  }
}
