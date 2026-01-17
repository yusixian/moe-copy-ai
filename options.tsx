import { ToastContainer } from "react-toastify"

import "./styles/global.css"

import { ErrorBoundary } from "~/components/ui/ErrorBoundary"
import { I18nProvider } from "~utils/i18n"
import AiSettingsSection from "./components/option/AiSettingsSection"
import DevSettingsSection from "./components/option/DevSettingsSection"
import ExtractionModeSection from "./components/option/ExtractionModeSection"
import Footer from "./components/option/Footer"
import InterfaceSettingsSection from "./components/option/InterfaceSettingsSection"
import LogSettingsSection from "./components/option/LogSettingsSection"
import OptionHeader from "./components/option/OptionHeader"
import SelectorSettingsSection from "./components/option/SelectorSettingsSection"

function OptionsPage() {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
          <div className="mx-auto max-w-2xl">
            <OptionHeader />
            <ExtractionModeSection />
            <LogSettingsSection />
            <InterfaceSettingsSection />
            <SelectorSettingsSection />
            <AiSettingsSection />
            <DevSettingsSection />
            <Footer />
          </div>
          <ToastContainer />
        </div>
      </ErrorBoundary>
    </I18nProvider>
  )
}

export default OptionsPage
