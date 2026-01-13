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
        display: ['"Space Grotesk"', 'sans-serif'],
        blockat: ['Blockat', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#050505',
          card: '#0A0A0B',
          lime: '#14B8A6',
          limeHover: '#0D9488',
          limeMuted: 'rgba(20,184,166,0.08)',
        },
        gray: {
          750: '#2e2e33',
          850: '#1f1f23',
          950: '#09090b',
        }
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'sm': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.005em' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
        '5xl': ['3rem', { lineHeight: '1.1' }],
        '6xl': ['3.75rem', { lineHeight: '1.05' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      transitionDuration: {
        '180': '180ms',
      },
      transitionTimingFunction: {
        'fluid': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'spin-slow': 'spin 12s linear infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-delayed': 'float 8s ease-in-out 4s infinite',
        'scale-up': 'scaleUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'morph': 'morph 8s ease-in-out infinite',
        'claude-fade': 'claudeFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'stagger-reveal': 'staggerReveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
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
        },
        claudeFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        staggerReveal: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },

      }
    },
  },
  plugins: [],
}
