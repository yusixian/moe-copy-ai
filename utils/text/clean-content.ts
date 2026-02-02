export function cleanContent(content: string): string {
  if (!content) return ""

  // 保留代码块的原样内容，避免清理空白破坏格式。
  const codeBlocks: string[] = []
  let tempContent = content

  const codeBlockRegex = /```[\s\S]*?```/g
  let match: RegExpExecArray | null = codeBlockRegex.exec(content)
  let index = 0

  while (match !== null) {
    const placeholder = `__CODE_BLOCK_${index}__`
    tempContent = tempContent.replace(match[0], placeholder)
    codeBlocks.push(match[0])
    index++
    match = codeBlockRegex.exec(content)
  }

  // 仅清理非代码块区域，降低对结构化内容的破坏。
  tempContent = tempContent
    .replace(/\n+/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+|\s+$/g, "")
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/\s*-\s*/g, "-")
    .replace(/\(\s+|\s+\)/g, (m) => m.replace(/\s+/g, ""))
    .replace(/\s+"|"\s+/g, '"')
    .replace(/\s*\[\s*|\s*\]\s*/g, (m) => m.replace(/\s+/g, ""))
    .replace(/\s*\{\s*|\s*\}\s*/g, (m) => m.replace(/\s+/g, ""))
    .replace(/([.!?:;]) +/g, "$1 ")

  // 保留 Markdown 标题层级的最小可读性。
  tempContent = tempContent.replace(/# +/g, "# ")
  tempContent = tempContent.replace(/## +/g, "## ")
  tempContent = tempContent.replace(/### +/g, "### ")
  tempContent = tempContent.replace(/#### +/g, "#### ")
  tempContent = tempContent.replace(/##### +/g, "##### ")
  tempContent = tempContent.replace(/###### +/g, "###### ")

  // 还原代码块，确保渲染结果与原文一致。
  for (let i = 0; i < codeBlocks.length; i++) {
    tempContent = tempContent.replace(`__CODE_BLOCK_${i}__`, codeBlocks[i])
  }

  return tempContent
}
