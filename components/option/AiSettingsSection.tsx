import { Icon } from "@iconify/react"
import { useState } from "react"

import { useAiSettings } from "~hooks/useAiSettings"

import { ModelSelectInput } from "../ai/ModelSelectInput"
import OptionSection from "./OptionSection"

function AiSettingsSection() {
  const [showTips, setShowTips] = useState(false)

  const {
    apiKey,
    setApiKey,
    baseURL,
    setBaseURL,
    systemPrompt,
    setSystemPrompt,
    model,
    setModel,
    modelList,
    isLoadingModels,
    fetchModels,
    saveSettings
  } = useAiSettings()

  return (
    <OptionSection title="AI设置" icon="line-md:ai">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sky-500 text-sm">
          配置AI接口相关设置，让AI助手更好地为您服务(๑•̀ㅂ•́)و✧
        </span>
        <button
          className="flex items-center rounded-md border border-sky-200 bg-blue-50 px-3 py-1.5 font-medium text-sky-600 text-sm transition-colors hover:bg-sky-100 hover:text-sky-700"
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
            : "mb-0 max-h-0 scale-98 overflow-hidden opacity-0"
        }`}>
        <div className="rounded-lg border border-sky-200 bg-blue-50 p-3">
          <strong className="mb-2 flex items-center text-sky-600">
            <Icon icon="mdi:information-outline" className="mr-1" width={16} />
            小贴士：
          </strong>
          <ol className="ml-5 list-decimal space-y-1 text-sky-500">
            <li>API密钥请妥善保管，不要泄露给他人 (•̀ᴗ•́)و</li>
            <li>
              不同模型的能力和价格不同，请根据需要选择合适的模型，并注意 token
              消耗
            </li>
            <li>目前仅针对 ds 的 api 测试过，本地 ollama 等后续支持</li>
          </ol>
        </div>
      </div>

      <div className="space-y-4">
        <div className="mb-4">
          <label className="mb-2 block font-medium text-sky-600">
            <Icon icon="mdi:key-outline" className="mr-1.5 inline" width={18} />
            apikey （API 密钥）
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full rounded-lg border border-sky-200 bg-blue-50 p-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="sk-..."
          />
          <p className="mt-2 text-sky-500 text-sm">
            请输入您的API密钥，用于访问AI服务
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-sky-600">
            <Icon icon="mdi:web" className="mr-1.5 inline" width={18} />
            baseURL (API 基础 URL)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              className="flex-1 rounded-lg border border-sky-200 bg-blue-50 p-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              placeholder="https://api.openai.com/v1/"
            />
            <button
              onClick={() => fetchModels()}
              disabled={isLoadingModels}
              className="flex items-center rounded-lg border border-sky-200 bg-blue-50 px-3 py-2 font-medium text-sky-600 text-sm transition-colors hover:bg-sky-100 hover:text-sky-700 disabled:opacity-50">
              <Icon
                icon={isLoadingModels ? "mdi:loading" : "mdi:refresh"}
                className={`mr-1.5 ${isLoadingModels ? "animate-spin" : ""}`}
                width={18}
              />
              获取模型
            </button>
          </div>
          <p className="mt-2 text-sky-500 text-sm">请输入API服务的基础URL</p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-sky-600">
            <Icon
              icon="mdi:robot-excited-outline"
              className="mr-1.5 inline"
              width={18}
            />
            AI 模型
          </label>
          <ModelSelectInput
            value={model}
            onChange={setModel}
            options={modelList}
          />
          <p className="mt-2 text-sky-500 text-sm">选择或输入要使用的AI模型</p>
        </div>

        <div className="mb-4">
          <label className="mb-2 block font-medium text-sky-600">
            <Icon
              icon="mdi:message-text-outline"
              className="mr-1.5 inline"
              width={18}
            />
            默认系统提示词
          </label>
          <textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-sky-200 bg-blue-50 p-2.5 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            placeholder="你是一个专业的文章摘要助手，请提炼文章的核心观点，总结要点。"
          />
          <p className="mt-2 text-sky-500 text-sm">
            系统提示词用于定义AI助手的行为和能力，不过这里的系统提示词不算系统提示词，还是作为
            user prompt 的一部分
          </p>
        </div>

        <button
          onClick={saveSettings}
          className="flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300">
          <Icon icon="mdi:content-save-outline" className="mr-1.5" width={18} />
          保存设置
        </button>
      </div>
    </OptionSection>
  )
}

export default AiSettingsSection
