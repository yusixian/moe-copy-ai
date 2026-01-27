import "./styles/global.css"

import PopupContent from "~/components/PopupContent"
import { ErrorBoundary } from "~/components/ui/ErrorBoundary"
import { I18nProvider } from "~utils/i18n"
import { ThemeProvider } from "~utils/theme"

function IndexPopup() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ErrorBoundary>
          <div className="w-[35rem]">
            <PopupContent />
          </div>
        </ErrorBoundary>
      </I18nProvider>
    </ThemeProvider>
  )
}

export default IndexPopup
