/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6fb",
          100: "#d5eaf5",
          200: "#add5eb",
          300: "#7ab8db",
          400: "#4695c4",
          500: "#2c78a8",
          600: "#1f5f8a",
          700: "#1a4c6f",
          800: "#19415c",
          900: "#18374d",
          950: "#0f2333"
        },
        accent: {
          400: "#f0a04b",
          500: "#e8892a",
          600: "#c96b1a"
        }
      },
      fontFamily: {
        sans: [
          "Source Sans 3",
          "Segoe UI",
          "system-ui",
          "sans-serif"
        ],
        display: [
          "Fraunces",
          "Georgia",
          "serif"
        ]
      },
      backgroundImage: {
        "page-mesh":
          "radial-gradient(ellipse 80% 50% at 20% -10%, rgba(44,120,168,0.18), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(232,137,42,0.12), transparent), linear-gradient(180deg, #f4f8fb 0%, #e8eef4 100%)"
      }
    }
  },
  plugins: []
};
