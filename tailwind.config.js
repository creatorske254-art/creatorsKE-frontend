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
        // Base — black/page-bg match src/index.css's --black/--page-bg
        white:      '#FFFFFF',
        'off-white':'#F8F7FF',
        black:      '#000000',
        'near-black':'#111111',
        'page-bg':  '#F2F2F2',

        // Purple scale (brand primary) — matches src/index.css's --purple-*
        purple: {
          50:  '#EEEDFE',
          100: '#CECBF6',
          200: '#AFA9EC',
          300: '#948CE3',
          400: '#7F77DD',
          500: '#665DC7',
          600: '#534AB7',   // ← primary brand color
          700: '#463D9E',
          800: '#3C3489',
          900: '#26215C',
        },

        // Grey scale — matches src/index.css's --grey-*
        grey: {
          50:  '#F2F2F2',
          100: '#E5E5E5',
          200: '#CCCCCC',
          300: '#B3B3B3',
          400: '#999999',
          500: '#808080',
          600: '#666666',
          700: '#4D4D4D',
          800: '#262626',
          900: '#1A1A1A',
        },

        // Status colors — matches src/index.css's --status-*
        success: {
          DEFAULT: '#10B981',
          bg:      '#DCFCE7',
          text:    '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg:      '#FEF3C7',
          text:    '#B45309',
        },
        error: {
          DEFAULT: '#EF4444',
          bg:      '#FEE2E2',
          text:    '#B91C1C',
        },
        info: {
          DEFAULT: '#06B6D4',
          bg:      '#CFFAFE',
          text:    '#0E7490',
        },
      },

      // ─── Typography ────────────────────────────────────────────────────────
      fontFamily: {
        display: ['Archivo', 'sans-serif'],
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
