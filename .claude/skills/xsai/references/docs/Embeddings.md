# Embeddings

**URL**: https://xsai.js.org/docs/packages/embed

---

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
