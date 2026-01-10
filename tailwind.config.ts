import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        dark: {
          bg: '#0b0b0b',
          card: '#141414',
          border: '#2a2a2a',
          hover: '#1f1f1f',
        },
        accent: {
          green: '#00d26a',
          red: '#ff4757',
          blue: '#3b82f6',
          yellow: '#ffc107',
          purple: '#8b5cf6',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b0b0b0',
          muted: '#888888',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
