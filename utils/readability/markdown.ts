import type { ImageInfo } from "../../constants/types"
import { parseHtmlToMarkdown } from "../../parser/htmlParser"
import { debugLog } from "../logger"

export async function convertHtmlToMarkdown(
  htmlContent: string,
  baseUrl?: string
): Promise<string> {
  if (!htmlContent) {
    debugLog("convertHtmlToMarkdown: empty input")
    return ""
  }

  debugLog("convertHtmlToMarkdown: starting, input length:", htmlContent.length)

  try {
    const markdownContent = await parseHtmlToMarkdown(htmlContent, baseUrl)
    const cleanedContent = markdownContent.replace(/\n{3,}/g, "\n\n").trim()

    debugLog("convertHtmlToMarkdown: result length:", cleanedContent.length)
    return cleanedContent
  } catch (error) {
    debugLog("convertHtmlToMarkdown: conversion failed:", error)
    const textOnly = htmlContent
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    debugLog(
      "convertHtmlToMarkdown: using text fallback, length:",
      textOnly.length
    )
    return textOnly
  }
}

const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g

export function extractImagesFromMarkdown(
  markdownContent: string
): ImageInfo[] {
  const images: ImageInfo[] = []
  let match: RegExpExecArray | null
  let index = 0

  IMAGE_REGEX.lastIndex = 0
  // Use explicit assignment to avoid assignments in expressions.
  while (true) {
    match = IMAGE_REGEX.exec(markdownContent)
    if (!match) {
      break
    }
    images.push({
      src: match[2],
      alt: match[1] || `Image#${index}`,
      title: "",
      index
    })
    index++
  }

  return images
}
