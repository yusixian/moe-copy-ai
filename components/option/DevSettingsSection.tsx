import type React from "react"

import { DEBUG_PANEL_OPTIONS } from "../../constants/options"
import OptionSection from "./OptionSection"
import OptionSelect from "./OptionSelect"

export const DevSettingsSection: React.FC = () => {
  return (
    <OptionSection
      title="开发者选项"
      icon="line-md:coffee-half-empty-filled-loop">
      <OptionSelect
        id="debugPanel"
        label="调试面板"
        options={DEBUG_PANEL_OPTIONS}
        storageKey="show_debug_panel"
        defaultValue="true"
        description="控制是否显示调试面板。调试面板提供了额外的技术信息，主要用于开发和故障排除。(◕ᴗ◕✿)"
      />
    </OptionSection>
  )
}

export default DevSettingsSection
