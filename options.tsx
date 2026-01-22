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
        <div className="relative min-h-screen bg-app p-8">
          {/* Background Gradient */}
          <div
            className="fixed inset-0 z-0 h-full w-full"
            style={{
              backgroundImage: `
                radial-gradient(circle at 15% 10%, rgb(37 99 235 / 0.14), transparent 40%),
                radial-gradient(circle at 50% 5%, rgb(6 182 212 / 0.11), transparent 45%),
                radial-gradient(circle at 85% 10%, rgb(168 85 247 / 0.08), transparent 40%)
              `
            }}
          />
          <div className="relative z-1 mx-auto max-w-2xl">
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
