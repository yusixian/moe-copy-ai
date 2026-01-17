import "./styles/global.css"

import PopupContent from "~/components/PopupContent"
import { ErrorBoundary } from "~/components/ui/ErrorBoundary"
import { I18nProvider } from "~utils/i18n"

function IndexPopup() {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <div className="w-[35rem]">
          <PopupContent />
        </div>
      </ErrorBoundary>
    </I18nProvider>
  )
}

export default IndexPopup
