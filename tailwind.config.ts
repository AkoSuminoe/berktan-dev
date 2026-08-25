import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  // Compiles every `hover:` utility to @media (hover: hover), so a tap on a
  // touch device can never leave an element stuck in its hover state.
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        abyss: '#050506',
        surface: {
          DEFAULT: '#0e0e11',
          raised: '#131317',
        },
        ink: {
          DEFAULT: '#f5f5f7',
          dim: '#9d9da7',
          faint: '#606069',
        },
        glow: {
          DEFAULT: '#828fff',
          deep: '#5e6ad2',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        // iOS drawer curve (Ionic). On-screen travel of large surfaces.
        cinematic: 'cubic-bezier(0.32, 0.72, 0, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        // Default for anything entering, exiting, or responding to a press.
        'out-strong': 'cubic-bezier(0.23, 1, 0.32, 1)',
        // Anything morphing in place.
        'in-out-strong': 'cubic-bezier(0.77, 0, 0.175, 1)',
      },
      animation: {
        marquee: 'marquee 80s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
