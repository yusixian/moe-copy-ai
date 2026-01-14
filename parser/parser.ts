import rehypeParse from "rehype-parse"
import rehypeRemark from "rehype-remark"
import remarkGfm from "remark-gfm"
import remarkStringify from "remark-stringify"
import { unified } from "unified"

import { createHeadingHandlers } from "./plugins/heading-handlers"
import { rehypeUnwrapInvalidLinks } from "./plugins/unwrap-invalid-links"

export function getParser() {
  const handlers = createHeadingHandlers()

  return unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeUnwrapInvalidLinks)
    .use(
      rehypeRemark as unknown as (options?: Record<string, unknown>) => void,
      { handlers }
    )
    .use(remarkGfm)
    .use(
      remarkStringify as unknown as (options?: Record<string, unknown>) => void,
      {
        bullet: "-",
        emphasis: "*",
        strong: "*",
        fence: "`",
        fences: true,
        listItemIndent: "one"
      }
    )
}
