# Transcription

**URL**: https://xsai.js.org/docs/packages/generate/transcription

---

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
