import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1B17",
        paper: "#F7F5F0",
        brand: {
          50: "#EFFBF6",
          100: "#D7F3E7",
          300: "#8FDCB9",
          500: "#2FAE79",
          600: "#218A60",
          700: "#186A49",
        },
      },
    },
  },
  plugins: [],
};

export default config;
