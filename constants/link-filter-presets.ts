/**
 * 链接过滤预设规则
 */

export type FilterTarget = 'url' | 'text' | 'both'
export type FilterMode = 'exclude' | 'include'

export interface PresetFilter {
  id: string
  name: string
  pattern: string
  target: FilterTarget
  mode: FilterMode
  description: string
}

export const LINK_FILTER_PRESETS: PresetFilter[] = [
  {
    id: 'exclude-images',
    name: '排除图片链接',
    pattern: '\\.(jpg|jpeg|png|gif|webp|svg|ico|bmp|tiff)(\\?|$)',
    target: 'url',
    mode: 'exclude',
    description: '过滤常见图片格式链接'
  },
  {
    id: 'exclude-anchors',
    name: '排除锚点链接',
    pattern: '^#|#[^/]*$',
    target: 'url',
    mode: 'exclude',
    description: '过滤页内锚点链接'
  },
  {
    id: 'exclude-pagination',
    name: '排除分页链接',
    pattern: '[?&]page=|/page/\\d+',
    target: 'url',
    mode: 'exclude',
    description: '过滤分页相关链接'
  },
  {
    id: 'exclude-auth',
    name: '排除登录/注册',
    pattern: 'login|signin|sign-in|signup|sign-up|register|logout|sign-out',
    target: 'url',
    mode: 'exclude',
    description: '过滤认证相关链接'
  },
  {
    id: 'exclude-assets',
    name: '排除静态资源',
    pattern: '\\.(css|js|woff|woff2|ttf|eot|map)(\\?|$)',
    target: 'url',
    mode: 'exclude',
    description: '过滤 CSS、JS、字体等静态资源'
  },
  {
    id: 'exclude-media',
    name: '排除媒体链接',
    pattern: '\\.(mp4|mp3|avi|mov|wmv|flv|wav|ogg|webm)(\\?|$)',
    target: 'url',
    mode: 'exclude',
    description: '过滤视频、音频等媒体文件'
  },
  {
    id: 'include-docs',
    name: '仅保留文档链接',
    pattern: '\\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|md)(\\?|$)',
    target: 'url',
    mode: 'include',
    description: '只保留文档格式链接'
  },
  {
    id: 'include-html',
    name: '仅保留网页链接',
    pattern: '(\\.html?|\\.php|\\.asp|\\.aspx|\\.jsp)(\\?|$)|/[^.]*$',
    target: 'url',
    mode: 'include',
    description: '只保留网页链接'
  }
]

export const DEFAULT_FILTER_STATE = {
  pattern: '',
  target: 'url' as FilterTarget,
  mode: 'exclude' as FilterMode
}
