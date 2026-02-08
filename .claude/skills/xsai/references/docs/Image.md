# Image

**URL**: https://xsai.js.org/docs/packages/generate/image

---

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
