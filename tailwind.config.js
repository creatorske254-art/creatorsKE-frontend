/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── Colors ────────────────────────────────────────────────────────────
      colors: {
        // Base
        white:      '#FFFFFF',
        'off-white':'#F8F7FF',
        black:      '#0D0D0D',
        'near-black':'#111111',
        'page-bg':  '#F2F1F8',

        // Purple scale (brand primary)
        purple: {
          50:  '#F0EEFF',
          100: '#DDD9FD',
          200: '#BAB3FA',
          300: '#9187F7',
          400: '#6B5FF4',
          500: '#5445E8',   // ← primary brand color
          600: '#3D2FD6',
          700: '#2C1FB8',
          800: '#1E1480',
          900: '#110B52',
        },

        // Grey scale
        grey: {
          50:  '#F5F5F5',
          100: '#EBEBEB',
          200: '#D6D6D6',
          300: '#B8B8B8',
          400: '#919191',
          500: '#6E6E6E',
          600: '#4A4A4A',
          700: '#333333',
          800: '#1F1F1F',
          900: '#0D0D0D',
        },

        // Status colors
        success: {
          DEFAULT: '#00B96B',
          bg:      '#E6F9F1',
          text:    '#006B3D',
        },
        warning: {
          DEFAULT: '#F5A623',
          bg:      '#FEF6E7',
          text:    '#7A4A00',
        },
        error: {
          DEFAULT: '#FF4B4B',
          bg:      '#FFF0F0',
          text:    '#8B0000',
        },
        info: {
          DEFAULT: '#4393F5',
          bg:      '#EEF5FF',
          text:    '#1A3F80',
        },
      },

      // ─── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        display: ['Gill Sans MT', 'Gill Sans', 'Calibri', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
        xs:    ['11px', { lineHeight: '1.5' }],
        sm:    ['12px', { lineHeight: '1.5' }],
        base:  ['13px', { lineHeight: '1.55' }],
        md:    ['14px', { lineHeight: '1.5' }],
        lg:    ['15px', { lineHeight: '1.5' }],
        xl:    ['16px', { lineHeight: '1.5' }],
        '2xl': ['18px', { lineHeight: '1.4' }],
        '3xl': ['20px', { lineHeight: '1.35' }],
        '4xl': ['22px', { lineHeight: '1.3' }],
        '5xl': ['26px', { lineHeight: '1.2' }],
        '6xl': ['32px', { lineHeight: '1.1' }],
        '7xl': ['36px', { lineHeight: '1.05' }],
      },

      // ─── Border Radius ──────────────────────────────────────────────────────
      borderRadius: {
        sm:   '4px',
        md:   '8px',
        lg:   '12px',
        xl:   '16px',
        '2xl':'24px',
        pill: '999px',
      },

      // ─── Box Shadows ────────────────────────────────────────────────────────
      boxShadow: {
        xs: '0 1px 2px rgba(0,0,0,0.05)',
        sm: '0 2px 8px rgba(0,0,0,0.06)',
        md: '0 4px 16px rgba(0,0,0,0.08)',
        lg: '0 8px 32px rgba(0,0,0,0.10)',
        xl: '0 16px 48px rgba(0,0,0,0.12)',
        // Purple glow for purple button hover
        'purple-glow': '0 4px 16px rgba(84,69,232,0.30)',
        // Focus ring
        'focus-purple': '0 0 0 3px rgba(84,69,232,0.10)',
      },

      // ─── Spacing extras ─────────────────────────────────────────────────────
      spacing: {
        '18': '72px',
        '22': '88px',
      },

      // ─── Border widths ──────────────────────────────────────────────────────
      borderWidth: {
        DEFAULT: '0.5px',
        '0': '0',
        '1': '1px',
        '2': '2px',
        '1.5': '1.5px',
      },

      // ─── Letter spacing ─────────────────────────────────────────────────────
      letterSpacing: {
        tightest: '-0.02em',
        tighter:  '-0.01em',
        tight:    '-0.005em',
        normal:   '0',
        wide:     '0.05em',
        wider:    '0.07em',
        widest:   '0.10em',
        caps:     '0.14em',
      },

      // ─── Animation ──────────────────────────────────────────────────────────
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        'slide-in-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
      },
      animation: {
        shimmer:     'shimmer 1.4s infinite linear',
        'spin-fast': 'spin 0.7s linear infinite',
        'slide-up':  'slide-in-up 0.2s ease-out',
        'fade-in':   'fade-in 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
