import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f6f4",
          100: "#eeebe6",
          200: "#ddd6cc",
          300: "#c4b9a8",
          400: "#a8967a",
          500: "#937d5f",
          600: "#886a52",
          700: "#715645",
          800: "#5e493b",
          900: "#4e3e33",
        },
        sage: {
          50: "#f3f6f4",
          100: "#e3ebe6",
          200: "#c7d7cd",
          300: "#a0baab",
          400: "#739684",
          500: "#527a66",
          600: "#3f6252",
          700: "#345044",
          800: "#2c4338",
          900: "#263830",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
