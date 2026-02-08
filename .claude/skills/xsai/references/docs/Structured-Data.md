# Structured Data

**URL**: https://xsai.js.org/docs/packages/generate/object

---

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
