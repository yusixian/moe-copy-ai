# Models

**URL**: https://xsai.js.org/docs/packages/model

---

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
