import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F172A',
          foreground: '#FFFFFF'
        },
        background: '#F8FAFC',
        surface: '#FFFFFF'
      }
    },
  },
  plugins: [],
};
export default config;
