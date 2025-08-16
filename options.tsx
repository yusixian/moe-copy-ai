import React from "react"
import { ToastContainer } from "react-toastify"

import "./styles/global.css"

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
  )
}

export default OptionsPage
