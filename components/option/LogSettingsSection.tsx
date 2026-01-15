import type React from "react"

import { useI18n } from "~utils/i18n"

import { LOG_LEVELS, SCRAPE_TIMING_OPTIONS } from "../../constants/options"
import OptionSection from "./OptionSection"
import OptionSelect from "./OptionSelect"

export const LogSettingsSection: React.FC = () => {
  const { t } = useI18n()

  return (
    <OptionSection title={t("option.log.title")} icon="line-md:cog">
      <OptionSelect
        id="logLevel"
        label={t("option.log.level.label")}
        options={LOG_LEVELS}
        storageKey="log_level"
        defaultValue="silent"
        description={t("option.log.level.desc")}
      />

      <OptionSelect
        id="scrapeTiming"
        label={t("option.log.scrapeTiming.label")}
        options={SCRAPE_TIMING_OPTIONS}
        storageKey="scrape_timing"
        defaultValue="manual"
        description={t("option.log.scrapeTiming.desc")}
      />

      <div className="mt-6 rounded-lg border border-sky-200 bg-blue-50 p-4">
        <h3 className="mb-2 flex items-center font-medium text-lg text-sky-600">
          <span className="mr-2">📝</span>{t("option.log.levelExplanation.title")}
        </h3>
        <ul className="space-y-2 text-sky-600 text-sm">
          <li className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-sky-400"></span>
            <span className="font-semibold">{t("option.log.levelExplanation.debug")}</span>{" "}
            <span className="ml-2">
              {t("option.log.levelExplanation.debugDesc")}
            </span>
          </li>
          <li className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-500"></span>
            <span className="font-semibold">{t("option.log.levelExplanation.info")}</span>{" "}
            <span className="ml-2">{t("option.log.levelExplanation.infoDesc")}</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-400"></span>
            <span className="font-semibold">{t("option.log.levelExplanation.error")}</span>{" "}
            <span className="ml-2">{t("option.log.levelExplanation.errorDesc")}</span>
          </li>
          <li className="flex items-center">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-gray-400"></span>
            <span className="font-semibold">{t("option.log.levelExplanation.silent")}</span>{" "}
            <span className="ml-2">{t("option.log.levelExplanation.silentDesc")}</span>
          </li>
        </ul>
      </div>
    </OptionSection>
  )
}

export default LogSettingsSection
