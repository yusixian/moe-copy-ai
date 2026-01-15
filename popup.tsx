import "./styles/global.css"

import PopupContent from "~/components/PopupContent"
import { I18nProvider } from "~utils/i18n"

function IndexPopup() {
  return (
    <I18nProvider>
      <div className="w-[35rem]">
        <PopupContent />
      </div>
    </I18nProvider>
  )
}

export default IndexPopup
