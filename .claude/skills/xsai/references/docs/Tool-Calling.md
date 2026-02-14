# Tool Calling

**URL**: https://xsai.js.org/docs/packages/tool

---

# Tool Calling Connect LLMs to external data and systems.![install size](https://flat.badgen.net/packagephobia/install/@xsai/tool?color=gray)![minified size](https://flat.badgen.net/bundlephobia/min/@xsai/tool?color=gray)![minzipped size](https://flat.badgen.net/bundlephobia/minzip/@xsai/tool?color=gray) npmpnpmyarnbun ```
npm i @xsai/tool
``` ## Examples ### tool accepts a `StandardSchemaV1`, automatically infers the type. For convenience, we use `valibot` as an example. But this package uses `xsschema` internally, so it supports any schema library that xsschema supports: e.g. `zod`, `valibot`, `arktype`, etc. See[xsschema](../packages-top/xsschema) for more information. These below examples require you to install a standard schema to json schema parser (a separate package). As they are not provided by zod or valibot natively. Read more about them[here](../packages-top/xsschema#coverage) ```
import { generateText } from '@xsai/generate-text'
import { tool } from '@xsai/tool'
import { env } from 'node:process'
import * as v from 'valibot'

const weather = await tool({
  description: 'Get the weather in a location',
  execute: ({ location }) => JSON.stringify({
    location,
    temperature: 42,
  }),
  name: 'weather',
  parameters: v.object({
    location: v.pipe(
      v.string(),
      v.description('The location to get the weather for'),
    ),
  }),
})

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  maxSteps: 2, 
  messages: [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
    {
      content: 'What is the weather in San Francisco?',
      role: 'user',
    },
  ],
  model: 'gpt-4o',
  tools: [weather], 
})
``` ### rawTool accepts a `JsonSchema`, execute params type to be defined manually. ```
import { generateText } from '@xsai/generate-text'
import { rawTool } from '@xsai/tool'
import { env } from 'node:process'

const weather = rawTool<{ location: string }>({
  description: 'Get the weather in a location',
  execute: ({ location }) => JSON.stringify({
    location,
    temperature: 42,
  }),
  name: 'weather',
  parameters: {
    additionalProperties: false,
    properties: {
      location: {
        description: 'The location to get the weather for',
        type: 'string',
      },
    },
    required: [
      'location',
    ],
    type: 'object',
  },
})

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  maxSteps: 2, 
  messages: [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
    {
      content: 'What is the weather in San Francisco?',
      role: 'user',
    },
  ],
  model: 'gpt-4o',
  tools: [weather], 
})
``` You can also use it like this to avoid `tool`'s asynchronous contagion: ```
import type { RawToolOptions } from '@xsai/tool'

import { rawTool } from '@xsai/tool'
import * as z from 'zod'

const weatherSchema = z.object({
  location: z
    .string()
    .describe('The location to get the weather for'),
})

const weather = rawTool<z.input<typeof weatherSchema>>({
  description: 'Get the weather in a location',
  execute: ({ location }) => JSON.stringify({
    location,
    temperature: 42,
  }),
  name: 'weather',
  parameters: z.toJSONSchema(weatherSchema) as unknown as RawToolOptions['parameters'],
})
``` ### Tool You can also pass an object directly without installing `@xsai/tool`. ```
import type { Tool } from '@xsai/shared-chat'

import { generateText } from '@xsai/generate-text'
import { env } from 'node:process'

const weather = {
  execute: (({ location }) => JSON.stringify({
    location,
    temperature: 42,
  })) as Tool['execute'], 
  function: {
    description: 'Get the weather in a location',
    name: 'weather',
    parameters: {
      additionalProperties: false,
      properties: {
        location: {
          description: 'The location to get the weather for',
          type: 'string',
        },
      },
      required: [
        'location',
      ],
      type: 'object',
    },
    strict: true,
  },
  type: 'function',
} satisfies Tool

const { text } = await generateText({
  apiKey: env.OPENAI_API_KEY!,
  baseURL: 'https://api.openai.com/v1/',
  maxSteps: 2, 
  messages: [
    {
      content: 'You are a helpful assistant.',
      role: 'system',
    },
    {
      content: 'What is the weather in San Francisco?',
      role: 'user',
    },
  ],
  model: 'gpt-4o',
  tools: [weather], 
})
``` Zod example: ```
import type { Tool } from '@xsai/shared-chat'

import * as z from 'zod'

const weatherSchema = z.object({
  location: z
    .string()
    .describe('The location to get the weather for'),
})

const weather = {
  execute: (input) => JSON.stringify({
    location: (input as z.input<typeof weatherSchema>).location,
    temperature: 42,
  }),
  function: {
    description: 'Get the weather in a location',
    name: 'weather',
    parameters: z.toJSONSchema(weatherSchema) as unknown as Record<string, unknown>, 
  },
  type: 'function',
} satisfies Tool
``` ### overrides `await tool()`, `rawTool()` ultimately returns a `Tool` object, so you can modify it freely. ```
import { generateText } from '@xsai/generate-text'
import { tool } from '@xsai/tool'
import { env } from 'node:process'
import * as v from 'valibot'

const parameters = v.object({
  location: v.pipe(
    v.string(),
    v.description('The location to get the weather for'),
  ),
})

const weather = await tool({
  description: 'Get the weather in a location',
  execute: ({ location }) => JSON.stringify({
    location,
    temperature: 42,
  }),
  name: 'weather',
  parameters,
})

weather.execute = (input) => JSON.stringify({
  location: (input as v.InferInput<typeof parameters>).location,
  temperature: 5500,
})
```[Edit on GitHub](https://github.com/moeru-ai/xsai/blob/main/docs/content/docs/packages/tool.mdx)[Transcription](/docs/packages/stream/transcription)[Transcribes audio into the input language.](/docs/packages/stream/transcription)[Models](/docs/packages/model)[List and describe the various models available in the API.](/docs/packages/model)
