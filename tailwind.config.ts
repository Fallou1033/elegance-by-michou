import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        ivory: '#FAF9F6',
        anthracite: '#1A1A1A',
        stone: '#8C8C88',
        terracotta: '#C4704F',
      },
      animation: {
        'badge-pop': 'badgePop 0.3s ease-out',
      },
      keyframes: {
        badgePop: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.4)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
