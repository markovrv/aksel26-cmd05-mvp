/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#6D28D9', hover: '#7C3AED', light: '#A855F7' },
        surface:   { DEFAULT: '#FFFFFF', card: '#E9D5FF', bg: '#F5F3FF' },
        graphite:  { DEFAULT: '#1F2937', muted: '#6B7280', border: '#D1D5DB' },
        success:   '#22C55E',
        warning:   '#F59E0B',
        premium:   '#EC4899',
        cyan:      '#06B6D4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6D28D9 0%, #A855F7 100%)',
        'gradient-cta':   'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        'gradient-dark':  'linear-gradient(135deg, #1F2937 0%, #6D28D9 100%)',
      },
      boxShadow: {
        'card':  '0 4px 24px rgba(109, 40, 217, 0.10)',
        'btn':   '0 4px 16px rgba(109, 40, 217, 0.30)',
        'hover': '0 8px 32px rgba(109, 40, 217, 0.20)',
      },
    },
  },
  plugins: [],
}