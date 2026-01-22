/** @type {import('tailwindcss').Config} */
const config = {
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
        app: "#fafafa",
        content: "oklch(100% 0 0 / 0.6)",
        "content-hover": "color-mix(in oklab, oklch(100% 0 0 / 0.6), black 5%)",
        "content-active":
          "color-mix(in oklab, oklch(100% 0 0 / 0.6), black 10%)",
        "content-solid": "oklch(100% 0 0)",
        "content-solid-hover": "color-mix(in oklab, oklch(100% 0 0), black 5%)",
        "content-solid-active":
          "color-mix(in oklab, oklch(100% 0 0), black 10%)",
        "content-alt": "oklch(96.8% 0.0069 247.9 / 0.6)",
        "content-alt-hover":
          "color-mix(in oklab, oklch(96.8% 0.0069 247.9 / 0.6), black 5%)",
        "content-alt-active":
          "color-mix(in oklab, oklch(96.8% 0.0069 247.9 / 0.6), black 10%)",
        "content-alt-solid": "oklch(96.8% 0.0069 247.9)",
        "content-alt-solid-hover":
          "color-mix(in oklab, oklch(96.8% 0.0069 247.9), black 5%)",
        "content-alt-solid-active":
          "color-mix(in oklab, oklch(96.8% 0.0069 247.9), black 10%)",
        elevated: {
          1: "rgba(255, 255, 255, 0.6)",
          2: "rgba(255, 255, 255, 0.6)",
          solid: {
            1: "#fff",
            2: "#fff"
          }
        },
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
        info: "oklch(68.5% 0.169 237.323 / <alpha-value>)",
        "info-hover": "oklch(68.5% 0.169 237.323 / 85%)",
        "info-active": "oklch(68.5% 0.169 237.323 / 75%)",
        "info-ghost": "oklch(68.5% 0.169 237.323 / 10%)",
        "info-ghost-hover": "oklch(68.5% 0.169 237.323 / 15%)",
        "info-ghost-active": "oklch(68.5% 0.169 237.323 / 20%)",
        success: "oklch(62.7% 0.1699 149.21 / <alpha-value>)",
        "success-hover": "oklch(62.7% 0.1699 149.21 / 85%)",
        "success-active": "oklch(62.7% 0.1699 149.21 / 75%)",
        "success-ghost": "oklch(62.7% 0.1699 149.21 / 10%)",
        "success-ghost-hover": "oklch(62.7% 0.1699 149.21 / 15%)",
        "success-ghost-active": "oklch(62.7% 0.1699 149.21 / 20%)",
        warning: "oklch(75% 0.183 55.934 / <alpha-value>)",
        "warning-hover": "oklch(75% 0.183 55.934 / 85%)",
        "warning-active": "oklch(75% 0.183 55.934 / 75%)",
        "warning-ghost": "oklch(75% 0.183 55.934 / 10%)",
        "warning-ghost-hover": "oklch(75% 0.183 55.934 / 15%)",
        "warning-ghost-active": "oklch(75% 0.183 55.934 / 20%)",
        error: "oklch(63.7% 0.237 25.331 / <alpha-value>)",
        "error-hover": "oklch(63.7% 0.237 25.331 / 85%)",
        "error-active": "oklch(63.7% 0.237 25.331 / 75%)",
        "error-ghost": "oklch(63.7% 0.237 25.331 / 10%)",
        "error-ghost-hover": "oklch(63.7% 0.237 25.331 / 15%)",
        "error-ghost-active": "oklch(63.7% 0.237 25.331 / 20%)",
        text: {
          1: "oklch(12.9% 0.042 264.695 / <alpha-value>)",
          "1-hover": "oklch(12.9% 0.042 264.695 / 85%)",
          "1-active": "oklch(12.9% 0.042 264.695 / 75%)",
          2: "oklch(44.6% 0.043 257.281 / <alpha-value>)",
          "2-hover": "oklch(44.6% 0.043 257.281 / 85%)",
          "2-active": "oklch(44.6% 0.043 257.281 / 75%)",
          3: "oklch(70.4% 0.04 256.788 / <alpha-value>)",
          "3-hover": "oklch(70.4% 0.04 256.788 / 85%)",
          "3-active": "oklch(70.4% 0.04 256.788 / 75%)",
          4: "oklch(92.9% 0.013 255.508 / <alpha-value>)",
          "4-hover": "oklch(92.9% 0.013 255.508 / 85%)",
          "4-active": "oklch(92.9% 0.013 255.508 / 75%)"
        },
        // 边框配色或是分割线配色
        line: {
          1: "rgba(120 120 122 / 0.32)",
          2: "rgba(120 120 122 / 0.44)"
        },
        // 填充色, 可以用于填充像是按钮、下拉框背景、输入框背景等
        fill: {
          1: "rgba(120 120 122 / 0.08)",
          2: "rgba(120 120 122 / 0.16)",
          3: "rgba(120 120 122 / 0.24)"
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
  }
}
export default config
