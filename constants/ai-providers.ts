export interface AiProvider {
  id: string
  name: string
  baseURL: string
  icon: string
}

export const AI_PROVIDERS: AiProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    icon: "simple-icons:openai"
  },
  {
    id: "anthropic",
    name: "Anthropic",
    baseURL: "https://api.anthropic.com/v1",
    icon: "simple-icons:anthropic"
  },
  {
    id: "gemini",
    name: "Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    icon: "simple-icons:googlegemini"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    baseURL: "https://api.deepseek.com/v1",
    icon: "ri:deepseek-fill"
  },
  {
    id: "xai",
    name: "xAI",
    baseURL: "https://api.x.ai/v1",
    icon: "simple-icons:x"
  },
  {
    id: "ollama",
    name: "Ollama",
    baseURL: "http://localhost:11434/v1",
    icon: "simple-icons:ollama"
  },
  {
    id: "mistral",
    name: "Mistral",
    baseURL: "https://api.mistral.ai/v1",
    icon: "simple-icons:mistralai"
  },
  {
    id: "groq",
    name: "Groq",
    baseURL: "https://api.groq.com/openai/v1",
    icon: "lucide:zap"
  },
  {
    id: "perplexity",
    name: "Perplexity",
    baseURL: "https://api.perplexity.ai",
    icon: "simple-icons:perplexity"
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    icon: "simple-icons:openrouter"
  }
]

export function getProviderByBaseURL(url: string): AiProvider | undefined {
  const normalized = url.replace(/\/+$/, "")
  return AI_PROVIDERS.find((p) => p.baseURL.replace(/\/+$/, "") === normalized)
}
