# Telemetry

**URL**: https://xsai.js.org/docs/packages-ext/telemetry

---

# Telemetry![install size](https://flat.badgen.net/packagephobia/install/@xsai-ext/telemetry?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai-ext/telemetry?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai-ext/telemetry?color=gray) npmpnpmyarnbun ```
npm i @xsai-ext/telemetry
``` ## Usage > `@xsai/telemetry` exports everything from `xsai`, so you can use it for overrides. > > Currently, telemetry only supports `generateText` and `streamText`. Simply switch the import. ```
- import { generateText, streamText } from 'xsai'
+ import { generateText, streamText } from '@xsai-ext/telemetry'
``` You can also configure additional telemetry options: ```
import { generateText } from '@xsai-ext/telemetry'
import { env } from 'node:process'

const instructions = 'You\'re a helpful assistant.'

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  messages: [
    {
      content: instructions, 
      role: 'system'
    },
    {
      content: 'Why is the sky blue?',
      role: 'user'
    }
  ],
  model: 'gpt-4o',
  telemetry: { 
    attributes: { 
      'gen_ai.agent.name': 'weather-assistant', 
      'gen_ai.agent.description': instructions, 
    }, 
  }, 
})
``` xsAI Telemetry is based on[GenAI Attributes](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/).[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages-ext/telemetry.mdx)[Providers](/docs/packages-ext/providers)[Collection of predefined providers.](/docs/packages-ext/providers)[xsai-use](https://github.com/moeru-ai/xsai-use)[Next Page](https://github.com/moeru-ai/xsai-use)
