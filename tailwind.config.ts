import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f0f4ff',
          100: '#dce8ff',
          200: '#b3ccff',
          300: '#6699ff',
          400: '#3366ff',
          500: '#1a4dff',
          600: '#0033cc',
          700: '#002299',
          800: '#001166',
          900: '#000833',
        },
        canvas: {
          light: '#fafaf8',
          dark: '#1a1a1e',
        },
        toolbar: {
          light: '#ffffff',
          dark: '#2a2a2e',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        bengali: ['var(--font-noto-bengali)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'toolbar': '0 2px 12px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1)',
        'modal': '0 20px 60px rgba(0,0,0,0.15)',
        'canvas-item': '0 2px 8px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
};

export default config;
