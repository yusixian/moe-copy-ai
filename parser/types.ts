export type HastNode = {
  type?: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

export type HastElement = HastNode & {
  type: "element"
  tagName: string
  children?: HastNode[]
}

export type HFunction = (
  node: HastNode,
  type: string,
  propsOrChildren?: Record<string, unknown> | unknown[] | string,
  children?: unknown[] | string
) => unknown
