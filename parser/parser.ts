import rehypeParse from "rehype-parse"
import rehypeRemark from "rehype-remark"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import remarkStringify from "remark-stringify"
import { unified } from "unified"

import { createHeadingHandlers } from "./plugins/heading-handlers"
import { rehypeExtractMath } from "./plugins/math-extractor"
import { createMathHandlers } from "./plugins/math-handlers"
import { rehypeCleanup } from "./plugins/rehype-cleanup"
import { rehypeUnwrapInvalidLinks } from "./plugins/unwrap-invalid-links"

export function getParser() {
  const headingHandlers = createHeadingHandlers()
  const mathHandlers = createMathHandlers()

  return unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeExtractMath)
    .use(rehypeCleanup)
    .use(rehypeUnwrapInvalidLinks)
    .use(
      rehypeRemark as unknown as (options?: Record<string, unknown>) => void,
      { handlers: { ...headingHandlers, ...mathHandlers } }
    )
    .use(remarkGfm)
    .use(remarkMath)
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
