# Transcription

**URL**: https://xsai.js.org/docs/packages/stream/transcription

---

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
