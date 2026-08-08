import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

/**
 * V-TAPP 2026 design tokens.
 *
 * The dark palette is Tokyo Night-inspired: blue-black surfaces, periwinkle
 * text and electric blue/cyan accents. The system is technical rather than
 * decorative: near-zero radii, hairline borders, monospace labels and light
 * weights at display sizes. Light mode keeps its high-contrast cyan identity.
 *
 * THEMING
 * Surfaces, foreground and greys are CSS variables rather than fixed hexes, so
 * the exact same class names invert between dark and light. `text-white`
 * resolves to near-black in light mode, `bg-ink-950` to near-white, and every
 * `border-white/10` hairline flips with them. The brand ramp is variable too,
 * so every `brand-*` utility follows the active theme.
 *
 * The `<alpha-value>` placeholder is what lets `border-white/10` keep working:
 * each variable holds raw "R G B" channels, not a colour function.
 */
const v = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // surfaces
        ink: {
          950: v('--ink-950'),
          900: v('--ink-900'),
          800: v('--ink-800'),
          700: v('--ink-700'),
          600: v('--ink-600'),
        },
        // foreground and its inverse. `white` is the ink of the current theme.
        white: v('--fg'),
        black: v('--inv'),
        // secondary text ramp, dimmest at 700 in both themes
        slate: {
          100: v('--slate-100'),
          200: v('--slate-200'),
          300: v('--slate-300'),
          400: v('--slate-400'),
          500: v('--slate-500'),
          600: v('--slate-600'),
          700: v('--slate-700'),
        },
        // ticker bar and blueprint line art
        bone: v('--bone'),
        // status colours, also themed so they stay legible on either background
        emerald: { 200: v('--em-200'), 300: v('--em-300'), 400: v('--em-400'), 500: v('--em-500') },
        rose: { 200: v('--ro-200'), 300: v('--ro-300'), 400: v('--ro-400'), 500: v('--ro-500') },
        amber: { 300: v('--am-300'), 400: v('--am-400'), 500: v('--am-500') },
        // Theme-aware brand ramp: Tokyo blue in dark mode, cyan in light mode.
        brand: {
          50: v('--brand-50'),
          100: v('--brand-100'),
          200: v('--brand-200'),
          300: v('--brand-300'),
          400: v('--brand-400'),
          500: v('--brand-500'),
          600: v('--brand-600'),
          700: v('--brand-700'),
          800: v('--brand-800'),
          900: v('--brand-900'),
          950: v('--brand-950'),
        },
      },
      fontFamily: {
        display: ['var(--font-wordmark)', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-original-mono)', 'monospace'],
        logo: ['var(--font-original-mono)', 'monospace'],
        wordmark: ['var(--font-wordmark)', 'Ethnocentric', 'sans-serif'],
      },
      fontSize: {
        xs: ['10px', { lineHeight: '1.2' }],
        sm: ['12px', { lineHeight: '1.3' }],
        base: ['14px', { lineHeight: '1.4' }],
        lg: ['16px', { lineHeight: '1.1' }],
        xl: ['18px', { lineHeight: '1.1' }],
        '2xl': ['20px', { lineHeight: '1.1' }],
        '3xl': ['24px', { lineHeight: '1.1' }],
        '4xl': ['30px', { lineHeight: '1.1' }],
        '5xl': ['40px', { lineHeight: '1' }],
        '6xl': ['50px', { lineHeight: '1' }],
        '7xl': ['60px', { lineHeight: '1' }],
        '8xl': ['80px', { lineHeight: '1' }],
        '9xl': ['100px', { lineHeight: '1' }],
      },
      borderRadius: {
        DEFAULT: '0px',
        sm: '1px',
        md: '2px',
        lg: '2px',
        xl: '2px',
        '2xl': '3px',
        full: '9999px',
      },
      letterSpacing: {
        label: '0.22em',
        wide2: '0.34em',
        tightest: '-0.035em',
      },
      aspectRatio: { poster: '4 / 5' },
      boxShadow: {
        hair: '0 0 0 1px rgb(var(--fg) / 0.08)',
        glow: '0 0 60px -20px rgba(var(--brand-rgb),0.7)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(-50%)' }, to: { transform: 'translateX(0)' } },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        blink: { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        scan: { from: { transform: 'translateY(-100%)' }, to: { transform: 'translateY(100%)' } },
      },
      animation: {
        marquee: 'marquee 80s linear infinite',
        fadeUp: 'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both',
        blink: 'blink 1.1s step-end infinite',
        scan: 'scan 7s linear infinite',
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant('light', '.light &');
    }),
  ],
};

export default config;
