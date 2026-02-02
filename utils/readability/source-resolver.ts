export type ReadabilitySource = Document | string | undefined

export type ResolvedReadabilitySource = {
  html: string
  baseUrl?: string
}

// 解析输入源为稳定的 HTML+baseUrl，对调用方隐藏环境差异（DOM/SSR）。
function getDefaultDocumentHtml(): string {
  if (typeof document !== "undefined") {
    return document.documentElement?.outerHTML || ""
  }
  return ""
}

function getDefaultBaseUrl(): string | undefined {
  if (typeof document !== "undefined") {
    return document.baseURI
  }
  if (typeof window !== "undefined") {
    return window.location.href
  }
  return undefined
}

export function resolveReadabilitySource(
  source?: ReadabilitySource,
  baseUrl?: string
): ResolvedReadabilitySource {
  if (typeof source === "string") {
    return { html: source, baseUrl }
  }

  if (source) {
    return {
      html: source.documentElement?.outerHTML || "",
      baseUrl: baseUrl || source.baseURI
    }
  }

  return {
    html: getDefaultDocumentHtml(),
    baseUrl: baseUrl || getDefaultBaseUrl()
  }
}
