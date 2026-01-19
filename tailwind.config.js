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
        content: "rgba(255, 255, 255, 0.6)",
        "content-hover":
          "color-mix(in oklab, rgba(255, 255, 255, 0.6), black 5%)",
        "content-active":
          "color-mix(in oklab, rgba(255, 255, 255, 0.6), black 10%)",
        "content-solid": "rgba(255, 255, 255)",
        "content-solid-hover":
          "color-mix(in oklab, rgba(255, 255, 255), black 5%)",
        "content-solid-active":
          "color-mix(in oklab, rgba(255, 255, 255), black 10%)",
        elevated: {
          1: "rgba(255, 255, 255, 0.6)",
          2: "rgba(255, 255, 255, 0.6)",
          solid: {
            1: "#fff",
            2: "#fff"
          }
        },
        accent: {
          blue: "rgb(37 99 235 / <alpha-value>)",
          "blue-hover": "rgb(37 99 235 / 85%)",
          "blue-active": "rgb(37 99 235 / 75%)",
          "blue-ghost": "rgb(37 99 235 / 15%)",
          "blue-ghost-hover": "rgb(37 99 235 / 30%)",
          "blue-ghost-active": "rgb(37 99 235 / 40%)",
          "blue-light-1":
            "color-mix(in oklab, color-mix(in oklab, rgb(37 99 235), white 75%), transparent <alpha-value>)",
          "blue-light-2":
            "color-mix(in oklab, color-mix(in oklab, rgb(37 99 235), white 60%), transparent <alpha-value>)",
          "blue-light-3":
            "color-mix(in oklab, color-mix(in oklab, rgb(37 99 235), white 45%), transparent <alpha-value>)",
          "blue-light-4":
            "color-mix(in oklab, color-mix(in oklab, rgb(37 99 235), white 30%), transparent <alpha-value>)",
          "blue-light-5":
            "color-mix(in oklab, color-mix(in oklab, rgb(37 99 235), white 15%), transparent <alpha-value>)",
          purple: "rgb(126 34 206 / <alpha-value>)",
          "purple-hover": "rgb(126 34 206 / 85%)",
          "purple-active": "rgb(126 34 206 / 75%)",
          "purple-ghost": "rgb(126 34 206 / 15%)",
          "purple-ghost-hover": "rgb(126 34 206 / 30%)",
          "purple-ghost-active": "rgb(126 34 206 / 40%)",
          "purple-light-1":
            "color-mix(in oklab, color-mix(in oklab, rgb(126 34 206), white 75%), transparent <alpha-value>)",
          "purple-light-2":
            "color-mix(in oklab, color-mix(in oklab, rgb(126 34 206), white 60%), transparent <alpha-value>)",
          "purple-light-3":
            "color-mix(in oklab, color-mix(in oklab, rgb(126 34 206), white 45%), transparent <alpha-value>)",
          "purple-light-4":
            "color-mix(in oklab, color-mix(in oklab, rgb(126 34 206), white 30%), transparent <alpha-value>)",
          "purple-light-5":
            "color-mix(in oklab, color-mix(in oklab, rgb(126 34 206), white 15%), transparent <alpha-value>)"
        },
        info: "oklch(68.5% 0.169 237.323 / <alpha-value>)",
        "info-hover": "oklch(68.5% 0.169 237.323 / 85%)",
        "info-active": "oklch(68.5% 0.169 237.323 / 75%)",
        "info-ghost": "oklch(68.5% 0.169 237.323 / 15%)",
        "info-ghost-hover": "oklch(68.5% 0.169 237.323 / 30%)",
        "info-ghost-active": "oklch(68.5% 0.169 237.323 / 40%)",
        success: "oklch(72.3% 0.219 149.579 / <alpha-value>)",
        "success-hover": "oklch(72.3% 0.219 149.579 / 85%)",
        "success-active": "oklch(72.3% 0.219 149.579 / 75%)",
        "success-ghost": "oklch(72.3% 0.219 149.579 / 15%)",
        "success-ghost-hover": "oklch(72.3% 0.219 149.579 / 30%)",
        "success-ghost-active": "oklch(72.3% 0.219 149.579 / 40%)",
        warning: "oklch(75% 0.183 55.934 / <alpha-value>)",
        "warning-hover": "oklch(75% 0.183 55.934 / 85%)",
        "warning-active": "oklch(75% 0.183 55.934 / 75%)",
        "warning-ghost": "oklch(75% 0.183 55.934 / 15%)",
        "warning-ghost-hover": "oklch(75% 0.183 55.934 / 30%)",
        "warning-ghost-active": "oklch(75% 0.183 55.934 / 40%)",
        error: "oklch(63.7% 0.237 25.331 / <alpha-value>)",
        "error-hover": "oklch(63.7% 0.237 25.331 / 85%)",
        "error-active": "oklch(63.7% 0.237 25.331 / 75%)",
        "error-ghost": "oklch(63.7% 0.237 25.331 / 15%)",
        "error-ghost-hover": "oklch(63.7% 0.237 25.331 / 30%)",
        "error-ghost-active": "oklch(63.7% 0.237 25.331 / 40%)",
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
          1: "rgba(120 120 122 / 0.16)",
          2: "rgba(120 120 122 / 0.28)"
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
