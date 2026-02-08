# Speech

**URL**: https://xsai.js.org/docs/packages/generate/speech

---

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
