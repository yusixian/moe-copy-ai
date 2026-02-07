import { Icon } from "@iconify/react"
import { useState } from "react"

import { Button } from "~/components/ui/button"
import { useAiSettings } from "~hooks/useAiSettings"
import { useI18n } from "~utils/i18n"

import { ModelSelectInput } from "../ai/ModelSelectInput"
import OptionSection from "./OptionSection"
import PromptTemplateManager from "./PromptTemplateManager"

function AiSettingsSection() {
  const { t } = useI18n()
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
    <OptionSection title={t("option.ai.title")} icon="line-md:ai">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-text-2">{t("option.ai.desc")}</span>
        <Button
          variant="outline"
          size="xs"
          onClick={() => setShowTips(!showTips)}>
          <Icon
            icon={showTips ? "mdi:eye-off-outline" : "mdi:eye-outline"}
            className="mr-1"
            width={14}
          />
          {showTips ? t("option.ai.tips.hide") : t("option.ai.tips.show")}
        </Button>
      </div>

      <div
        className={`origin-top transform transition-all duration-300 ease-in-out ${
          showTips
            ? "mb-4 max-h-[300px] scale-100 opacity-100"
            : "mb-0 max-h-0 scale-98 overflow-hidden opacity-0"
        }`}>
        <div className="rounded-lg border border-info/20 bg-info-ghost p-3">
          <strong className="mb-2 flex items-center text-info">
            <Icon icon="mdi:information-outline" className="mr-1" width={16} />
            {t("option.ai.tips.title")}
          </strong>
          <ol className="ml-5 list-decimal space-y-1 text-info">
            <li>{t("option.ai.tips.tip1")}</li>
            <li>{t("option.ai.tips.tip2")}</li>
            <li>{t("option.ai.tips.tip3")}</li>
          </ol>
        </div>
      </div>

      <div className="space-y-4">
        <div className="mb-4">
          <label
            htmlFor="ai-api-key"
            className="mb-2 block font-medium text-text-1">
            <Icon icon="mdi:key-outline" className="mr-1.5 inline" width={18} />
            {t("option.ai.apiKey.label")}
          </label>
          <input
            id="ai-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full rounded-lg border border-line-1 bg-content p-2.5 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
            placeholder={t("option.ai.apiKey.placeholder")}
          />
          <p className="mt-2 text-sm text-text-2">
            {t("option.ai.apiKey.helper")}
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="ai-base-url"
            className="mb-2 block font-medium text-text-1">
            <Icon icon="mdi:web" className="mr-1.5 inline" width={18} />
            {t("option.ai.baseUrl.label")}
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="ai-base-url"
              type="text"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              className="flex-1 rounded-lg border border-line-1 bg-content p-2.5 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
              placeholder={t("option.ai.baseUrl.placeholder")}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchModels()}
              disabled={isLoadingModels}>
              <Icon
                icon={isLoadingModels ? "mdi:loading" : "mdi:refresh"}
                className={`mr-1.5 ${isLoadingModels ? "animate-spin" : ""}`}
                width={18}
              />
              {t("option.ai.baseUrl.fetchModels")}
            </Button>
          </div>
          <p className="mt-2 text-sm text-text-2">
            {t("option.ai.baseUrl.helper")}
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="ai-model"
            className="mb-2 block font-medium text-text-1">
            <Icon
              icon="mdi:robot-excited-outline"
              className="mr-1.5 inline"
              width={18}
            />
            {t("option.ai.model.label")}
          </label>
          <ModelSelectInput
            id="ai-model"
            value={model}
            onChange={setModel}
            options={modelList}
          />
          <p className="mt-2 text-sm text-text-2">
            {t("option.ai.model.helper")}
          </p>
        </div>

        <div className="mb-4">
          <label
            htmlFor="ai-system-prompt"
            className="mb-2 block font-medium text-text-1">
            <Icon
              icon="mdi:message-text-outline"
              className="mr-1.5 inline"
              width={18}
            />
            {t("option.ai.systemPrompt")}
          </label>
          <textarea
            id="ai-system-prompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-line-1 bg-content p-2.5 text-sm focus:border-accent-blue focus:outline-none focus:ring-2 focus:ring-accent-blue/20"
            placeholder={t("option.ai.systemPrompt.placeholder")}
          />
          <p className="mt-2 text-sm text-text-2">
            {t("option.ai.systemPrompt.helper")}
          </p>
        </div>

        <div className="mb-4 border-line-1 border-t pt-4">
          <PromptTemplateManager />
        </div>

        <Button fullWidth onClick={saveSettings}>
          <Icon icon="mdi:content-save-outline" className="mr-1.5" width={18} />
          {t("option.ai.save")}
        </Button>
      </div>
    </OptionSection>
  )
}

export default AiSettingsSection
