/**
 * Theme-related constants
 * Background gradients and theme-specific visual elements
 */

import type { ResolvedTheme } from "~utils/theme"

/**
 * Radial background gradients for light and dark modes
 * Used for visual polish in popup and options pages
 */
export const BACKGROUND_GRADIENTS: Record<ResolvedTheme, string> = {
  light: `
    radial-gradient(circle at 15% 10%, rgb(88 121 238 / 0.18), transparent 40%),
    radial-gradient(circle at 50% 5%, rgb(88 121 238 / 0.15), transparent 45%),
    radial-gradient(circle at 85% 10%, rgb(186 92 231 / 0.12), transparent 40%)
  `,
  dark: `
    radial-gradient(125% 125% at 50% 90%, var(--color-app) 40%, oklch(99% 0.1727 257.57 / 0.2) 100%)
  `
}

/**
 * Smaller opacity gradients for options page
 */
export const BACKGROUND_GRADIENTS_SUBTLE: Record<ResolvedTheme, string> = {
  light: `
    radial-gradient(circle at 15% 10%, rgb(88 121 238 / 0.18), transparent 40%),
    radial-gradient(circle at 50% 5%, rgb(88 121 238 / 0.15), transparent 45%),
    radial-gradient(circle at 85% 10%, rgb(186 92 231 / 0.12), transparent 40%)
  `,
  dark: `
    radial-gradient(125% 125% at 50% 90%, var(--color-app) 40%, oklch(99% 0.1727 257.57 / 0.2) 100%)
  `
}
