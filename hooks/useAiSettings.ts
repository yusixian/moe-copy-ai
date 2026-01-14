import { listModels } from "@xsai/model"
import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { toast } from "react-toastify"

import { syncStorage } from "~utils/storage"

export interface ModelInfo {
  id: string
  owned_by?: string
}

const DEFAULT_BASE_URL = "https://api.openai.com/v1/"
const DEFAULT_SYSTEM_PROMPT =
  "摘要任务：提取核心观点并总结要点\n链接：{{url}}\n标题：{{title}}\n内容：{{cleanedContent}}"

export function useAiSettings() {
  const [apiKey, setApiKey] = useState("")
  const [baseURL, setBaseURL] = useState(DEFAULT_BASE_URL)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [model, setModel] = useState<string | null>(null)
  const [modelList, setModelList] = useState<ModelInfo[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // 使用 ref 保持最新值，解决闭包问题
  const stateRef = useRef({ apiKey, baseURL, model })
  stateRef.current = { apiKey, baseURL, model }

  // 获取模型列表（可选参数用于初始加载时传入）
  const fetchModels = useCallback(
    async (
      showToast = true,
      overrides?: { apiKey?: string; baseURL?: string; model?: string | null }
    ) => {
      const currentApiKey = overrides?.apiKey ?? stateRef.current.apiKey
      const currentBaseURL = overrides?.baseURL ?? stateRef.current.baseURL
      const currentModel = overrides?.model ?? stateRef.current.model

      if (!currentApiKey) {
        if (showToast) toast.warning("请先填写API密钥")
        return
      }

      if (!currentBaseURL) {
        if (showToast) toast.warning("请先填写API基础URL")
        return
      }

      setIsLoadingModels(true)
      try {
        const models = await listModels({
          apiKey: currentApiKey,
          baseURL: currentBaseURL
        })

        setModelList(models)

        // 仅当没有已保存模型时才设置默认模型
        if (models.length > 0 && !currentModel) {
          setModel(models[0].id)
        }

        if (showToast) toast.success("模型列表加载成功")
      } catch (error) {
        console.error("获取模型列表失败:", error)
        if (showToast) toast.error("获取模型列表失败，请检查API设置")
      } finally {
        setIsLoadingModels(false)
      }
    },
    []
  )

  // 加载设置
  const loadSettings = useCallback(async () => {
    try {
      const savedApiKey = await syncStorage.get<string>("ai_api_key")
      const savedBaseURL = await syncStorage.get<string>("ai_base_url")
      const savedPrompt = await syncStorage.get<string>("ai_system_prompt")
      const savedModel = await syncStorage.get<string>("ai_model")

      if (savedApiKey) setApiKey(savedApiKey)
      if (savedBaseURL) setBaseURL(savedBaseURL)
      if (savedPrompt) setSystemPrompt(savedPrompt)
      if (savedModel) setModel(savedModel)

      setIsLoaded(true)

      // 如果有配置，静默加载模型列表
      if (savedApiKey && savedBaseURL) {
        fetchModels(false, {
          apiKey: savedApiKey,
          baseURL: savedBaseURL,
          model: savedModel
        })
      }
    } catch (error) {
      console.error("加载AI设置出错:", error)
      setIsLoaded(true)
    }
  }, [fetchModels])

  // 保存设置
  const saveSettings = useCallback(async () => {
    try {
      await syncStorage.set("ai_api_key", apiKey)
      await syncStorage.set("ai_base_url", baseURL)
      await syncStorage.set("ai_system_prompt", systemPrompt)
      await syncStorage.set("ai_model", model)
      toast.success("AI设置已保存")
    } catch (error) {
      toast.error("保存设置失败")
      console.error("保存AI设置出错:", error)
    }
  }, [apiKey, baseURL, systemPrompt, model])

  // 初始化加载
  useLayoutEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    // 状态
    apiKey,
    baseURL,
    systemPrompt,
    model,
    modelList,
    isLoadingModels,
    isLoaded,

    // Setters
    setApiKey,
    setBaseURL,
    setSystemPrompt,
    setModel,

    // 操作
    loadSettings,
    saveSettings,
    fetchModels
  }
}
