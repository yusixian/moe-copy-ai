import type { ResolvedTheme } from "~utils/theme"

/**
 * CSS Theme Variables - Single Source of Truth
 *
 * Used by:
 * - Tailwind Plugin (tailwind-theme-plugin.js) - generates :root/.dark CSS
 * - Content Script (floating-popup.tsx) - inline styles for shadow DOM
 */
export const THEME_CSS_VARIABLES: Record<
  ResolvedTheme,
  Record<string, string>
> = {
  light: {
    // Background colors
    "--color-app": "#fafafa",
    "--color-content": "oklch(100% 0 0 / 0.6)",
    "--color-content-hover":
      "color-mix(in oklab, oklch(100% 0 0 / 0.6), black 5%)",
    "--color-content-active":
      "color-mix(in oklab, oklch(100% 0 0 / 0.6), black 10%)",
    "--color-content-solid": "oklch(100% 0 0)",
    "--color-content-solid-hover":
      "color-mix(in oklab, oklch(100% 0 0), black 5%)",
    "--color-content-solid-active":
      "color-mix(in oklab, oklch(100% 0 0), black 10%)",
    "--color-content-alt": "oklch(96.8% 0.0069 247.9 / 0.6)",
    "--color-content-alt-hover":
      "color-mix(in oklab, oklch(96.8% 0.0069 247.9 / 0.6), black 5%)",
    "--color-content-alt-active":
      "color-mix(in oklab, oklch(96.8% 0.0069 247.9 / 0.6), black 10%)",
    "--color-content-alt-solid": "oklch(96.8% 0.0069 247.9)",
    "--color-content-alt-solid-hover":
      "color-mix(in oklab, oklch(96.8% 0.0069 247.9), black 5%)",
    "--color-content-alt-solid-active":
      "color-mix(in oklab, oklch(96.8% 0.0069 247.9), black 10%)",

    // Elevated layers
    "--color-elevated-1": "rgba(255, 255, 255, 0.6)",
    "--color-elevated-2": "rgba(255, 255, 255, 0.6)",
    "--color-elevated-solid-1": "#fff",
    "--color-elevated-solid-2": "#fff",

    // Text colors
    "--color-text-1": "oklch(12.9% 0.042 264.695)",
    "--color-text-1-hover": "oklch(12.9% 0.042 264.695 / 85%)",
    "--color-text-1-active": "oklch(12.9% 0.042 264.695 / 75%)",
    "--color-text-2": "oklch(44.6% 0.043 257.281)",
    "--color-text-2-hover": "oklch(44.6% 0.043 257.281 / 85%)",
    "--color-text-2-active": "oklch(44.6% 0.043 257.281 / 75%)",
    "--color-text-3": "oklch(70.4% 0.04 256.788)",
    "--color-text-3-hover": "oklch(70.4% 0.04 256.788 / 85%)",
    "--color-text-3-active": "oklch(70.4% 0.04 256.788 / 75%)",
    "--color-text-4": "oklch(92.9% 0.013 255.508)",
    "--color-text-4-hover": "oklch(92.9% 0.013 255.508 / 85%)",
    "--color-text-4-active": "oklch(92.9% 0.013 255.508 / 75%)",

    // Border/divider colors
    "--color-line-1": "rgba(120, 120, 122, 0.32)",
    "--color-line-2": "rgba(120, 120, 122, 0.44)",

    // Fill colors
    "--color-fill-1": "rgba(120, 120, 122, 0.08)",
    "--color-fill-2": "rgba(120, 120, 122, 0.16)",
    "--color-fill-3": "rgba(120, 120, 122, 0.24)",

    // Shadow highlights
    "--shadow-highlight": "rgb(255 255 255 / 0.4)",
    "--shadow-highlight-weak": "rgb(255 255 255 / 0.2)",

    // Semantic ghost colors (10% opacity for light mode)
    "--color-info-ghost": "oklch(68.5% 0.169 237.323 / 10%)",
    "--color-warning-ghost": "oklch(75% 0.183 55.934 / 10%)",
    "--color-success-ghost": "oklch(62.7% 0.1699 149.21 / 10%)",
    "--color-error-ghost": "oklch(63.7% 0.237 25.331 / 10%)"
  },
  dark: {
    // Background colors
    "--color-app": "#0f0f10",
    "--color-content": "oklch(20% 0.01 264 / 0.6)",
    "--color-content-hover":
      "color-mix(in oklab, oklch(20% 0.01 264 / 0.6), white 5%)",
    "--color-content-active":
      "color-mix(in oklab, oklch(20% 0.01 264 / 0.6), white 10%)",
    "--color-content-solid": "oklch(18% 0.01 264)",
    "--color-content-solid-hover":
      "color-mix(in oklab, oklch(18% 0.01 264), white 5%)",
    "--color-content-solid-active":
      "color-mix(in oklab, oklch(18% 0.01 264), white 10%)",
    "--color-content-alt": "oklch(22% 0.012 264 / 0.6)",
    "--color-content-alt-hover":
      "color-mix(in oklab, oklch(22% 0.012 264 / 0.6), white 5%)",
    "--color-content-alt-active":
      "color-mix(in oklab, oklch(22% 0.012 264 / 0.6), white 10%)",
    "--color-content-alt-solid": "oklch(22% 0.012 264)",
    "--color-content-alt-solid-hover":
      "color-mix(in oklab, oklch(22% 0.012 264), white 5%)",
    "--color-content-alt-solid-active":
      "color-mix(in oklab, oklch(22% 0.012 264), white 10%)",

    // Elevated layers
    "--color-elevated-1": "rgba(40, 40, 45, 0.6)",
    "--color-elevated-2": "rgba(40, 40, 45, 0.6)",
    "--color-elevated-solid-1": "#1a1a1d",
    "--color-elevated-solid-2": "#1a1a1d",

    // Text colors - inverted brightness
    "--color-text-1": "oklch(92% 0.01 264)",
    "--color-text-1-hover": "oklch(92% 0.01 264 / 85%)",
    "--color-text-1-active": "oklch(92% 0.01 264 / 75%)",
    "--color-text-2": "oklch(70% 0.02 257)",
    "--color-text-2-hover": "oklch(70% 0.02 257 / 85%)",
    "--color-text-2-active": "oklch(70% 0.02 257 / 75%)",
    "--color-text-3": "oklch(50% 0.02 257)",
    "--color-text-3-hover": "oklch(50% 0.02 257 / 85%)",
    "--color-text-3-active": "oklch(50% 0.02 257 / 75%)",
    "--color-text-4": "oklch(30% 0.01 255)",
    "--color-text-4-hover": "oklch(30% 0.01 255 / 85%)",
    "--color-text-4-active": "oklch(30% 0.01 255 / 75%)",

    // Border/divider colors
    "--color-line-1": "rgba(180, 180, 185, 0.2)",
    "--color-line-2": "rgba(180, 180, 185, 0.3)",

    // Fill colors
    "--color-fill-1": "rgba(180, 180, 185, 0.08)",
    "--color-fill-2": "rgba(180, 180, 185, 0.16)",
    "--color-fill-3": "rgba(180, 180, 185, 0.24)",

    // Shadow highlights - reduced for dark mode
    "--shadow-highlight": "rgb(255 255 255 / 0.05)",
    "--shadow-highlight-weak": "rgb(255 255 255 / 0.03)",

    // Semantic ghost colors (20% opacity for dark mode - more visible)
    "--color-info-ghost": "oklch(68.5% 0.169 237.323 / 20%)",
    "--color-warning-ghost": "oklch(75% 0.183 55.934 / 20%)",
    "--color-success-ghost": "oklch(62.7% 0.1699 149.21 / 20%)",
    "--color-error-ghost": "oklch(63.7% 0.237 25.331 / 20%)"
  }
}
