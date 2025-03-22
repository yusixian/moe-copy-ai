import { Icon } from "@iconify/react"
import { listModels } from "@xsai/model"
import { useCallback, useLayoutEffect, useState } from "react"
import { toast } from "react-toastify"

import { Storage } from "@plasmohq/storage"

import { debugLog } from "~utils/logger"

import OptionSection from "./OptionSection"

// 创建存储实例
const storage = new Storage({ area: "sync" })

// AI设置组件
function AiSettingsSection() {
  const [apiKey, setApiKey] = useState<string>("")
  const [baseURL, setBaseURL] = useState<string>("https://api.openai.com/v1/")
  const [defaultSystemPrompt, setDefaultSystemPrompt] = useState<string>(
    "你是一个专业的文章摘要助手，请提炼文章的核心观点，总结要点。"
  )
  const [model, setModel] = useState<string | null>(null)
  const [showTips, setShowTips] = useState(false)
  const [modelList, setModelList] = useState<
    { id: string; object: string; created: number; owned_by: string }[]
  >([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)

  // 加载保存的设置
  const loadSettings = useCallback(async () => {
    try {
      const savedApiKey = await storage.get<string>("ai_api_key")
      const savedBaseURL = await storage.get<string>("ai_base_url")
      const savedPrompt = await storage.get<string>("ai_system_prompt")
      const savedModel = await storage.get<string>("ai_model")

      if (savedApiKey) setApiKey(savedApiKey)
      if (savedBaseURL) setBaseURL(savedBaseURL)
      if (savedPrompt) setDefaultSystemPrompt(savedPrompt)
      if (savedModel) setModel(savedModel)

      // 如果有保存的API密钥和基础URL，尝试加载模型列表
      if (savedApiKey && savedBaseURL) {
        fetchModelList(savedApiKey, savedBaseURL)
      }
    } catch (error) {
      console.error("加载AI设置出错:", error)
    }
  }, [storage])

  // 获取模型列表
  const fetchModelList = useCallback(
    async (key: string, url: string) => {
      debugLog("尝试加载模型列表")
      if (!key) {
        toast.warning("请先填写API密钥")
        return
      }

      if (!url) {
        toast.warning("请先填写API基础URL")
        return
      }

      setIsLoadingModels(true)
      try {
        const models = await listModels({
          apiKey: key,
          baseURL: url
        })

        debugLog("模型列表加载成功，模型如下", models)
        setModelList(models)
        toast.success("模型列表加载成功 (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧")
      } catch (error) {
        console.error("获取模型列表失败:", error)
        toast.error("获取模型列表失败，请检查API设置 (╥﹏╥)")
      } finally {
        setIsLoadingModels(false)
      }
    },
    [storage]
  )

  // 保存设置
  const saveSettings = useCallback(async () => {
    try {
      await storage.set("ai_api_key", apiKey)
      await storage.set("ai_base_url", baseURL)
      await storage.set("ai_system_prompt", defaultSystemPrompt)
      await storage.set("ai_model", model)
      toast.success("AI设置已保存 (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧")
    } catch (error) {
      toast.error("保存设置失败 (╥﹏╥)")
      console.error("保存AI设置出错:", error)
    }
  }, [apiKey, baseURL, defaultSystemPrompt, model, storage])

  useLayoutEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <OptionSection title="AI设置" icon="line-md:ai">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          配置AI接口相关设置，让AI助手更好地为您服务(๑•̀ㅂ•́)و✧
        </span>
        <button
          className="flex items-center rounded-md border border-sky-200 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-600 transition-colors hover:bg-sky-100 hover:text-sky-700"
          onClick={() => setShowTips(!showTips)}>
          <Icon
            icon={showTips ? "mdi:eye-off-outline" : "mdi:eye-outline"}
            className="mr-1.5"
            width={18}
          />
          {showTips ? "隐藏小贴士" : "查看小贴士"}
        </button>
      </div>

      <div
        className={`origin-top transform transition-all duration-300 ease-in-out ${
          showTips
            ? "mb-4 max-h-[300px] scale-100 opacity-100"
            : "scale-98 mb-0 max-h-0 overflow-hidden opacity-0"
        }`}>
        <div className="rounded-lg border border-sky-100 bg-sky-50 p-3">
          <strong className="mb-2 flex items-center text-sky-700">
            <Icon icon="mdi:information-outline" className="mr-1" width={16} />
            AI接口小贴士：
          </strong>
          <ol className="ml-5 list-decimal space-y-1 text-gray-600">
            <li>API密钥请妥善保管，不要泄露给他人 (•̀ᴗ•́)و</li>
            <li>
              不同模型的能力和价格不同，请根据需要选择合适的模型，并注意 token
              消耗
            </li>
            <li>系统提示词决定了 AI 助手的行为方式，可以根据需要自定义</li>
          </ol>
        </div>
      </div>

      <div className="rounded-lg border border-sky-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <Icon
                icon="mdi:key-outline"
                className="mr-1.5 inline"
                width={18}
              />
              apikey （API 密钥）
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <Icon icon="mdi:web" className="mr-1.5 inline" width={18} />
              baseURL (API 基础 URL)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="https://api.openai.com/v1/"
              />
              <button
                onClick={() => fetchModelList(apiKey, baseURL)}
                disabled={isLoadingModels}
                className="flex items-center rounded-md bg-sky-100 px-3 py-2 text-sm font-medium text-sky-600 transition-colors hover:bg-sky-200 hover:text-sky-700 disabled:opacity-50">
                <Icon
                  icon={isLoadingModels ? "mdi:loading" : "mdi:refresh"}
                  className={`mr-1.5 ${isLoadingModels ? "animate-spin" : ""}`}
                  width={18}
                />
                获取模型
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <Icon
                icon="mdi:robot-excited-outline"
                className="mr-1.5 inline"
                width={18}
              />
              AI模型
            </label>
            {modelList.length > 0 ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200">
                {modelList.map((m) => (
                  <option key={m.id + m.owned_by} value={m.id}>
                    {m.id} ({m.owned_by})
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  placeholder="gpt-3.5-turbo"
                />
                <p className="text-xs text-amber-500">
                  请点击"获取模型"按钮获取可用模型列表
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              <Icon
                icon="mdi:message-text-outline"
                className="mr-1.5 inline"
                width={18}
              />
              默认系统提示词
            </label>
            <textarea
              value={defaultSystemPrompt}
              onChange={(e) => setDefaultSystemPrompt(e.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="你是一个专业的文章摘要助手，请提炼文章的核心观点，总结要点。"
            />
            <p className="mt-1 text-xs text-gray-500">
              系统提示词用于定义AI助手的行为和能力(๑乛◡乛๑)
            </p>
          </div>

          <button
            onClick={saveSettings}
            className="flex items-center justify-center rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-300">
            <Icon
              icon="mdi:content-save-outline"
              className="mr-1.5"
              width={18}
            />
            保存设置
          </button>
        </div>
      </div>
    </OptionSection>
  )
}

export default AiSettingsSection
