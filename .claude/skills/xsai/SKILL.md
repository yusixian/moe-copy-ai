---
name: xsai-sdk
description: xsAI SDK v0.4.x API reference - extra-small AI SDK with OpenAI-compatible API
globs:
  - "utils/ai-service.ts"
  - "hooks/useStreamProcessor.ts"
  - "hooks/useAiSummary.ts"
  - "hooks/useAiSettings.ts"
---

# xsAI SDK v0.4.x Quick Reference

xsAI is an extra-small AI SDK with OpenAI-compatible API interface, similar to Vercel AI SDK but much smaller.

**Project packages**: `@xsai/generate-text`, `@xsai/stream-text`, `@xsai/model`

## Core APIs

### streamText (sync call, returns StreamTextResult)

```typescript
import { streamText } from "@xsai/stream-text"

// NOTE: streamText is SYNCHRONOUS (not async) in 0.4.x
const { textStream } = streamText({
  apiKey: "...",
  baseURL: "https://api.openai.com/v1/",
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello" },
  ],
  streamOptions: { includeUsage: true },
})

// textStream is a ReadableStream<string>, supports async iteration
for await (const textPart of textStream) {
  console.log(textPart)
}
```

**Types:**

```typescript
interface StreamTextResult {
  textStream: ReadableStream<string>
  fullStream: ReadableStream<StreamTextEvent>
  reasoningTextStream: ReadableStream<string>
  messages: Promise<Message[]>
  steps: Promise<CompletionStep[]>
  usage: Promise<undefined | Usage>
  totalUsage: Promise<undefined | Usage>
}

interface StreamTextOptions extends ChatOptions {
  maxSteps?: number  // default: 1
  onEvent?: (event: StreamTextEvent) => Promise<unknown> | unknown
  onFinish?: (step?: CompletionStep) => Promise<unknown> | unknown
  onStepFinish?: (step: CompletionStep) => Promise<unknown> | unknown
  streamOptions?: { includeUsage?: boolean }
}

// StreamTextEvent replaces the old StreamTextChunkResult
type StreamTextEvent = /* union of stream event types */
```

### generateText (async call)

```typescript
import { generateText } from "@xsai/generate-text"

const { text, usage } = await generateText({
  apiKey: "...",
  baseURL: "https://api.openai.com/v1/",
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Why is the sky blue?" },
  ],
})
```

**Types:**

```typescript
interface GenerateTextResult {
  text?: string  // NOTE: optional in 0.4.x (was required in 0.2.x)
  usage: Usage
  finishReason: FinishReason
  messages: Message[]
  steps: CompletionStep<true>[]
  toolCalls: CompletionToolCall[]
  toolResults: CompletionToolResult[]
  reasoningText?: string
}
```

### listModels (async call)

```typescript
import { listModels } from "@xsai/model"

const models = await listModels({
  apiKey: "...",
  baseURL: "https://api.openai.com/v1/",
})
// Returns Model[] with { id, object, created, owned_by }
```

### Shared Types

```typescript
// From @xsai/shared-chat
interface ChatOptions {
  apiKey?: string
  baseURL: string
  model: string
  messages: Message[]
  // ... other OpenAI-compatible options
}

interface Usage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

type Message = SystemMessage | UserMessage | AssistantMessage | ToolMessage | DeveloperMessage
```

## Breaking Changes from 0.2.0-beta.3

| Change | 0.2.0-beta.3 | 0.4.x |
|--------|-------------|-------|
| `streamText` call | `await streamText()` (async) | `streamText()` (sync) |
| `StreamTextResult` | `{ textStream, chunkStream }` | `{ textStream, fullStream, usage: Promise, ... }` |
| Usage retrieval | Iterate `chunkStream` chunks | `await result.usage` |
| `StreamTextChunkResult` | Exists | Removed, replaced by `StreamTextEvent` |
| `textStream` type | Required `as unknown as AsyncIterable` cast | Native `ReadableStream`, supports `for await` and `pipeThrough()` |
| `generateText` result `.text` | `string` | `string \| undefined` |

## Utils

### smoothStream (from @xsai/utils-stream)

```typescript
import { smoothStream } from "@xsai/utils-stream"

const smoothed = textStream.pipeThrough(smoothStream({
  delay: 20,
  chunking: "line",
}))
```

### toAsyncIterator (polyfill for Safari)

```typescript
import { toAsyncIterator } from "@xsai/utils-stream"

// For browsers that don't support ReadableStream async iteration
const iterableStream = toAsyncIterator(textStream)
```

## Reference Documentation

- `references/index.md` - Full documentation index with all examples
- `references/docs/` - Individual package documentation (27 files with complete code examples)
- `references/type-defs/` - Deno Doc type definitions from esm.sh
