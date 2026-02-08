# Providers

**URL**: https://xsai.js.org/docs/packages-ext/providers

---

# Providers Collection of predefined providers. This package is not recommended for xsAI-based libraries, which can increase the size of the installation. <!----> npmpnpmyarnbun ```
npm i @xsai-ext/providers
``` ## Usage ### Predefined > It reads the API Key from the environment variables via `process.env`, so it cannot be used in a browser. ```
import { google } from '@xsai-ext/providers'
import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'

const { text } = await generateText({
  ...google.chat('gemini-2.5-flash'), 
  apiKey: env.GEMINI_API_KEY!, 
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/', 
  messages: [{
    content: 'Why is the sky blue?',
    role: 'user'
  }],
  model: 'gemini-2.5-flash', 
})
``` ### Create You can also import a create function instead of a predefined provider, making it runtime-agnostic: ```
// import { google } from '@xsai-ext/providers'
import { createGoogleGenerativeAI } from '@xsai-ext/providers/create'
import { generateText } from '@xsai/generate-text'

const google = createGoogleGenerativeAI('YOUR_API_KEY_HERE') 

const { text } = await generateText({
  ...google.chat('gemini-2.5-flash'),
  messages: [{
    content: 'Why is the sky blue?',
    role: 'user'
  }],
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages-ext/providers.mdx)[xsschema](/docs/packages-top/xsschema)[extra-small, Standard Schema-based alternative to typeschema.](/docs/packages-top/xsschema)[Telemetry](/docs/packages-ext/telemetry)[Next Page](/docs/packages-ext/telemetry)
