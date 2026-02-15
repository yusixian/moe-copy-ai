import { wrap } from "comlink"

import type { ScrapeWorkerApi } from "./scrape-worker"

let workerInstance: Worker | null = null
let workerApi: ReturnType<typeof wrap<ScrapeWorkerApi>> | null = null

function createWorker(): ReturnType<typeof wrap<ScrapeWorkerApi>> {
  const worker = new Worker(new URL("./scrape-worker.ts", import.meta.url), {
    type: "module"
  })

  workerInstance = worker
  return wrap<ScrapeWorkerApi>(worker)
}

export function getScrapeWorker(): ReturnType<typeof wrap<ScrapeWorkerApi>> {
  if (!workerApi) {
    workerApi = createWorker()
  }
  return workerApi
}

export function terminateScrapeWorker(): void {
  if (workerInstance) {
    workerInstance.terminate()
    workerInstance = null
    workerApi = null
  }
}
