import plugin from "tailwindcss/plugin"
import { THEME_CSS_VARIABLES } from "./constants/theme-colors"

/**
 * Tailwind plugin that generates CSS custom properties for theming.
 * Reads variables from constants/theme-colors.ts (single source of truth)
 * and injects them into :root (light) and .dark selectors.
 */
export default plugin(({ addBase }) => {
  addBase({
    ":root": THEME_CSS_VARIABLES.light,
    ".dark": THEME_CSS_VARIABLES.dark
  })
})
