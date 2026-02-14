# xsfetch

**URL**: https://xsai.js.org/docs/packages-top/xsfetch

---

# xsfetch extra-small Fetch API with auto retry.![install size](https://flat.badgen.net/packagephobia/install/xsfetch?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/xsfetch?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/xsfetch?color=gray) npmpnpmyarnbun ```
npm i xsfetch
``` ## Usage ### createFetch ```
import { createFetch } from 'xsfetch'

const fetch = createFetch({
  retry: 3,
  retryDelay: 1000,
})
``` ### createFetch with generateText ```
import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'
import { createFetch } from 'xsfetch'

const fetch = createFetch({
  retry: 3,
  retryDelay: 1000,
})

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  fetch, 
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
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages-top/xsfetch.mdx)[xsai](/docs/packages-top/xsai)[A package containing all the core xsAI tools.](/docs/packages-top/xsai)[xsschema](/docs/packages-top/xsschema)[extra-small, Standard Schema-based alternative to typeschema.](/docs/packages-top/xsschema)
