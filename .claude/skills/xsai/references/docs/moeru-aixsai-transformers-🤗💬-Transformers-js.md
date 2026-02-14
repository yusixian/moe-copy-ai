# moeru-ai/xsai-transformers: 🤗💬 Transformers.js provider for xsAI. Running Embedding, Whisper, and LLMs right in your browser!

**URL**: https://github.com/moeru-ai/xsai-transformers

---

## xsAI 🤗 Transformers.js Provider >[Playground in Browser](https://xsai-transformers.netlify.app/#/) A special[Transformers.js](https://huggingface.co/docs/transformers.js/en/index) provider for[`xsai`](https://github.com/moeru-ai/xsai), the extra-small AI SDK. Capable of performing tasks of embedding, transcriptions, speech synthesis, and text generations right in the browser (Node.js supported too).[![npm version](https://camo.githubusercontent.com/d6e7f24d9bd6ae8b4d8cb38a7c5a24f78076c619fb9db53c6c05b7a96d4becdf/68747470733a2f2f666c61742e62616467656e2e6e65742f6e706d2f762f787361692d7472616e73666f726d6572733f636f6c6f723d6379616e)](https://npmjs.com/package/xsai-transformers)[![npm downloads](https://camo.githubusercontent.com/26943ea052f722985ee2ff05340fbb0f531133f884c2afeae7baef3d7f845047/68747470733a2f2f666c61742e62616467656e2e6e65742f6e706d2f646d2f787361692d7472616e73666f726d6572733f636f6c6f723d6379616e)](https://npm.chart.dev/xsai-transformers)[![bundle size](https://camo.githubusercontent.com/c7169eb258bf05a654891c51ffffde92568e013e511ff84a41d3aa7059a477ad/68747470733a2f2f666c61742e62616467656e2e6e65742f62756e646c6570686f6269612f6d696e7a69702f787361692d7472616e73666f726d6572733f636f6c6f723d6379616e)](https://bundlephobia.com/package/xsai-transformers)[![license](https://camo.githubusercontent.com/8e536a9c0900bc7bcae81077672bd1d0eafee1a1892dc90914695c395f55384e/68747470733a2f2f666c61742e62616467656e2e6e65742f6769746875622f6c6963656e73652f6d6f6572752d61692f787361692d7472616e73666f726d6572733f636f6c6f723d6379616e)](https://github.com/moeru-ai/xsai-transformers/blob/main/LICENSE.md) xsAI Transformers.js Provider aligned the API of xsAI: ```
import { createEmbedProvider } from '@xsai-transformers/embed'
import embedWorkerURL from '@xsai-transformers/embed/worker?worker&url'
import { embed } from '@xsai/embed'

const transformers = createEmbedProvider({ baseURL: `xsai-transformers:///?worker-url=${embedWorkerURL}` })

// [
//   -0.038177140057086945,
//   0.032910916954278946,
//   -0.005459371022880077,
//   // ...
// ]
const { embedding } = await embed({
  ...transformers.embed('Xenova/all-MiniLM-L6-v2'),
  input: 'sunny day at the beach'
})
``` ## Features `xsai-transformers` is just a wrapper for[🤗 Transformers.js](https://huggingface.co/docs/transformers.js/en/index). Any HuggingFace available models are possible to inference with if ONNX format of model is prepared. While enjoying the lightweight size and compositing of APIs from xsAI, we made every possible `xsai-transformers` sub-providers (embedding, transcription, speech) compatible to existing xsAI implementation, this means, for either `xsai` or `@xsai/generate-transcription`, `@xsai/embed`, there is no need to re-write everything to get on hands of `xsai-transformers`, the only needed thing is to install and go. ### Runtime-agnostic `xsai-transformers` doesn't depend on WebGPU or Browser Built-in Modules, it works well in Node.js and other runtimes, as long as Worker thread of WebGPU are ported and supported.. ## Usage ### Install > Just like xsAI's atomic design of every feature, you can also install only some of the utils of `xsai-transformers`, such as `@xsai-transformers/embed` and `@xsai-transformers/transcription`. ```
# npm
npm install xsai-transformers

# yarn
yarn add xsai-transformers

# pnpm
pnpm install xsai-transformers

# bun
bun install xsai-transformers

# deno
deno install xsai-transformers
``` ### Examples ###### Embedding (see above) ###### Transcription ```
import { createTranscriptionProvider } from '@xsai-transformers/transcription'
import transcriptionWorkerURL from '@xsai-transformers/transcription/worker?worker&url'
import { generateTranscription } from '@xsai/generate-transcription'

const transformers = createTranscriptionProvider({ baseURL: `xsai-transformers:///?worker-url=${transcriptionWorkerURL}}` })
const file: File = undefined // Audio file
const { text } = await generateTranscription({ ...transformers.transcribe('onnx-community/whisper-large-v3-turbo'), file })
``` ### Status xsAI[Transformers.js](https://huggingface.co/docs/transformers.js/en/index) is currently in an early stage of development and may introduce breaking changes at any time. ## License[MIT](https://github.com/moeru-ai/xsai-transformers/blob/main/LICENSE.md)
