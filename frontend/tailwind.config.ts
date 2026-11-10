import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b1020',
        surface: '#111827',
        surface2: '#0f172a',
        border: '#243044',
        accent: {
          blue: '#3b82f6',
          violet: '#8b5cf6',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(59,130,246,0.15), 0 10px 30px rgba(2,6,23,0.5)',
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.18), transparent 35%), radial-gradient(circle at 80% 0%, rgba(139,92,246,0.18), transparent 30%)',
      },
    },
  },
  plugins: [],
} satisfies Config
