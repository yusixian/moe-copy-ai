import { Icon } from "@iconify/react"
import { lazy, Suspense } from "react"
import { ToastContainer } from "react-toastify"

import "./styles/global.css"

import { ErrorBoundary } from "~/components/ui/ErrorBoundary"
import { BACKGROUND_GRADIENTS_SUBTLE } from "~constants/theme"
import { I18nProvider } from "~utils/i18n"
import { ThemeProvider, useTheme } from "~utils/theme"
import Footer from "./components/option/Footer"
import OptionHeader from "./components/option/OptionHeader"

// Lazy load settings sections - users view one at a time (collapsible UI)
const AiSettingsSection = lazy(
  () => import("./components/option/AiSettingsSection")
)
const DevSettingsSection = lazy(
  () => import("./components/option/DevSettingsSection")
)
const ExtractionModeSection = lazy(
  () => import("./components/option/ExtractionModeSection")
)
const InterfaceSettingsSection = lazy(
  () => import("./components/option/InterfaceSettingsSection")
)
const LogSettingsSection = lazy(
  () => import("./components/option/LogSettingsSection")
)
const SelectorSettingsSection = lazy(
  () => import("./components/option/SelectorSettingsSection")
)

function SectionSkeleton() {
  return (
    <div className="mb-4 flex h-16 items-center justify-center rounded-lg bg-card">
      <Icon icon="line-md:loading-loop" className="h-6 w-6 text-accent-blue" />
    </div>
  )
}

function OptionsPageContent() {
  const { resolvedTheme } = useTheme()

  return (
    <div className="relative min-h-screen bg-app p-8">
      {/* Background Gradient - adjust opacity for dark mode */}
      <div
        className="fixed inset-0 z-0 h-full w-full"
        style={{
          backgroundImage: BACKGROUND_GRADIENTS_SUBTLE[resolvedTheme]
        }}
      />
      <div className="relative z-1 mx-auto max-w-2xl">
        <OptionHeader />
        <Suspense fallback={<SectionSkeleton />}>
          <ExtractionModeSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <LogSettingsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <InterfaceSettingsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <SelectorSettingsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <AiSettingsSection />
        </Suspense>
        <Suspense fallback={<SectionSkeleton />}>
          <DevSettingsSection />
        </Suspense>
        <Footer />
      </div>
      <ToastContainer theme={resolvedTheme === "dark" ? "dark" : "light"} />
    </div>
  )
}

function OptionsPage() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <ErrorBoundary>
          <OptionsPageContent />
        </ErrorBoundary>
      </ThemeProvider>
    </I18nProvider>
  )
}

export default OptionsPage
