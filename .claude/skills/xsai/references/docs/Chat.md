# Chat

**URL**: https://xsai.js.org/docs/packages/utils/chat

---

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
