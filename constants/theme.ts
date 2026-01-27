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
    radial-gradient(circle at 15% 10%, rgb(37 99 235 / 0.18), transparent 40%),
    radial-gradient(circle at 50% 5%, rgb(6 182 212 / 0.15), transparent 45%),
    radial-gradient(circle at 85% 10%, rgb(168 85 247 / 0.12), transparent 40%)
  `,
  dark: `
    radial-gradient(circle at 15% 10%, rgb(37 99 235 / 0.10), transparent 40%),
    radial-gradient(circle at 50% 5%, rgb(6 182 212 / 0.08), transparent 45%),
    radial-gradient(circle at 85% 10%, rgb(168 85 247 / 0.06), transparent 40%)
  `
}

/**
 * Smaller opacity gradients for options page
 */
export const BACKGROUND_GRADIENTS_SUBTLE: Record<ResolvedTheme, string> = {
  light: `
    radial-gradient(circle at 15% 10%, rgb(37 99 235 / 0.14), transparent 40%),
    radial-gradient(circle at 50% 5%, rgb(6 182 212 / 0.11), transparent 45%),
    radial-gradient(circle at 85% 10%, rgb(168 85 247 / 0.08), transparent 40%)
  `,
  dark: `
    radial-gradient(circle at 15% 10%, rgb(37 99 235 / 0.08), transparent 40%),
    radial-gradient(circle at 50% 5%, rgb(6 182 212 / 0.06), transparent 45%),
    radial-gradient(circle at 85% 10%, rgb(168 85 247 / 0.05), transparent 40%)
  `
}
