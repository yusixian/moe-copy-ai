# 批量抓取文档

> 抓取时间: 2026-02-08 21:12
> 总页面: 27 | 成功: 27 | 失败: 0

---

## 目录

1. [Quick Start](#quick-start)
2. [Overview](#overview)
3. [Text](#text)
4. [Structured Data](#structured-data)
5. [Speech](#speech)
6. [Transcription](#transcription)
7. [Image](#image)
8. [Text](#text)
9. [Structured Data](#structured-data)
10. [Transcription](#transcription)
11. [Tool Calling](#tool-calling)
12. [Models](#models)
13. [Embeddings](#embeddings)
14. [Chat](#chat)
15. [Reasoning](#reasoning)
16. [Stream](#stream)
17. [xsai](#xsai)
18. [xsfetch](#xsfetch)
19. [xsschema](#xsschema)
20. [Providers](#providers)
21. [Telemetry](#telemetry)
22. [moeru-ai/xsai-use: 👾💬 Framework bindings for xsAI. Integrate with your React / Vue / Svelte / ... apps!](#moeru-aixsai-use-framework-bindings-for-xsai-integrate-with-your-react-vue-svelte-apps)
23. [moeru-ai/xsai-transformers: 🤗💬 Transformers.js provider for xsAI. Running Embedding, Whisper, and LLMs right in your browser!](#moeru-aixsai-transformers-transformersjs-provider-for-xsai-running-embedding-whisper-and-llms-right-in-your-browser)
24. [xsAI](#xsai)
25. [unspeech/sdk/typescript at main · moeru-ai/unspeech](#unspeechsdktypescript-at-main-moeru-aiunspeech)
26. [Composio](#composio)
27. [Model Context Protocol](#model-context-protocol)

---
## Quick Start

**URL**: https://xsai.js.org/docs

# Quick Start extra-small AI SDK. ## What is xsAI? xsAI is a series of utils to help you use OpenAI or OpenAI-compatible API. ## Why use the xsAI? xsAI has a similar interface to the Vercel AI SDK, but smaller. This makes it ideal for a variety of scenarios that require smaller bundle size, such as web applications, cli running through npx, and so on. ### So how small is xsAI? Without further ado, let's look at the results from[Packagephobia (install size)](https://packagephobia.com) and[Bundlephobia (bundled size / gzipped size)](https://bundlephobia.com): Package size Gzipped size Bundled size Installed size xsAI reduces the installation size **40x** and the bundled size **13x**. And it could be smaller! If you only need basic text generation, you can just install the `@xsai/generate-text` package: Package size Gzipped size Bundled size Installed size ### Why are only OpenAI-compatible API supported? Considering only OpenAI-compatible APIs keeps us from being plagued by a wide range of compatibility issues while avoiding bloat. btw, Did you know that[Anthropic](https://docs.anthropic.com/en/api/openai-sdk),[Google](https://ai.google.dev/gemini-api/docs/openai) also provides an OpenAI compatible API? We also support many more providers, which can be viewed[here](https://github.com/moeru-ai/xsai/tree/main/packages-ext/providers-cloud/src/providers). ## Join our Community If you have questions about anything related to xsAI, you're always welcome to ask our community on[GitHub Discussions](https://github.com/moeru-ai/xsai/discussions).[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/index.mdx)[Overview](/docs/packages/overview)[Next Page](/docs/packages/overview)

---

## Overview

**URL**: https://xsai.js.org/docs/packages/overview

# Overview ## Quick Start You may want to start with these packages: ###[Generating Text](./generate/text)[Generates text for a given prompt.](./generate/text) ###[Streaming Text](./stream/text)[Streams text from a given prompt.](./stream/text) ###[Generating Structured Data](./generate/object)[Generates structured data for a given prompt and schema.](./generate/object) ###[Streaming Structured Data](./stream/object)[Streams structured data for a given prompt and schema.](./stream/object) ## FAQ Some common questions you may encounter. <!----> ### There are too many packages for xsAI, how do I manage the versions? ### 👆 Is there a simpler / workspace-less way?[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/overview.mdx)[Quick Start](/docs)[extra-small AI SDK.](/docs)[Text](/docs/packages/generate/text)[Generates text for a given prompt.](/docs/packages/generate/text)

---

## Text

**URL**: https://xsai.js.org/docs/packages/generate/text

Generating # Text Generates text for a given prompt.![install size](https://flat.badgen.net/packagephobia/install/@xsai/generate-text?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/generate-text?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/generate-text?color=gray) npmpnpmyarnbun ```
npm i @xsai/generate-text
``` ## Examples ### Basic ```
import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: 'You\'re a helpful assistant.',
      role: 'system'
    },
    {
      content: 'Why is the sky blue?',
      role: 'user'
    }
  ],
  model: 'gpt-4o',
})
``` ### Image input xsAI has no way of knowing if your model supports multi-modal, so please check before using it. ```
import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What\'s in this image?' },
      { 
        type: 'image_url', 
        image_url: { 
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg', 
        }, 
      }, 
    ],
  }],
  model: 'gpt-4o',
})
``` ### Audio input xsAI has no way of knowing if your model supports multi-modal, so please check before using it. ```
import { generateText } from '@xsai/generate-text'
import { Buffer } from 'node:buffer'
import { env } from 'node:process'

const data = await fetch('https://cdn.openai.com/API/docs/audio/alloy.wav')
  .then(res => res.arrayBuffer())
  .then(buffer => Buffer.from(buffer).toString('base64'))

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What is in this recording?' },
      { type: 'input_audio', input_audio: { data, format: 'wav' }} 
    ],
  }],
  model: 'gpt-4o-audio-preview', 
  modalities: ['text', 'audio'], 
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/generate/text.mdx)[Overview](/docs/packages/overview)[Previous Page](/docs/packages/overview)[Structured Data](/docs/packages/generate/object)[Generates structured data for a given prompt and schema.](/docs/packages/generate/object)

---

## Structured Data

**URL**: https://xsai.js.org/docs/packages/generate/object

Generating # Structured Data Generates structured data for a given prompt and schema. For convenience, we use `valibot` as an example. But this package uses `xsschema` internally, so it supports any schema library that xsschema supports: e.g. `zod`, `valibot`, `arktype`, etc. See[xsschema](../../packages-top/xsschema) for more information. <!---->![install size](https://flat.badgen.net/packagephobia/install/@xsai/generate-object?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/generate-object?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/generate-object?color=gray) npmpnpmyarnbun ```
npm i @xsai/generate-object
``` ## Examples These below examples require you to install a standard schema to json schema parser (a separate package). As they are not provided by zod or valibot natively. Read more about them[here](../../packages-top/xsschema#coverage) ### Object ```
import { generateObject } from '@xsai/generate-object'
import { env } from 'node:process'
import * as v from 'valibot'

const { object } = await generateObject({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: 'Extract the event information.',
      role: 'system'
    },
    {
      content: 'Alice and Bob are going to a science fair on Friday.',
      role: 'user'
    }
  ],
  model: 'gpt-4o',
  schema: v.object({
    name: v.string(),
    date: v.string(),
    participants: v.array(v.string()),
  })
})
``` ### Array ```
import { generateObject } from '@xsai/generate-object'
import { env } from 'node:process'
import * as v from 'valibot'

const { object: objects } = await generateObject({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: 'Generate 3 hero descriptions for a fantasy role playing game.',
      role: 'user'
    }
  ],
  model: 'gpt-4o',
  output: 'array', 
  schema: v.object({
    name: v.string(),
    class: v.pipe(
      v.string(),
      v.description('Character class, e.g. warrior, mage, or thief.'),
    ),
    description: v.string(),
  })
})

for (const object of objects) { 
  console.log(object)
}
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/generate/object.mdx)[Text](/docs/packages/generate/text)[Generates text for a given prompt.](/docs/packages/generate/text)[Speech](/docs/packages/generate/speech)[Generates audio from the input text.](/docs/packages/generate/speech)

---

## Speech

**URL**: https://xsai.js.org/docs/packages/generate/speech

Generating # Speech Generates audio from the input text.![install size](https://flat.badgen.net/packagephobia/install/@xsai/generate-speech?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/generate-speech?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/generate-speech?color=gray) npmpnpmyarnbun ```
npm i @xsai/generate-speech
``` ## Examples ```
import { generateSpeech } from '@xsai/generate-speech'
import { Buffer } from 'node:buffer'

const speech = await generateSpeech({
  baseURL: 'http://localhost:5050',
  input: 'Hello, I am your AI assistant! Just let me know how I can help bring your ideas to life.',
  model: 'tts-1',
  voice: 'en-US-AnaNeural',
})

const audio = Buffer.from(speech)
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/generate/speech.mdx)[Structured Data](/docs/packages/generate/object)[Generates structured data for a given prompt and schema.](/docs/packages/generate/object)[Transcription](/docs/packages/generate/transcription)[Transcribes audio into the input language.](/docs/packages/generate/transcription)

---

## Transcription

**URL**: https://xsai.js.org/docs/packages/generate/transcription

Generating # Transcription Transcribes audio into the input language.![install size](https://flat.badgen.net/packagephobia/install/@xsai/generate-transcription?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/generate-transcription?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/generate-transcription?color=gray) npmpnpmyarnbun ```
npm i @xsai/generate-transcription
``` ## Examples ### Basic ```
import { generateTranscription } from '@xsai/generate-transcription'
import { openAsBlob } from 'node:fs'

const { text } = await generateTranscription({
  apiKey: '',
  baseURL: 'http://localhost:8000/v1/',
  file: await openAsBlob('./test/fixtures/basic.wav', { type: 'audio/wav' }),
  fileName: 'basic.wav',
  language: 'en',
  model: 'deepdml/faster-whisper-large-v3-turbo-ct2',
})
``` ### Verbose + Segments ```
import { generateTranscription } from '@xsai/generate-transcription'
import { openAsBlob } from 'node:fs'

const { duration, language, segments, text } = await generateTranscription({ 
  apiKey: '',
  baseURL: 'http://localhost:8000/v1/',
  file: await openAsBlob('./test/fixtures/basic.wav', { type: 'audio/wav' }),
  fileName: 'basic.wav',
  language: 'en',
  model: 'deepdml/faster-whisper-large-v3-turbo-ct2',
  responseFormat: 'verbose_json', 
})
``` ### Verbose + Words ```
import { generateTranscription } from '@xsai/generate-transcription'
import { openAsBlob } from 'node:fs'

const { duration, language, text, words } = await generateTranscription({ 
  apiKey: '',
  baseURL: 'http://localhost:8000/v1/',
  file: await openAsBlob('./test/fixtures/basic.wav', { type: 'audio/wav' }),
  fileName: 'basic.wav',
  language: 'en',
  model: 'deepdml/faster-whisper-large-v3-turbo-ct2',
  responseFormat: 'verbose_json', 
  timestampGranularities: 'word', 
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/generate/transcription.mdx)[Speech](/docs/packages/generate/speech)[Generates audio from the input text.](/docs/packages/generate/speech)[Image](/docs/packages/generate/image)[Creates an image given a prompt.](/docs/packages/generate/image)

---

## Image

**URL**: https://xsai.js.org/docs/packages/generate/image

Generating # Image Creates an image given a prompt.![install size](https://flat.badgen.net/packagephobia/install/@xsai/generate-image?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/generate-image?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/generate-image?color=gray) npmpnpmyarnbun ```
npm i @xsai/generate-image
``` ## Examples ```
import { generateImage } from '@xsai/generate-image'
import { env } from 'node:process'

const { image } = await generateImage({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'http://api.openai.com/v1/',
  model: 'dall-e-3',
  prompt: 'A cute baby sea otter'
})

const { images } = await generateImage({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'http://api.openai.com/v1/',
  n: 4, 
  model: 'dall-e-3',
  prompt: 'A cute baby sea otter'
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/generate/image.mdx)[Transcription](/docs/packages/generate/transcription)[Transcribes audio into the input language.](/docs/packages/generate/transcription)[Text](/docs/packages/stream/text)[Streams text from a given prompt.](/docs/packages/stream/text)

---

## Text

**URL**: https://xsai.js.org/docs/packages/stream/text

Streaming # Text Streams text from a given prompt.![install size](https://flat.badgen.net/packagephobia/install/@xsai/stream-text?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/stream-text?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/stream-text?color=gray) npmpnpmyarnbun ```
npm i @xsai/stream-text
``` ## Examples ### Basic ```
import { streamText } from '@xsai/stream-text'
import { env } from 'node:process'

const { textStream } = streamText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
    {
      content: 'This is a test, so please answer'
        + '\'The quick brown fox jumps over the lazy dog.\''
        + 'and nothing else.',
      role: 'user',
    },
  ],
  model: 'gpt-4o',
})

const text: string[] = []

for await (const textPart of textStream) {
  text.push(textPart)
}

// "The quick brown fox jumps over the lazy dog."
console.log(text)
``` ### Image input xsAI has no way of knowing if your model supports multi-modal, so please check before using it. ```
import { streamText } from '@xsai/stream-text'
import { env } from 'node:process'

const { textStream } = streamText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What\'s in this image?' },
      { 
        type: 'image_url', 
        image_url: { 
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg', 
        }, 
      }, 
    ],
  }],
  model: 'gpt-4o',
})
``` ### Audio input xsAI has no way of knowing if your model supports multi-modal, so please check before using it. ```
import { streamText } from '@xsai/stream-text'
import { Buffer } from 'node:buffer'
import { env } from 'node:process'

const data = await fetch('https://cdn.openai.com/API/docs/audio/alloy.wav')
  .then(res => res.arrayBuffer())
  .then(buffer => Buffer.from(buffer).toString('base64'))

const { textStream } = streamText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [{
    role: 'user',
    content: [
      { type: 'text', text: 'What is in this recording?' },
      { type: 'input_audio', input_audio: { data, format: 'wav' }} 
    ],
  }],
  model: 'gpt-4o-audio-preview', 
  modalities: ['text', 'audio'], 
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/stream/text.mdx)[Image](/docs/packages/generate/image)[Creates an image given a prompt.](/docs/packages/generate/image)[Structured Data](/docs/packages/stream/object)[Streams structured data for a given prompt and schema.](/docs/packages/stream/object)

---

## Structured Data

**URL**: https://xsai.js.org/docs/packages/stream/object

Streaming # Structured Data Streams structured data for a given prompt and schema. For convenience, we use `valibot` as an example. But this package uses `xsschema` internally, so it supports any schema library that xsschema supports: e.g. `zod`, `valibot`, `arktype`, etc. See[xsschema](../../packages-top/xsschema) for more information. <!---->![install size](https://flat.badgen.net/packagephobia/install/@xsai/stream-object?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/stream-object?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/stream-object?color=gray) npmpnpmyarnbun ```
npm i @xsai/stream-object
``` ## Examples These below examples require you to install a standard schema to json schema parser (a separate package). As they are not provided by zod or valibot natively. Read more about them[here](../../packages-top/xsschema#coverage) ### Object ```
import { streamObject } from '@xsai/stream-object'
import { env } from 'node:process'
import * as v from 'valibot'

const { partialObjectStream } = await streamObject({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: 'Extract the event information.',
      role: 'system'
    },
    {
      content: 'Alice and Bob are going to a science fair on Friday.',
      role: 'user'
    }
  ],
  model: 'gpt-4o',
  schema: v.object({
    name: v.string(),
    date: v.string(),
    participants: v.array(v.string()),
  })
})

for await (const partialObject of partialObjectStream) { 
  console.log(partialObject)
}
``` ### Array ```
import { streamObject } from '@xsai/stream-object'
import { env } from 'node:process'
import * as v from 'valibot'

const { elementStream } = await streamObject({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: 'Generate 3 hero descriptions for a fantasy role playing game.',
      role: 'user'
    }
  ],
  model: 'gpt-4o',
  output: 'array', 
  schema: v.object({
    name: v.string(),
    class: v.pipe(
      v.string(),
      v.description('Character class, e.g. warrior, mage, or thief.'),
    ),
    description: v.string(),
  })
})

for await (const element of elementStream) { 
  console.log(element)
}
``` ## Utils ### toElementStream Converts a `ReadableStream<string>` to a `ReadableStream<T>`, which you can use on its own. ```
import { toElementStream } from '@xsai/stream-object'

const elementStream = await fetch('https://example.com')
  .then(res => res.body!.pipeThrough(new TextDecoderStream()))
  .then(stream => toElementStream<{ foo: { bar: 'baz' }}>(stream))
``` ### toPartialObjectStream Converts a `ReadableStream<string>` to a `ReadableStream<PartialDeep<T>>`, which you can use on its own. ```
import { toPartialObjectStream } from '@xsai/stream-object'

const partialObjectStream = await fetch('https://example.com')
  .then(res => res.body!.pipeThrough(new TextDecoderStream()))
  .then(stream => toPartialObjectStream<{ foo: { bar: 'baz' }}>(stream))
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/stream/object.mdx)[Text](/docs/packages/stream/text)[Streams text from a given prompt.](/docs/packages/stream/text)[Transcription](/docs/packages/stream/transcription)[Transcribes audio into the input language.](/docs/packages/stream/transcription)

---

## Transcription

**URL**: https://xsai.js.org/docs/packages/stream/transcription

Streaming # Transcription Transcribes audio into the input language.![install size](https://flat.badgen.net/packagephobia/install/@xsai/stream-transcription?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/stream-transcription?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/stream-transcription?color=gray) npmpnpmyarnbun ```
npm i @xsai/stream-transcription
``` ## Examples Before using this package, please verify that your provider supports `"stream": true`. ### Basic ```
import { streamTranscription } from '@xsai/stream-transcription'
import { openAsBlob } from 'node:fs'

const { textStream } = streamTranscription({
  apiKey: '',
  baseURL: 'https://api.openai.com/v1/',
  file: await openAsBlob('./test/fixtures/basic.wav', { type: 'audio/wav' }),
  fileName: 'basic.wav',
  language: 'en',
  model: 'gpt-4o-transcribe',
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/stream/transcription.mdx)[Structured Data](/docs/packages/stream/object)[Streams structured data for a given prompt and schema.](/docs/packages/stream/object)[Tool Calling](/docs/packages/tool)[Connect LLMs to external data and systems.](/docs/packages/tool)

---

## Tool Calling

**URL**: https://xsai.js.org/docs/packages/tool

# Tool Calling Connect LLMs to external data and systems.![install size](https://flat.badgen.net/packagephobia/install/@xsai/tool?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/tool?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/tool?color=gray) npmpnpmyarnbun ```
npm i @xsai/tool
``` ## Examples ### tool accepts a `StandardSchemaV1`, automatically infers the type. For convenience, we use `valibot` as an example. But this package uses `xsschema` internally, so it supports any schema library that xsschema supports: e.g. `zod`, `valibot`, `arktype`, etc. See[xsschema](../packages-top/xsschema) for more information. These below examples require you to install a standard schema to json schema parser (a separate package). As they are not provided by zod or valibot natively. Read more about them[here](../packages-top/xsschema#coverage) ```
import { generateText } from '@xsai/generate-text'
import { tool } from '@xsai/tool'
import { env } from 'node:process'
import * as v from 'valibot'

const weather = await tool({
  description: 'Get the weather in a location',
  execute: ({ location }) => JSON.stringify({
    location,
    temperature: 42,
  }),
  name: 'weather',
  parameters: v.object({
    location: v.pipe(
      v.string(),
      v.description('The location to get the weather for'),
    ),
  }),
})

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  maxSteps: 2, 
  messages: [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
    {
      content: 'What is the weather in San Francisco?',
      role: 'user',
    },
  ],
  model: 'gpt-4o',
  tools: [weather], 
})
``` ### rawTool accepts a `JsonSchema`, execute params type to be defined manually. ```
import { generateText } from '@xsai/generate-text'
import { rawTool } from '@xsai/tool'
import { env } from 'node:process'

const weather = rawTool<{ location: string }>({
  description: 'Get the weather in a location',
  execute: ({ location }) => JSON.stringify({
    location,
    temperature: 42,
  }),
  name: 'weather',
  parameters: {
    additionalProperties: false,
    properties: {
      location: {
        description: 'The location to get the weather for',
        type: 'string',
      },
    },
    required: [
      'location',
    ],
    type: 'object',
  },
})

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  maxSteps: 2, 
  messages: [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
    {
      content: 'What is the weather in San Francisco?',
      role: 'user',
    },
  ],
  model: 'gpt-4o',
  tools: [weather], 
})
``` You can also use it like this to avoid `tool`'s asynchronous contagion: ```
import type { RawToolOptions } from '@xsai/tool'

import { rawTool } from '@xsai/tool'
import * as z from 'zod'

const weatherSchema = z.object({
  location: z
    .string()
    .describe('The location to get the weather for'),
})

const weather = rawTool<z.input<typeof weatherSchema>>({
  description: 'Get the weather in a location',
  execute: ({ location }) => JSON.stringify({
    location,
    temperature: 42,
  }),
  name: 'weather',
  parameters: z.toJSONSchema(weatherSchema) as unknown as RawToolOptions['parameters'],
})
``` ### Tool You can also pass an object directly without installing `@xsai/tool`. ```
import type { Tool } from '@xsai/shared-chat'

import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'

const weather = {
  execute: (({ location }) => JSON.stringify({
    location,
    temperature: 42,
  })) as Tool['execute'], 
  function: {
    description: 'Get the weather in a location',
    name: 'weather',
    parameters: {
      additionalProperties: false,
      properties: {
        location: {
          description: 'The location to get the weather for',
          type: 'string',
        },
      },
      required: [
        'location',
      ],
      type: 'object',
    },
    strict: true,
  },
  type: 'function',
} satisfies Tool

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  maxSteps: 2, 
  messages: [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
    {
      content: 'What is the weather in San Francisco?',
      role: 'user',
    },
  ],
  model: 'gpt-4o',
  tools: [weather], 
})
``` Zod example: ```
import type { Tool } from '@xsai/shared-chat'

import * as z from 'zod'

const weatherSchema = z.object({
  location: z
    .string()
    .describe('The location to get the weather for'),
})

const weather = {
  execute: (input) => JSON.stringify({
    location: (input as z.input<typeof weatherSchema>).location,
    temperature: 42,
  }),
  function: {
    description: 'Get the weather in a location',
    name: 'weather',
    parameters: z.toJSONSchema(weatherSchema) as unknown as Record<string, unknown>, 
  },
  type: 'function',
} satisfies Tool
``` ### overrides `await tool()`, `rawTool()` ultimately returns a `Tool` object, so you can modify it freely. ```
import { generateText } from '@xsai/generate-text'
import { tool } from '@xsai/tool'
import { env } from 'node:process'
import * as v from 'valibot'

const parameters = v.object({
  location: v.pipe(
    v.string(),
    v.description('The location to get the weather for'),
  ),
})

const weather = await tool({
  description: 'Get the weather in a location',
  execute: ({ location }) => JSON.stringify({
    location,
    temperature: 42,
  }),
  name: 'weather',
  parameters,
})

weather.execute = (input) => JSON.stringify({
  location: (input as v.InferInput<typeof parameters>).location,
  temperature: 5500,
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/tool.mdx)[Transcription](/docs/packages/stream/transcription)[Transcribes audio into the input language.](/docs/packages/stream/transcription)[Models](/docs/packages/model)[List and describe the various models available in the API.](/docs/packages/model)

---

## Models

**URL**: https://xsai.js.org/docs/packages/model

# Models List and describe the various models available in the API.![install size](https://flat.badgen.net/packagephobia/install/@xsai/model?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/model?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/model?color=gray) npmpnpmyarnbun ```
npm i @xsai/model
``` ## Examples ### listModels ```
import { listModels } from '@xsai/model'
import { env } from 'node:process'

// [
//   {
//     "id": "model-id-0",
//     "object": "model",
//     "created": 1686935002,
//     "owned_by": "organization-owner"
//   },
//   {
//     "id": "model-id-1",
//     "object": "model",
//     "created": 1686935002,
//     "owned_by": "organization-owner",
//   },
//   {
//     "id": "model-id-2",
//     "object": "model",
//     "created": 1686935002,
//     "owned_by": "openai"
//   },
// ]
const models = await listModels({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
})
``` ### retrieveModel ```
import { retrieveModel } from '@xsai/model'
import { env } from 'node:process'

// {
//   "id": "gpt-4o",
//   "object": "model",
//   "created": 1686935002,
//   "owned_by": "openai"
// }
const model = await retrieveModel({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  model: 'gpt-4o',
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/model.mdx)[Tool Calling](/docs/packages/tool)[Connect LLMs to external data and systems.](/docs/packages/tool)[Embeddings](/docs/packages/embed)[Get a vector representation of a given input.](/docs/packages/embed)

---

## Embeddings

**URL**: https://xsai.js.org/docs/packages/embed

# Embeddings Get a vector representation of a given input.![install size](https://flat.badgen.net/packagephobia/install/@xsai/embed?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/embed?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/embed?color=gray) npmpnpmyarnbun ```
npm i @xsai/embed
``` ## Examples ### embed ```
import { embed } from '@xsai/embed'
import { env } from 'node:process'

const { embedding } = await embed({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  input: 'sunny day at the beach',
  model: 'text-embedding-3-large',
})
``` ### embedMany ```
import { embedMany } from '@xsai/embed'
import { env } from 'node:process'

const { embeddings } = await embedMany({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  input: [
    'sunny day at the beach',
    'rainy afternoon in the city',
    'snowy night in the mountains',
  ],
  model: 'text-embedding-3-large'
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/embed.mdx)[Models](/docs/packages/model)[List and describe the various models available in the API.](/docs/packages/model)[Chat](/docs/packages/utils/chat)[Next Page](/docs/packages/utils/chat)

---

## Chat

**URL**: https://xsai.js.org/docs/packages/utils/chat

Utils # Chat![install size](https://flat.badgen.net/packagephobia/install/@xsai/utils-chat?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/utils-chat?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/utils-chat?color=gray) npmpnpmyarnbun ```
npm i @xsai/utils-chat
``` ## Examples ### messages util to easy create messages. ```
import { generateText } from '@xsai/generate-text'
import { message } from '@xsai/utils-chat'
import { env } from 'node:process'

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    { 
      content: 'You\'re a helpful assistant.', 
      role: 'system'
    }, 
    message.system('You\'re a helpful assistant.'), 
    { 
      content: 'Why is the sky blue?', 
      role: 'user'
    }, 
    message.user('Why is the sky blue?'), 
  ],
  model: 'gpt-4o',
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/utils/chat.mdx)[Embeddings](/docs/packages/embed)[Get a vector representation of a given input.](/docs/packages/embed)[Reasoning](/docs/packages/utils/reasoning)[Next Page](/docs/packages/utils/reasoning)

---

## Reasoning

**URL**: https://xsai.js.org/docs/packages/utils/reasoning

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

---

## Stream

**URL**: https://xsai.js.org/docs/packages/utils/stream

Utils # Stream![install size](https://flat.badgen.net/packagephobia/install/@xsai/utils-stream?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/utils-stream?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/utils-stream?color=gray) npmpnpmyarnbun ```
npm i @xsai/utils-stream
``` ## Examples ### simulateReadableStream ```
import { simulateReadableStream } from '@xsai/utils-stream'

const stream = simulateReadableStream<number>({
  chunks: [1, 2, 3],
  chunkDelay: 100,
  initialDelay: 0,
})
``` ### smoothStream ```
import { streamText } from '@xsai/stream-text'
import { smoothStream } from '@xsai/utils-stream'
import { env } from 'node:process'

const { textStream } = streamText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
    {
      content: 'This is a test, so please answer'
        + '\'The quick brown fox jumps over the lazy dog.\''
        + 'and nothing else.',
      role: 'user',
    },
  ],
  model: 'gpt-4o',
})

const smoothTextStream = textStream.pipeThrough(smoothStream({
  delay: 20,
  chunking: 'line',
}))
``` ### toAsyncIterator Simple polyfill for Safari. (see <https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#browser_compatibility>) ```
import { simulateReadableStream, toAsyncIterator } from '@xsai/utils-stream'

const stream = simulateReadableStream<number>({
  chunks: [1, 2, 3],
  chunkDelay: 100,
  initialDelay: 0,
})

const iterableStream = toAsyncIterator(stream)
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/utils/stream.mdx)[Reasoning](/docs/packages/utils/reasoning)[Previous Page](/docs/packages/utils/reasoning)[xsai](/docs/packages-top/xsai)[A package containing all the core xsAI tools.](/docs/packages-top/xsai)

---

## xsai

**URL**: https://xsai.js.org/docs/packages-top/xsai

[![](https://github.com/moeru-ai.png)xsAI`0.4.3`](https://xsai.js.org/) A package containing all the core xsAI tools.![install size](https://flat.badgen.net/packagephobia/install/xsai?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/xsai?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/xsai?color=gray) ```
npm i xsai
``` ## Usage Simply change any import where the scope is `@xsai` to import from `xsai`. ```
import { generateText } from '@xsai/generate-text'
import { generateText } from 'xsai'
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages-top/xsai.mdx)[Stream](https://xsai.js.org/docs/packages/utils/stream)[Previous Page](https://xsai.js.org/docs/packages/utils/stream)[xsfetch](https://xsai.js.org/docs/packages-top/xsfetch)[extra-small Fetch API with auto retry.](https://xsai.js.org/docs/packages-top/xsfetch) ### On this page Usage

---

## xsfetch

**URL**: https://xsai.js.org/docs/packages-top/xsfetch

# xsfetch extra-small Fetch API with auto retry.![install size](https://flat.badgen.net/packagephobia/install/xsfetch?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/xsfetch?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/xsfetch?color=gray) npmpnpmyarnbun ```
npm i xsfetch
``` ## Usage ### createFetch ```
import { createFetch } from 'xsfetch'

const fetch = createFetch({
  retry: 3,
  retryDelay: 1000,
})
``` ### createFetch with generateText ```
import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'
import { createFetch } from 'xsfetch'

const fetch = createFetch({
  retry: 3,
  retryDelay: 1000,
})

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  fetch, 
  messages: [
    {
      content: 'You\'re a helpful assistant.',
      role: 'system'
    },
    {
      content: 'Why is the sky blue?',
      role: 'user'
    }
  ],
  model: 'gpt-4o',
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages-top/xsfetch.mdx)[xsai](/docs/packages-top/xsai)[A package containing all the core xsAI tools.](/docs/packages-top/xsai)[xsschema](/docs/packages-top/xsschema)[extra-small, Standard Schema-based alternative to typeschema.](/docs/packages-top/xsschema)

---

## xsschema

**URL**: https://xsai.js.org/docs/packages-top/xsschema

# xsschema extra-small, Standard Schema-based alternative to typeschema.![install size](https://flat.badgen.net/packagephobia/install/xsschema?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/xsschema?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/xsschema?color=gray) npmpnpmyarnbun ```
npm i xsschema
``` ## Why xsSchema?-Actively maintained along with xsAI.-Support for up to libraries in the Standard Schema scope.-Already used by xsAI (you are here),[FastMCP](https://github.com/punkpeye/fastmcp),[Airi](https://github.com/moeru-ai/airi) and others. ### Compare #### `xsschema` (0.4.0-beta.3, 17KB)-Minimum size, ESM only.-Detailed error message with links.-Additional types and utils. (see below) #### `@standard-community/standard-json` (0.3.1, 96KB)-Similar to xsSchema, but larger in size.-Supports CommonJS. #### `@typeschema/main` (0.14.1, 68KB)-Lack of maintenance, with supporting libraries remaining on outdated versions.-Support for the most schema validators.-Not based on the Standard Schema. ## Coverage `validate` doesn't require manual support and works with any Standard Schema-compatible library. Here is the list of libraries that `toJsonSchema` is compatible with: | Implementer | Version(s) | Status | |-----------------------------------------|----------|---------| | Zod (`zod/v4`, `zod/v4/mini`) | v3.25+ | Supported | | Zod (`zod/v3`, with `zod-to-json-schema`) | v3.25+ | Supported | | Valibot (with `@valibot/to-json-schema`) | v1.0+ | Supported | | ArkType | v2.1+ | Supported | | Effect Schema | v3.16+ | Supported | | Sury | v10.0+ | Supported | ## Usage If you're using xsAI, this package is a dependency of some of those packages-you don't need to install it separately. ### toJsonSchema ```
import { type } from 'arktype'
import { Schema } from 'effect'
import * as S from 'sury'
import * as v from 'valibot'
import { toJsonSchema } from 'xsschema'
import { z } from 'zod'

const arktypeSchema = type({
  myString: 'string',
  myUnion: 'number | boolean',
}).describe('My neat object schema')

const arktypeJsonSchema = await toJsonSchema(arktypeSchema)

const effectSchema = Schema.standardSchemaV1( 
  Schema.Struct({
    myString: Schema.String,
    myUnion: Schema.Union(Schema.Number, Schema.Boolean),
  }).annotations({ description: 'My neat object schema' })
)

const effectJsonSchema = await toJsonSchema(effectSchema)

const surySchema = S.schema({
  myString: S.string,
  myUnion: S.union([S.number, S.boolean]),
}).with(S.meta, { description: 'My neat object schema' })

const suryJsonSchema = await toJsonSchema(surySchema)

const valibotSchema = v.pipe(
  v.object({
    myString: v.string(),
    myUnion: v.union([v.number(), v.boolean()]),
  }),
  v.description('My neat object schema'),
)

const valibotJsonSchema = await toJsonSchema(valibotSchema)

const zodSchema = z.object({
  myString: z.string(),
  myUnion: z.union([z.number(), z.boolean()]),
}).describe('My neat object schema')

const zodJsonSchema = await toJsonSchema(zodSchema)
``` ### validate ```
import { validate } from 'xsschema'
import { type } from 'arktype'
import { Schema } from 'effect'
import * as S from 'sury'
import * as v from 'valibot'
import * as z from 'zod'

const arktypeSchema = type("string")
const effectSchema = Schema.standardSchemaV1(Schema.String)
const surySchema = S.string
const valibotSchema = v.string()
const zodSchema = z.string()

const arktypeResult = await validate(arktypeSchema, '123')
const effectResult = await validate(effectSchema, '123')
const suryResult = await validate(surySchema, '123')
const valibotResult = await validate(valibotSchema, '123')
const zodResult = await validate(zodSchema, '123')
``` ### jsonSchema Define a JSON Schema. ```
import { jsonSchema } from 'xsschema'

const schema = jsonSchema({
  type: 'object',
  properties: {
    productId: {
      description: 'The unique identifier for a product',
      type: 'integer'
    }
  }
})
``` ### strictJsonSchema Define a JSON Schema and set additionalProperties to `false`. ```
import { strictJsonSchema } from 'xsschema'

const schema = strictJsonSchema({
  type: 'object',
  properties: {
    productId: {
      description: 'The unique identifier for a product',
      type: 'integer'
    }
  }
})

// false
console.log(schema.additionalProperties)
``` ## Types ### Schema Pre-bundled version of `StandardSchemaV1` in `@standard-schema/spec`. You can avoid installing `@standard-schema/spec` to save some bulk. ### JsonSchema Pre-bundled version of `JsonSchema7` in `@types/json-schema`. You can avoid installing `@types/json-schema` to save some bulk. ### Infer (deprecated) Alias for `StandardSchemaV1.Infer`. ### InferIn (deprecated) Alias for `StandardSchemaV1.InferInput`. ## Errors ### Missing dependencies Some schema providers require additional packages to convert to JsonSchema. xsschema supports a lot of vendors, so they won't and shouldn't be set as a direct dependencies, which will lead to size growth even if you don't use them. In a nutshell: If you use zod v3: install `zod-to-json-schema` If you use valibot: install `@valibot/to-json-schema` All optional peer dependencies are noted in Coverage. ### Unsupported schema vendor This means that xsschema does not yet support this vendor. If you are interested in adding support, please make sure the library meets the following requirements (choose one of two):-GitHub stars is greater than 100. (If the repo is not on GitHub, refer to the next entry)-npm package has over 1000 weekly downloads.[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages-top/xsschema.mdx)[xsfetch](/docs/packages-top/xsfetch)[extra-small Fetch API with auto retry.](/docs/packages-top/xsfetch)[Providers](/docs/packages-ext/providers)[Collection of predefined providers.](/docs/packages-ext/providers)

---

## Providers

**URL**: https://xsai.js.org/docs/packages-ext/providers

# Providers Collection of predefined providers. This package is not recommended for xsAI-based libraries, which can increase the size of the installation. <!----> npmpnpmyarnbun ```
npm i @xsai-ext/providers
``` ## Usage ### Predefined > It reads the API Key from the environment variables via `process.env`, so it cannot be used in a browser. ```
import { google } from '@xsai-ext/providers'
import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'

const { text } = await generateText({
  ...google.chat('gemini-2.5-flash'), 
  apiKey: env.GEMINI_API_KEY!, 
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/', 
  messages: [{
    content: 'Why is the sky blue?',
    role: 'user'
  }],
  model: 'gemini-2.5-flash', 
})
``` ### Create You can also import a create function instead of a predefined provider, making it runtime-agnostic: ```
// import { google } from '@xsai-ext/providers'
import { createGoogleGenerativeAI } from '@xsai-ext/providers/create'
import { generateText } from '@xsai/generate-text'

const google = createGoogleGenerativeAI('YOUR_API_KEY_HERE') 

const { text } = await generateText({
  ...google.chat('gemini-2.5-flash'),
  messages: [{
    content: 'Why is the sky blue?',
    role: 'user'
  }],
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages-ext/providers.mdx)[xsschema](/docs/packages-top/xsschema)[extra-small, Standard Schema-based alternative to typeschema.](/docs/packages-top/xsschema)[Telemetry](/docs/packages-ext/telemetry)[Next Page](/docs/packages-ext/telemetry)

---

## Telemetry

**URL**: https://xsai.js.org/docs/packages-ext/telemetry

# Telemetry![install size](https://flat.badgen.net/packagephobia/install/@xsai-ext/telemetry?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai-ext/telemetry?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai-ext/telemetry?color=gray) npmpnpmyarnbun ```
npm i @xsai-ext/telemetry
``` ## Usage > `@xsai/telemetry` exports everything from `xsai`, so you can use it for overrides. > > Currently, telemetry only supports `generateText` and `streamText`. Simply switch the import. ```
- import { generateText, streamText } from 'xsai'
+ import { generateText, streamText } from '@xsai-ext/telemetry'
``` You can also configure additional telemetry options: ```
import { generateText } from '@xsai-ext/telemetry'
import { env } from 'node:process'

const instructions = 'You\'re a helpful assistant.'

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: instructions, 
      role: 'system'
    },
    {
      content: 'Why is the sky blue?',
      role: 'user'
    }
  ],
  model: 'gpt-4o',
  telemetry: { 
    attributes: { 
      'gen_ai.agent.name': 'weather-assistant', 
      'gen_ai.agent.description': instructions, 
    }, 
  }, 
})
``` xsAI Telemetry is based on[GenAI Attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/).[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages-ext/telemetry.mdx)[Providers](/docs/packages-ext/providers)[Collection of predefined providers.](/docs/packages-ext/providers)[xsai-use](https://github.com/moeru-ai/xsai-use)[Next Page](https://github.com/moeru-ai/xsai-use)

---

## moeru-ai/xsai-use: 👾💬 Framework bindings for xsAI. Integrate with your React / Vue / Svelte / ... apps!

**URL**: https://github.com/moeru-ai/xsai-use

## xsAI Use Official UI Framework Bindings for xsAI ## Getting Started Install with your favorite package manager: ```
# Using npm
npm install @xsai-use/react

# Using yarn
yarn add @xsai-use/react

# Using pnpm
pnpm add @xsai-use/react
``` ## Currently Supported UI Libraries-React-useChat-Svelte-Chat ## Usage Examples a simple chat example with `@xsai-use/react` ```
import { useChat } from '@xsai-use/react'

export function ChatComponent() {
  const {
    handleSubmit,
    handleInputChange,
    input,
    messages,
    status,
    error,
    reset,
    stop,
    reload,
  } = useChat({
    id: 'simple-chat',
    preventDefault: true,
    initialMessages: [
      {
        role: 'system',
        content: 'you are a helpful assistant.',
      },
    ],
    baseURL: 'https://api.openai.com/v1/',
    model: 'gpt-4.1',
    maxSteps: 3,
  })

  return (
    <div>
      {messages.map((message, idx) => message
        ? (
            <ChatMessage
              key={message.id}
              message={message}
              isError={idx === messages.length - 1 && status === 'error'}
              error={idx === messages.length - 1 ? error : null}
              reload={reload}
            />
          )
        : 'null')}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="say something..."
          onChange={handleInputChange}
          value={input}
          disabled={status !== 'idle'}
        />
        <button type="submit">Send</button>
        <button type="button" onClick={reset}>Reset</button>
      </form>
    </div>
  )
}
``` ## License[MIT](https://github.com/moeru-ai/xsai-use/blob/main/LICENSE.md)

---

## moeru-ai/xsai-transformers: 🤗💬 Transformers.js provider for xsAI. Running Embedding, Whisper, and LLMs right in your browser!

**URL**: https://github.com/moeru-ai/xsai-transformers

## xsAI 🤗 Transformers.js Provider >[Playground in Browser](https://xsai-transformers.netlify.app/#/) A special[Transformers.js](https://huggingface.co/docs/transformers.js/en/index) provider for[`xsai`](https://github.com/moeru-ai/xsai), the extra-small AI SDK. Capable of performing tasks of embedding, transcriptions, speech synthesis, and text generations right in the browser (Node.js supported too).[![npm version](https://camo.githubusercontent.com/d6e7f24d9bd6ae8b4d8cb38a7c5a24f78076c619fb9db53c6c05b7a96d4becdf/68747470733a2f2f666c61742e62616467656e2e6e65742f6e706d2f762f787361692d7472616e73666f726d6572733f636f6c6f723d6379616e)](https://npmjs.com/package/xsai-transformers)[![npm downloads](https://camo.githubusercontent.com/26943ea052f722985ee2ff05340fbb0f531133f884c2afeae7baef3d7f845047/68747470733a2f2f666c61742e62616467656e2e6e65742f6e706d2f646d2f787361692d7472616e73666f726d6572733f636f6c6f723d6379616e)](https://npm.chart.dev/xsai-transformers)[![bundle size](https://camo.githubusercontent.com/c7169eb258bf05a654891c51ffffde92568e013e511ff84a41d3aa7059a477ad/68747470733a2f2f666c61742e62616467656e2e6e65742f62756e646c6570686f6269612f6d696e7a69702f787361692d7472616e73666f726d6572733f636f6c6f723d6379616e)](https://bundlephobia.com/package/xsai-transformers)[![license](https://camo.githubusercontent.com/8e536a9c0900bc7bcae81077672bd1d0eafee1a1892dc90914695c395f55384e/68747470733a2f2f666c61742e62616467656e2e6e65742f6769746875622f6c6963656e73652f6d6f6572752d61692f787361692d7472616e73666f726d6572733f636f6c6f723d6379616e)](https://github.com/moeru-ai/xsai-transformers/blob/main/LICENSE.md) xsAI Transformers.js Provider aligned the API of xsAI: ```
import { createEmbedProvider } from '@xsai-transformers/embed'
import embedWorkerURL from '@xsai-transformers/embed/worker?worker&url'
import { embed } from '@xsai/embed'

const transformers = createEmbedProvider({ baseURL: `xsai-transformers:///?worker-url=${embedWorkerURL}` })

// [
//   -0.038177140057086945,
//   0.032910916954278946,
//   -0.005459371022880077,
//   // ...
// ]
const { embedding } = await embed({
  ...transformers.embed('Xenova/all-MiniLM-L6-v2'),
  input: 'sunny day at the beach'
})
``` ## Features `xsai-transformers` is just a wrapper for[🤗 Transformers.js](https://huggingface.co/docs/transformers.js/en/index). Any HuggingFace available models are possible to inference with if ONNX format of model is prepared. While enjoying the lightweight size and compositing of APIs from xsAI, we made every possible `xsai-transformers` sub-providers (embedding, transcription, speech) compatible to existing xsAI implementation, this means, for either `xsai` or `@xsai/generate-transcription`, `@xsai/embed`, there is no need to re-write everything to get on hands of `xsai-transformers`, the only needed thing is to install and go. ### Runtime-agnostic `xsai-transformers` doesn't depend on WebGPU or Browser Built-in Modules, it works well in Node.js and other runtimes, as long as Worker thread of WebGPU are ported and supported.. ## Usage ### Install > Just like xsAI's atomic design of every feature, you can also install only some of the utils of `xsai-transformers`, such as `@xsai-transformers/embed` and `@xsai-transformers/transcription`. ```
# npm
npm install xsai-transformers

# yarn
yarn add xsai-transformers

# pnpm
pnpm install xsai-transformers

# bun
bun install xsai-transformers

# deno
deno install xsai-transformers
``` ### Examples ###### Embedding (see above) ###### Transcription ```
import { createTranscriptionProvider } from '@xsai-transformers/transcription'
import transcriptionWorkerURL from '@xsai-transformers/transcription/worker?worker&url'
import { generateTranscription } from '@xsai/generate-transcription'

const transformers = createTranscriptionProvider({ baseURL: `xsai-transformers:///?worker-url=${transcriptionWorkerURL}}` })
const file: File = undefined // Audio file
const { text } = await generateTranscription({ ...transformers.transcribe('onnx-community/whisper-large-v3-turbo'), file })
``` ### Status xsAI[Transformers.js](https://huggingface.co/docs/transformers.js/en/index) is currently in an early stage of development and may introduce breaking changes at any time. ## License[MIT](https://github.com/moeru-ai/xsai-transformers/blob/main/LICENSE.md)

---

## xsAI

**URL**: https://xsmcp.js.org/docs/client/integrations/xsai

# xsAI extra-small AI SDK. npmpnpmyarnbun ```
npm i @xsmcp/client-xsai
``` ```
pnpm add @xsmcp/client-xsai
``` ```
yarn add @xsmcp/client-xsai
``` ```
bun add @xsmcp/client-xsai
``` ## Examples ### getXSAITools ```
import type { Tool } from '@xsai/shared-chat'
import { createHttpClient } from '@xsmcp/client-http'
import { getXSAITools } from '@xsmcp/client-xsai'

const client = createHttpClient({
  name: 'example-client',
  version: '1.0.0',
}, { url: 'http://localhost:3000/mcp' })

const tools: Tool[] = await getXSAITools(client) 
``` #### with generateText ```
import { generateText } from '@xsai/generate-text'
import { createHttpClient } from '@xsmcp/client-http'
import { getXSAITools } from '@xsmcp/client-xsai'

try {
  const client = createHttpClient({
    name: 'example-client',
    version: '1.0.0',
  }, { url: 'http://localhost:3000/mcp' })

  const result = await generateText({
    baseURL: 'http://localhost:11434/v1/'
    model: 'qwen3',
    tools: await getXSAITools(client), 
    messages: [{ role: 'user', content: 'What does 1+1 equal?' }],
  })
} finally {
  await client.close() 
}
``` #### with streamText ```
import { streamText } from '@xsai/stream-text'
import { createHttpClient } from '@xsmcp/client-http'
import { getXSAITools } from '@xsmcp/client-xsai'

const client = createHttpClient({
  name: 'example-client',
  version: '1.0.0',
}, { url: 'http://localhost:3000/mcp' })

const result = await streamText({
  baseURL: 'http://localhost:11434/v1/'
  model: 'qwen3',
  onFinish: async () => client.close(), 
  tools: await getXSAITools(client), 
  messages: [{ role: 'user', content: 'What does 1+1 equal?' }],
})
```[Usage](/docs/client/http/usage)[Previous Page](/docs/client/http/usage)

---

## unspeech/sdk/typescript at main · moeru-ai/unspeech

**URL**: https://github.com/moeru-ai/unspeech/tree/main/sdk/typescript

# unSpeech TypeScript Client > Your Text-to-Speech Services, All-in-One. ## Install ```
npm i unspeech
``` ## Getting Started ### List voices Besides of the `/audio/speech` endpoint, we support listing all the available voices from providers as well: ```
import { createUnSpeech, listVoices } from 'unspeech'

const unspeech = createUnSpeech('YOUR_EXTERNAL_PROVIDER_API_KEY', 'http://localhost:5933/v1/')

const voices = await listVoices(
  unspeech.voice({ backend: 'elevenlabs' })
)
``` ### Speech synthesis For general purpose `/audio/speech` requests, `@xsai/generate-speech` or xsAI can be used as it's compatible: ```
npm i @xsai/generate-speech
``` ```
import { generateSpeech } from '@xsai/generate-speech'
import { createUnSpeech } from 'unspeech'

const unspeech = createUnSpeech('YOUR_EXTERNAL_PROVIDER_API_KEY', 'http://localhost:5933/v1/')
const speech = await generateSpeech({
  ...unspeech.speech('elevenlabs/eleven_multilingual_v2'),
  input: 'Hello, World!',
  voice: '9BWtsMINqrJLrRacOk9x',
})
``` For the other providers, you can import them as needed ```
import {
  createUnAlibabaCloud,
  createUnElevenLabs,
  createUnMicrosoft,
  createUnSpeech,
  createUnVolcengine,
} from 'unspeech'
``` When using-[Microsoft / Azure AI Speech service](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech)-[Alibaba Cloud Model Studio / 阿里云百炼 / CosyVoice](https://www.alibabacloud.com/en/product/modelstudio)-[Volcano Engine / 火山引擎语音技术](https://www.volcengine.com/product/voice-tech)-[ElevenLabs](https://elevenlabs.io/docs/api-reference/text-to-speech/convert) providers,[SSML](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup) is supported to control in fine grain level for pitch, volume, rate, etc. ## Related Projects Looking for something like unSpeech, but for local TTS? check it out:-[erew123/alltalk\_tts/alltalkbeta](https://github.com/erew123/alltalk_tts/tree/alltalkbeta)-[astramind-ai/Auralis](https://github.com/astramind-ai/Auralis)-[matatonic/openedai-speech](https://github.com/matatonic/openedai-speech) Or to use free Edge TTS:-[travisvn/openai-edge-tts](https://github.com/travisvn/openai-edge-tts) ## License[AGPL-3.0](/moeru-ai/unspeech/blob/main/sdk/typescript/LICENSE)

---

## Composio

**URL**: https://xsai.js.org/docs/integrations/tools/composio

Tools # Composio Composio adapter for xsAI. > This code is untested, feel free to test it yourself and provide feedback. npmpnpmyarnbun ```
npm i composio-core zod @xsai/shared-chat @xsai/tool
``` ```
import type { Tool } from '@xsai/shared-chat'
import type { RawActionData } from 'composio-core'

import { ComposioToolSet } from 'composio-core'
import { z } from 'zod'

type Optional<T> = null | T

const ZExecuteToolCallParams = z.object({
  actions: z.array(z.string()).optional(),
  apps: z.array(z.string()).optional(),
  connectedAccountId: z.string().optional(),
  entityId: z.string().optional(),
  filterByAvailableApps: z.boolean().optional().default(false),
  params: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  useCase: z.string().optional(),
  useCaseLimit: z.number().optional(),
})

export class XSAIToolSet extends ComposioToolSet {
  fileName: string = 'js/src/frameworks/xsai.ts'

  constructor(
    config: {
      allowTracing?: boolean
      apiKey?: Optional<string>
      baseUrl?: Optional<string>
      connectedAccountIds?: Record<string, string>
      entityId?: string
    } = {},
  ) {
    super({
      allowTracing: config.allowTracing || false,
      apiKey: config.apiKey ?? null,
      baseUrl: config.baseUrl ?? null,
      connectedAccountIds: config.connectedAccountIds,
      entityId: config.entityId ?? 'default',
      runtime: null,
    })
  }

  async executeToolCall(
    tool: { arguments: unknown, name: string },
    entityId: Optional<string> = null,
  ): Promise<string> {
    const toolSchema = await this.getToolsSchema({ actions: [tool.name] })
    const appName = toolSchema[0]?.appName?.toLowerCase()
    const connectedAccountId = appName && this.connectedAccountIds?.[appName]

    return JSON.stringify(
      await this.executeAction({
        action: tool.name,
        connectedAccountId,
        entityId: entityId ?? this.entityId,
        params:
          typeof tool.arguments === 'string'
            ? JSON.parse(tool.arguments) as Record<string, unknown>
            : tool.arguments as Record<string, unknown>,
      }),
    )
  }

  async getTools(
    filters: {
      actions?: Array<string>
      apps?: Array<string>
      filterByAvailableApps?: Optional<boolean>
      integrationId?: Optional<string>
      tags?: Optional<Array<string>>
      useCase?: Optional<string>
      useCaseLimit?: Optional<number>
    },
    entityId: Optional<string> = null,
  ): Promise<Tool[]> {
    const {
      actions,
      apps,
      filterByAvailableApps,
      tags,
      useCase,
      useCaseLimit,
    } = ZExecuteToolCallParams.parse(filters)

    const actionsList = await this.getToolsSchema(
      {
        actions,
        apps,
        filterByAvailableApps,
        tags,
        useCase,
        useCaseLimit,
      },
      entityId,
      filters.integrationId,
    )

    return actionsList.map(actionSchema => this.generateTool(
      actionSchema,
      entityId,
    ))
  }

  private generateTool(
    schema: RawActionData,
    entityId: Optional<string> = null,
  ) {
    return {
      execute: async params => this.executeToolCall(
        {
          arguments: JSON.stringify(params),
          name: schema.name,
        },
        entityId ?? this.entityId,
      ),
      function: {
        description: schema.description,
        name: schema.name,
        parameters: schema.parameters,
        strict: true,
      },
      type: 'function',
    } satisfies Tool
  }
}
``` ## Examples ```
import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'

import { XSAIToolSet } from './utils/xsai-tool-set'

const toolset = new XSAIToolSet()

const tools = await toolset.getTools({ apps: ['github'] })

const result = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  maxSteps: 5,
  model: 'gpt-4o-mini',
  messages: [{
    role: 'user',
    content: 'Star the repository "moeru-ai/xsai"',
  }],
  tools,
  toolChoice: 'required',
  temperature: 0,
})

console.log(result.steps)
console.log(result.text)
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/integrations/tools/composio.mdx)[unspeech](https://github.com/moeru-ai/unspeech/tree/main/sdk/typescript)[Previous Page](https://github.com/moeru-ai/unspeech/tree/main/sdk/typescript)[Model Context Protocol](/docs/integrations/tools/model-context-protocol)[Model Context Protocol adapter for xsAI.](/docs/integrations/tools/model-context-protocol)

---

## Model Context Protocol

**URL**: https://xsai.js.org/docs/integrations/tools/model-context-protocol

Tools # Model Context Protocol Model Context Protocol adapter for xsAI. > This code is untested, feel free to test it yourself and provide feedback. npmpnpmyarnbun ```
npm i @modelcontextprotocol/sdk @xsai/tool
``` ```
import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import type { Tool } from "@xsai/shared-chat";

export const getTools = (mcpServers: Record<string, Client>): Promise<Tool[]> =>
  Promise.all(
    Object.entries(mcpServers)
      .map(([serverName, client]) =>
        client
          .listTools()
          .then(({ tools }) =>
            tools.map(({ description, inputSchema, name }) => ({
              execute: (args: unknown) =>
                client.callTool({
                  arguments: args as Record<string, unknown>,
                  name,
                }).then((res) => JSON.stringify(res)),
              function: {
                description,
                name: name === serverName ? name : `${serverName}_${name}`,
                parameters: inputSchema,
                strict: true,
              },
              type: "function",
            } satisfies Tool))
          )
      ),
  ).then((tools) => tools.flat());
``` ## Examples ```
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

import { getTools } from './utils/get-tools'

const transport = new StdioClientTransport({ command: 'node', args: ['server.js'] })
const client = new Client({ name: 'example-client', version: '1.0.0' })

await client.connect(transport)

const tools = await getTools({ example: client })
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/integrations/tools/model-context-protocol.mdx)[Composio](/docs/integrations/tools/composio)[Composio adapter for xsAI.](/docs/integrations/tools/composio)[@xsai/embed](https://doc.deno.land/https://esm.sh/@xsai/embed)[Next Page](https://doc.deno.land/https://esm.sh/@xsai/embed)

---
