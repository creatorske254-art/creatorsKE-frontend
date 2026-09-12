// Every colour utility resolves to the matching CSS custom property from
// src/index.css rather than a copied hex value, so `bg-white`, `text-grey-600`,
// `bg-purple-50` etc. follow the `.dark` token set exactly like `var(--white)`
// does. (Hardcoded hex here was why dark mode produced white text on white
// cards: `text-[var(--black)]` flipped to white while Tailwind's `bg-white`
// stayed #FFFFFF.) Opacity modifiers like `text-white/60` still work — the
// alpha is applied with color-mix, which this codebase already relies on.
const token = (cssVar) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `var(${cssVar})`
    : `color-mix(in srgb, var(${cssVar}) calc(${opacityValue} * 100%), transparent)`;

const scale = (prefix, steps) =>
  Object.fromEntries(steps.map((s) => [s, token(`--${prefix}-${s}`)]));

const status = (name) => ({
  DEFAULT: token(`--status-${name}`),
  bg:      token(`--status-${name}-bg`),
  text:    token(`--status-${name}-text`),
});

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
        white:     token('--white'),
        black:     token('--black'),
        'page-bg': token('--page-bg'),
        // Deliberately literal: text sitting on a fixed brand/status hue
        // (purple buttons, green WhatsApp button, gradient avatars) must stay
        // white in both themes, because that surface never flips. Use this
        // instead of `text-white` there — `text-white` follows the theme.
        'on-accent': '#FFFFFF',

        purple: scale('purple', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        grey:   scale('grey',   [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),

        success: status('success'),
        warning: status('warning'),
        error:   status('error'),
        info:    status('info'),
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

      // Spacing: Tailwind's default 4px scale is the app's spacing scale
      // (p-4 = 16px = --space-16). No fractional (1.5/2.5) or arbitrary px
      // utilities - snap to the nearest whole step instead.

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
      // Skeleton shimmer lives solely in src/index.css (.skeleton) so there is
      // exactly one definition of its speed app-wide — don't re-add one here.
      keyframes: {
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
