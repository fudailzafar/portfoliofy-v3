import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-graphik)', 'sans-serif'],
        serif: ['var(--font-signifier)', 'serif'],
        mono: ['var(--font-diatype-mono)', 'monospace'],
      },
      fontWeight: {
        thin: '400',
        extralight: '400',
        light: '400',
        normal: '400',
        medium: '500',
        semibold: '400',
        bold: '400',
        extrabold: '400',
        black: '400',
      },
      fontSize: {
        xs: ['0.75rem', '1.6'],
        sm: ['0.875rem', '1.6'],
      },
      colors: {
        theme: {
          bg: 'var(--theme-bg)',
          primary: 'var(--theme-primary)',
          secondary: 'var(--theme-secondary)',
          muted: 'var(--theme-muted)',
          border: 'var(--theme-border)',
          accent: 'var(--theme-accent)',
        },
        design: {
          black: '#1f1f1f',
          white: '#ffffff',
          gray: '#5d5d5d',
          resume: '#6B7280',
        },
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          card: 'var(--surface-card)',
        },
        content: {
          primary: 'var(--content-primary)',
          secondary: 'var(--content-secondary)',
          muted: 'var(--content-muted)',
        },
        action: {
          primary: 'var(--action-primary)',
          'primary-hover': 'var(--action-primary-hover)',
          foreground: 'var(--action-foreground)',
          danger: 'var(--action-danger)',
          'danger-hover': 'var(--action-danger-hover)',
          'danger-foreground': 'var(--action-danger-foreground)',
        },
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
export default config;
