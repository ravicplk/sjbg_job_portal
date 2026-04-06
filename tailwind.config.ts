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
        primary: {
          DEFAULT: '#520120',
          light: '#6E1637',
          dark: '#3C0018',
        },
        accent: {
          DEFAULT: '#F2B705',
          light: '#F7C534',
          dark: '#D49A00',
        },
        gold: {
          DEFAULT: '#E6A817',
          light: '#F2B705',
          dark: '#B98308',
        },
        action: {
          DEFAULT: '#102A4C',
          light: '#1D3D68',
          dark: '#0B1D36',
        },
        midnight: {
          DEFAULT: '#111827',
          light: '#1F2937',
          dark: '#0B1120',
        },
        charcoal: {
          DEFAULT: '#1E1E1E',
          light: '#2A2A2A',
          dark: '#141414',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        serif: ['var(--font-inter)', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
