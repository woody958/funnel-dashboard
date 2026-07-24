import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#0F1117",
          secondary: "#1A1D2E",
          card: "#1E2235",
          hover: "#252840",
        },
        border: {
          DEFAULT: "#2A2D45",
          light: "#363A55",
        },
        accent: {
          blue: "#4F8EF7",
          purple: "#8B5CF6",
          green: "#10B981",
          red: "#EF4444",
          yellow: "#F59E0B",
          cyan: "#06B6D4",
          pink: "#EC4899",
        },
      },
    },
  },
  plugins: [],
};
export default config;
