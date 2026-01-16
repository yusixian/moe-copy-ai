import type React from "react"

import { useI18n } from "~utils/i18n"

import { DEBUG_PANEL_OPTIONS } from "../../constants/options"
import OptionSection from "./OptionSection"
import OptionSelect from "./OptionSelect"

export const DevSettingsSection: React.FC = () => {
  const { t } = useI18n()

  return (
    <OptionSection
      title={t("option.dev.title")}
      icon="line-md:coffee-half-empty-filled-loop">
      <OptionSelect
        id="debugPanel"
        label={t("option.dev.debugPanel.label")}
        options={DEBUG_PANEL_OPTIONS}
        storageKey="show_debug_panel"
        defaultValue="true"
        description={t("option.dev.debugPanel.desc")}
      />
    </OptionSection>
  )
}

export default DevSettingsSection
