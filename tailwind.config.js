/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#050505',
          card: '#0F0F11',
          lime: '#D3F36B', 
          limeHover: '#bce055',
        }
      },
      transitionTimingFunction: {
          'fluid': 'cubic-bezier(0.16, 1, 0.3, 1)',
          'spring': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
          'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          'fade-in': 'fadeIn 0.6s ease-out forwards',
          'spin-slow': 'spin 12s linear infinite',
          'float': 'float 8s ease-in-out infinite',
          'float-delayed': 'float 8s ease-in-out 4s infinite',
          'scale-up': 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          'morph': 'morph 8s ease-in-out infinite',
      },
      keyframes: {
          fadeInUp: {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
          },
          fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
          },
          scaleUp: {
              '0%': { opacity: '0', transform: 'scale(0.96)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
          },
          float: {
              '0%, 100%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-15px)' },
          },
          morph: {
              '0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
              '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
              '100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }
          }
      }
    },
  },
  plugins: [],
}
