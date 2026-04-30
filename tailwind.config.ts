import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E8C97A',
          dark:    '#8A6A1F',
          muted:   '#6B5B2E',
          glow:    'rgba(201,168,76,0.15)',
        },
        palace: {
          black:    '#0A0805',
          charcoal: '#141210',
          smoke:    '#1E1A15',
          stone:    '#2C2720',
          maroon:   '#5C1A1A',
        },
        cream: '#FFF9F2',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body:    ['var(--font-body)', 'sans-serif'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateZ(0)' },
          '50%':      { transform: 'translateY(-10px) translateZ(20px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.03)' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px 2px rgba(201,168,76,0.2)' },
          '50%':      { boxShadow: '0 0 35px 8px rgba(201,168,76,0.45)' },
        },
      },
      animation: {
        float:       'float 6s ease-in-out infinite',
        shimmer:     'shimmer 3s linear infinite',
        breathe:     'breathe 5s ease-in-out infinite',
        'fade-up':   'fade-up 1s ease forwards',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    // Scrollbar-hide utility for the horizontal tab navigation
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
      })
    }),
  ],
};
export default config;
