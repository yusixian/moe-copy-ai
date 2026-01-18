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
        content: {
          1: "rgba(255, 255, 255, 0.6)",
          2: "rgba(226, 232, 240, 0.6)",
          solid: {
            1: "#fff",
            2: "#fff"
          }
        },
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
          "blue-secondary": "rgb(37 99 235 / 15%)",
          "blue-secondary-hover": "rgb(37 99 235 / 30%)",
          "blue-secondary-active": "rgb(37 99 235 / 40%)",
          purple: "rgb(126 34 206 / <alpha-value>)",
          "purple-hover": "rgb(126 34 206 / 85%)",
          "purple-active": "rgb(126 34 206 / 75%)",
          "purple-secondary": "rgb(126 34 206 / 15%)",
          "purple-secondary-hover": "rgb(126 34 206 / 30%)",
          "purple-secondary-active": "rgb(126 34 206 / 40%)"
        },
        info: "oklch(68.5% 0.169 237.323 / <alpha-value>)",
        "info-hover": "oklch(68.5% 0.169 237.323 / 85%)",
        "info-active": "oklch(68.5% 0.169 237.323 / 75%)",
        "info-secondary": "oklch(68.5% 0.169 237.323 / 15%)",
        "info-secondary-hover": "oklch(68.5% 0.169 237.323 / 30%)",
        "info-secondary-active": "oklch(68.5% 0.169 237.323 / 40%)",
        success: "oklch(72.3% 0.219 149.579 / <alpha-value>)",
        "success-hover": "oklch(72.3% 0.219 149.579 / 85%)",
        "success-active": "oklch(72.3% 0.219 149.579 / 75%)",
        "success-secondary": "oklch(72.3% 0.219 149.579 / 15%)",
        "success-secondary-hover": "oklch(72.3% 0.219 149.579 / 30%)",
        "success-secondary-active": "oklch(72.3% 0.219 149.579 / 40%)",
        warning: "oklch(75% 0.183 55.934 / <alpha-value>)",
        "warning-hover": "oklch(75% 0.183 55.934 / 85%)",
        "warning-active": "oklch(75% 0.183 55.934 / 75%)",
        "warning-secondary": "oklch(75% 0.183 55.934 / 15%)",
        "warning-secondary-hover": "oklch(75% 0.183 55.934 / 30%)",
        "warning-secondary-active": "oklch(75% 0.183 55.934 / 40%)",
        error: "oklch(63.7% 0.237 25.331 / <alpha-value>)",
        "error-hover": "oklch(63.7% 0.237 25.331 / 85%)",
        "error-active": "oklch(63.7% 0.237 25.331 / 75%)",
        "error-secondary": "oklch(63.7% 0.237 25.331 / 15%)",
        "error-secondary-hover": "oklch(63.7% 0.237 25.331 / 30%)",
        "error-secondary-active": "oklch(63.7% 0.237 25.331 / 40%)",
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
