# Reasoning

**URL**: https://xsai.js.org/docs/packages/utils/reasoning

---

Utils # Reasoning![install size](https://flat.badgen.net/packagephobia/install/@xsai/utils-reasoning?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/utils-reasoning?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/utils-reasoning?color=gray) npmpnpmyarnbun ```
npm i @xsai/utils-reasoning
``` ## Examples ### extractReasoning extracts XML-tagged reasoning sections from text. ```
import { generateText } from '@xsai/generate-text'
import { extractReasoning } from '@xsai/utils-reasoning'
import { env } from 'node:process'

const { text: rawText } = await generateText({
  baseURL: 'http://localhost:11434/v1/',
  messages: [
    {
      content: 'You\'re a helpful assistant.',
      role: 'system'
    },
    {
      content: 'Why is the sky blue?',
      role: 'user'
    },
  ],
  model: 'qwen3',
})

const { reasoning, text } = extractReasoning(rawText!) 
``` ### extractReasoningStream extracts XML-tagged reasoning sections from text stream. ```
import { streamText } from '@xsai/stream-text'
import { extractReasoningStream } from '@xsai/utils-reasoning'
import { env } from 'node:process'

const { textStream: rawTextStream } = streamText({
  baseURL: 'http://localhost:11434/v1/',
  messages: [
    {
      content: 'You\'re a helpful assistant.',
      role: 'system'
    },
    {
      content: 'Why is the sky blue?',
      role: 'user'
    },
  ],
  model: 'qwen3',
})

const { reasoningStream, textStream } = extractReasoningStream(rawTextStream) 
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/utils/reasoning.mdx)[Chat](/docs/packages/utils/chat)[Previous Page](/docs/packages/utils/chat)[Stream](/docs/packages/utils/stream)[Next Page](/docs/packages/utils/stream)
