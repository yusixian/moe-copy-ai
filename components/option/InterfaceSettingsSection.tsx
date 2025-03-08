import React from "react"

import { FLOAT_BUTTON_OPTIONS } from "../../constants/options"
import OptionSection from "./OptionSection"
import OptionSelect from "./OptionSelect"

export const InterfaceSettingsSection: React.FC = () => {
  return (
    <OptionSection title="界面设置" icon="line-md:cog-filled-loop">
      <OptionSelect
        id="floatButton"
        label="网页内悬浮窗"
        options={FLOAT_BUTTON_OPTIONS}
        storageKey="show_float_button"
        defaultValue="true"
        description="控制是否在网页中显示悬浮球。关闭后将不会在浏览的网页中显示悬浮窗，您仍可以通过浏览器扩展图标使用功能 (=^･ω･^=)"
      />
    </OptionSection>
  )
}

export default InterfaceSettingsSection
