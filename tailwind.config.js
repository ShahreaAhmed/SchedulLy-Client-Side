/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0edff',
          100: '#e0d9ff',
          200: '#c2b3ff',
          300: '#a38dff',
          400: '#8566ff',
          500: '#6640ff',
          600: '#5533cc',
          700: '#442699',
          800: '#331a66',
          900: '#220d33',
        },
        violet: {
          DEFAULT: '#6640ff',
          light: '#8566ff',
          dark: '#5533cc',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 20px rgba(102, 64, 255, 0.08)',
        'card-hover': '0 8px 40px rgba(102, 64, 255, 0.15)',
        'glow': '0 0 30px rgba(102, 64, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
