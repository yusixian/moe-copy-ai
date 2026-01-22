import { Icon } from "@iconify/react"
import type { ReactNode } from "react"
import { useState } from "react"
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary"

import { useI18n } from "~utils/i18n"
import { Button } from "./button"

const APP_VERSION = process.env.PLASMO_PUBLIC_VERSION || "0.2.2"
const LINKS = {
  docs: "https://moe.cosine.ren/docs",
  issues: "https://github.com/yusixian/moe-copy-ai/issues",
  discord: "https://discord.gg/XzvrvNMcSe",
  email: "mailto:i@cosine.ren"
}

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { t } = useI18n()
  const [showDetails, setShowDetails] = useState(false)

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-red-200 bg-red-50 p-6">
      {/* Error Icon and Title */}
      <div className="flex flex-col items-center gap-2">
        <Icon
          icon="mdi:alert-circle-outline"
          width={48}
          height={48}
          className="text-red-500"
        />
        <span className="font-semibold text-lg text-red-600">
          {t("errorBoundary.title")}
        </span>
      </div>

      {/* Error Message */}
      <p className="max-w-md text-center text-red-500 text-sm">
        {error.message || t("errorBoundary.defaultMessage")}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
          <Icon icon="mdi:refresh" width={16} className="mr-1" />
          {t("errorBoundary.tryAgain")}
        </Button>
        <Button variant="default" size="sm" onClick={handleReload}>
          <Icon icon="mdi:reload" width={16} className="mr-1" />
          {t("errorBoundary.reloadPage")}
        </Button>
      </div>

      {/* Error Details Toggle */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1 text-red-400 text-xs hover:text-red-600">
        <Icon
          icon={showDetails ? "mdi:chevron-up" : "mdi:chevron-down"}
          width={16}
        />
        {showDetails
          ? t("errorBoundary.hideDetails")
          : t("errorBoundary.showDetails")}
      </button>

      {showDetails && (
        <div className="w-full max-w-md rounded border border-red-200 bg-red-100 p-3">
          <p className="mb-1 font-medium text-red-600 text-xs">
            {t("errorBoundary.errorDetails")}
          </p>
          <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-all font-mono text-red-500 text-xs">
            {error.stack || error.message}
          </pre>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-2 flex flex-col items-center gap-2 border-red-200 border-t pt-4">
        <p className="text-gray-500 text-xs">{t("errorBoundary.helpDesc")}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(LINKS.docs, "_blank")}
            title={t("errorBoundary.docs")}>
            <Icon icon="mdi:book-open-outline" width={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(LINKS.issues, "_blank")}
            title={t("errorBoundary.reportIssue")}>
            <Icon icon="mdi:github" width={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(LINKS.discord, "_blank")}
            title={t("errorBoundary.discord")}>
            <Icon icon="mdi:discord" width={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => window.open(LINKS.email, "_blank")}
            title={t("errorBoundary.email")}>
            <Icon icon="mdi:email-outline" width={18} />
          </Button>
        </div>
      </div>

      {/* Footer with Version */}
      <div className="mt-2 flex items-center gap-1 text-gray-400 text-xs">
        <Icon icon="line-md:heart-twotone" className="text-pink-400" />
        <span>Moe Copy AI</span>
        <span className="text-gray-300">·</span>
        <span>
          {t("errorBoundary.version")} {APP_VERSION}
        </span>
      </div>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Error Boundary component for catching React errors gracefully.
 * Wrap your app or critical components to prevent full-page crashes.
 */
export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  if (fallback) {
    return (
      <ReactErrorBoundary fallback={fallback}>{children}</ReactErrorBoundary>
    )
  }

  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  )
}

export default ErrorBoundary
