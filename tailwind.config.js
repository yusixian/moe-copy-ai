/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./popup.tsx",
    "./options.tsx",
    "./background.ts",
    "./contents/**/*.{ts,tsx}",
    "./styles/**/*.css"
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
        }
      }
    }
  },
  plugins: []
}
export default config
