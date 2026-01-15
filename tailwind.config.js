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
        sans: ['Genos', 'sans-serif'],
        display: ['"Astro Outline"', 'sans-serif'],
        logo: ['Astro', 'sans-serif'],
        'logo-outline': ['"Astro Outline"', 'sans-serif'],
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
        },
        // Neobrutalist theme colors
        main: 'var(--main)',
        overlay: 'var(--overlay)',
        bg: 'var(--bg)',
        bw: 'var(--bw)',
        blank: 'var(--blank)',
        text: 'var(--text)',
        mtext: 'var(--mtext)',
        border: 'var(--border)',
        ring: 'var(--ring)',
        ringOffset: 'var(--ring-offset)',
        secondaryBlack: '#212121',
      },
      fontSize: {
        // 1.4 ratio type scale with built-in tracking & line-height
        'xs': ['var(--text-xs)', { lineHeight: 'var(--leading-relaxed)', letterSpacing: '0.01em' }],
        'sm': ['var(--text-sm)', { lineHeight: 'var(--leading-relaxed)', letterSpacing: '0.01em' }],
        'base': ['var(--text-base)', { lineHeight: 'var(--leading-normal)', letterSpacing: '0' }],
        'lg': ['var(--text-lg)', { lineHeight: 'var(--leading-normal)', letterSpacing: '0' }],
        'xl': ['var(--text-xl)', { lineHeight: 'var(--leading-snug)', letterSpacing: '-0.01em' }],
        '2xl': ['var(--text-2xl)', { lineHeight: 'var(--leading-snug)', letterSpacing: '-0.02em' }],
        '3xl': ['var(--text-3xl)', { lineHeight: 'var(--leading-tight)', letterSpacing: '-0.02em' }],
        '4xl': ['var(--text-4xl)', { lineHeight: 'var(--leading-tight)', letterSpacing: '-0.03em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        base: '5px',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        shadow: 'var(--shadow)',
      },
      translate: {
        boxShadowX: '4px',
        boxShadowY: '4px',
        reverseBoxShadowX: '-4px',
        reverseBoxShadowY: '-4px',
      },
      fontWeight: {
        base: '500',
        heading: '700',
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
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
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
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      }
    },
  },
  plugins: [],
}
