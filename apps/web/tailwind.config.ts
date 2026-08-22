import type { Config } from 'tailwindcss';

/**
 * Liara design tokens, transcribed from `خدمات-رایانش-ابری---لیارا-DESIGN.md`
 * (frequency-extracted dark set: #111111 base, #eeeeee text, #00eac7 accent,
 * #87fcc4 secondary accent, Yekan type scale 12/14/15/16px, radii 4/10/22/50px).
 * Color values live as RGB triplets in globals.css so opacity modifiers work.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'rgb(var(--border) / 0.14)',
        input: 'rgb(var(--border) / 0.2)',
        ring: 'rgb(var(--ring) / <alpha-value>)',
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        accent: 'rgb(var(--accent) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Yekan Bakh', 'system-ui', '-apple-system', 'Tahoma', 'sans-serif'],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      fontSize: {
        section: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        subsection: ['15px', { lineHeight: '22px', fontWeight: '600' }],
        body: ['15px', '22px'],
        micro: ['12px', '18px'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '10px',
        md: '10px',
        card: '10px',
        hero: '22px',
        lg: '22px',
        pill: '50px',
      },
      spacing: {
        sidebar: '300px',
      },
    },
  },
  plugins: [],
};

export default config;
