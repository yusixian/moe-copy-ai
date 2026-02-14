# Text

**URL**: https://xsai.js.org/docs/packages/generate/text

---

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
