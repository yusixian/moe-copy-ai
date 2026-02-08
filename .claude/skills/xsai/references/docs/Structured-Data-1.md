# Structured Data

**URL**: https://xsai.js.org/docs/packages/stream/object

---

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
