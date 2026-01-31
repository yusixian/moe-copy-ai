import themePlugin from "./tailwind-theme-plugin"

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    "./*.tsx",
    "./contents/**/*.{ts,tsx}",
    "./styles/**/*.css",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          "2xl": "10.5rem"
        }
      },
      screens: {
        xs: { max: "480px" },
        md: { max: "768px" }
      },
      colors: {
        background: {
          400: "#444",
          DEFAULT: "#232323"
        },
        foreground: {
          DEFAULT: "#ffffff1f",
          hover: "#ffffff14"
        },
        // CSS 变量引用的颜色（支持深色模式）
        app: "var(--color-app)",
        content: "var(--color-content)",
        "content-hover": "var(--color-content-hover)",
        "content-active": "var(--color-content-active)",
        "content-solid": "var(--color-content-solid)",
        "content-solid-hover": "var(--color-content-solid-hover)",
        "content-solid-active": "var(--color-content-solid-active)",
        "content-alt": "var(--color-content-alt)",
        "content-alt-hover": "var(--color-content-alt-hover)",
        "content-alt-active": "var(--color-content-alt-active)",
        "content-alt-solid": "var(--color-content-alt-solid)",
        "content-alt-solid-hover": "var(--color-content-alt-solid-hover)",
        "content-alt-solid-active": "var(--color-content-alt-solid-active)",
        elevated: {
          1: "var(--color-elevated-1)",
          2: "var(--color-elevated-2)",
          solid: {
            1: "var(--color-elevated-solid-1)",
            2: "var(--color-elevated-solid-2)"
          }
        },
        // Accent 颜色保持不变（品牌色）
        accent: {
          blue: "oklch(60% 0.203 257.46)",
          "blue-hover": "oklch(60% 0.203 257.46 / 85%)",
          "blue-active": "oklch(60% 0.203 257.46 / 75%)",
          "blue-ghost": "oklch(60% 0.203 257.46 / 10%)",
          "blue-ghost-hover": "oklch(60% 0.203 257.46 / 15%)",
          "blue-ghost-active": "oklch(60% 0.203 257.46 / 20%)",
          "blue-light-1": "oklch(91% 0.048 264.052 / <alpha-value>)",
          "blue-light-2": "oklch(83% 0.077 264.052 / <alpha-value>)",
          "blue-light-3": "oklch(75% 0.106 264.052 / <alpha-value>)",
          "blue-light-4": "oklch(67% 0.135 264.052 / <alpha-value>)",
          "blue-light-5": "oklch(59% 0.164 264.052 / <alpha-value>)",
          purple: "oklch(42% 0.196 302.716 / <alpha-value>)",
          "purple-hover": "oklch(42% 0.196 302.716 / 85%)",
          "purple-active": "oklch(42% 0.196 302.716 / 75%)",
          "purple-ghost": "oklch(42% 0.196 302.716 / 10%)",
          "purple-ghost-hover": "oklch(42% 0.196 302.716 / 15%)",
          "purple-ghost-active": "oklch(42% 0.196 302.716 / 20%)",
          "purple-light-1": "oklch(85% 0.049 302.716 / <alpha-value>)",
          "purple-light-2": "oklch(75% 0.078 302.716 / <alpha-value>)",
          "purple-light-3": "oklch(65% 0.108 302.716 / <alpha-value>)",
          "purple-light-4": "oklch(55% 0.137 302.716 / <alpha-value>)",
          "purple-light-5": "oklch(48% 0.167 302.716 / <alpha-value>)"
        },
        // 语义色保持不变
        info: "oklch(68.5% 0.169 237.323 / <alpha-value>)",
        "info-hover": "oklch(68.5% 0.169 237.323 / 85%)",
        "info-active": "oklch(68.5% 0.169 237.323 / 75%)",
        "info-ghost": "var(--color-info-ghost)",
        "info-ghost-hover":
          "color-mix(in oklab, var(--color-info-ghost), black 5%)",
        "info-ghost-active":
          "color-mix(in oklab, var(--color-info-ghost), black 10%)",
        success: "oklch(62.7% 0.1699 149.21 / <alpha-value>)",
        "success-hover": "oklch(62.7% 0.1699 149.21 / 85%)",
        "success-active": "oklch(62.7% 0.1699 149.21 / 75%)",
        "success-ghost": "var(--color-success-ghost)",
        "success-ghost-hover":
          "color-mix(in oklab, var(--color-success-ghost), black 5%)",
        "success-ghost-active":
          "color-mix(in oklab, var(--color-success-ghost), black 10%)",
        warning: "oklch(75% 0.183 55.934 / <alpha-value>)",
        "warning-hover": "oklch(75% 0.183 55.934 / 85%)",
        "warning-active": "oklch(75% 0.183 55.934 / 75%)",
        "warning-ghost": "var(--color-warning-ghost)",
        "warning-ghost-hover":
          "color-mix(in oklab, var(--color-warning-ghost), black 5%)",
        "warning-ghost-active":
          "color-mix(in oklab, var(--color-warning-ghost), black 10%)",
        error: "oklch(63.7% 0.237 25.331 / <alpha-value>)",
        "error-hover": "oklch(63.7% 0.237 25.331 / 85%)",
        "error-active": "oklch(63.7% 0.237 25.331 / 75%)",
        "error-ghost": "var(--color-error-ghost)",
        "error-ghost-hover":
          "color-mix(in oklab, var(--color-error-ghost), black 5%)",
        "error-ghost-active":
          "color-mix(in oklab, var(--color-error-ghost), black 10%)",
        // 文本颜色使用 CSS 变量
        text: {
          1: "var(--color-text-1)",
          "1-hover": "var(--color-text-1-hover)",
          "1-active": "var(--color-text-1-active)",
          2: "var(--color-text-2)",
          "2-hover": "var(--color-text-2-hover)",
          "2-active": "var(--color-text-2-active)",
          3: "var(--color-text-3)",
          "3-hover": "var(--color-text-3-hover)",
          "3-active": "var(--color-text-3-active)",
          4: "var(--color-text-4)",
          "4-hover": "var(--color-text-4-hover)",
          "4-active": "var(--color-text-4-active)"
        },
        // 边框配色或是分割线配色
        line: {
          1: "var(--color-line-1)",
          2: "var(--color-line-2)"
        },
        // 填充色, 可以用于填充像是按钮、下拉框背景、输入框背景等
        fill: {
          1: "var(--color-fill-1)",
          2: "var(--color-fill-2)",
          3: "var(--color-fill-3)"
        }
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" }
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" }
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        bounce: {
          "0%, 100%": { transform: "translateY(-5%)" },
          "50%": { transform: "translateY(0)" }
        }
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 1s ease-in-out infinite",
        "spin-slow": "spin 3s linear infinite",
        fadeIn: "fadeIn 0.5s ease-out forwards",
        bounce: "bounce 0.6s ease-in-out infinite"
      }
    }
  },
  plugins: [themePlugin]
}
export default config
