/**
 * 链接过滤预设规则
 */

export type FilterTarget = "url" | "text" | "both"
export type FilterMode = "exclude" | "include"

export interface PresetFilter {
  id: string
  nameKey: string
  pattern: string
  target: FilterTarget
  mode: FilterMode
  descKey: string
}

export const LINK_FILTER_PRESETS: PresetFilter[] = [
  {
    id: "exclude-images",
    nameKey: "batch.filter.preset.excludeImages.name",
    pattern: "\\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|tiff)(\\?|$)",
    target: "url",
    mode: "exclude",
    descKey: "batch.filter.preset.excludeImages.desc"
  },
  {
    id: "exclude-anchors",
    nameKey: "batch.filter.preset.excludeAnchors.name",
    pattern: "^#|#[^/]*$",
    target: "url",
    mode: "exclude",
    descKey: "batch.filter.preset.excludeAnchors.desc"
  },
  {
    id: "exclude-pagination",
    nameKey: "batch.filter.preset.excludePagination.name",
    pattern: "[?&]page=|/page/\\d+",
    target: "url",
    mode: "exclude",
    descKey: "batch.filter.preset.excludePagination.desc"
  },
  {
    id: "exclude-auth",
    nameKey: "batch.filter.preset.excludeAuth.name",
    pattern: "login|signin|sign-in|signup|sign-up|register|logout|sign-out",
    target: "url",
    mode: "exclude",
    descKey: "batch.filter.preset.excludeAuth.desc"
  },
  {
    id: "exclude-assets",
    nameKey: "batch.filter.preset.excludeAssets.name",
    pattern: "\\.(css|js|woff|woff2|ttf|eot|map)(\\?|$)",
    target: "url",
    mode: "exclude",
    descKey: "batch.filter.preset.excludeAssets.desc"
  },
  {
    id: "exclude-media",
    nameKey: "batch.filter.preset.excludeMedia.name",
    pattern: "\\.(mp4|mp3|avi|mov|wmv|flv|wav|ogg|webm)(\\?|$)",
    target: "url",
    mode: "exclude",
    descKey: "batch.filter.preset.excludeMedia.desc"
  },
  {
    id: "include-docs",
    nameKey: "batch.filter.preset.includeDocs.name",
    pattern: "\\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md)(\\?|$)",
    target: "url",
    mode: "include",
    descKey: "batch.filter.preset.includeDocs.desc"
  },
  {
    id: "include-html",
    nameKey: "batch.filter.preset.includeHtml.name",
    pattern: "(\\.html?|\\.php|\\.asp|\\.aspx|\\.jsp)(\\?|$)|/[^.]*$",
    target: "url",
    mode: "include",
    descKey: "batch.filter.preset.includeHtml.desc"
  }
]

export const DEFAULT_FILTER_STATE = {
  pattern: "",
  target: "url" as FilterTarget,
  mode: "exclude" as FilterMode
}
