import type React from "react"

import { FLOAT_BUTTON_OPTIONS } from "../../constants/options"
import { useI18n } from "~utils/i18n"

import LanguageSelect from "./LanguageSelect"
import OptionSection from "./OptionSection"
import OptionSelect from "./OptionSelect"

export const InterfaceSettingsSection: React.FC = () => {
  const { t } = useI18n()

  return (
    <OptionSection title={t("option.interface.title")} icon="line-md:cog">
      <LanguageSelect />
      <OptionSelect
        id="floatButton"
        label={t("option.interface.floatButton")}
        options={FLOAT_BUTTON_OPTIONS}
        storageKey="show_float_button"
        defaultValue="true"
        description={t("option.interface.floatButton.desc")}
      />
    </OptionSection>
  )
}

export default InterfaceSettingsSection
