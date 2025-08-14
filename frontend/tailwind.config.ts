import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        // Custom font sizes for consistent typography
        'hero-h1': ['2.5rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }], // 40px
        'hero-h2': ['2rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }], // 32px
        'hero-h3': ['1.5rem', { lineHeight: '1.4', letterSpacing: '-0.02em' }], // 24px
        'section-h1': ['2rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }], // 32px
        'section-h2': ['1.5rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }], // 24px
        'section-h3': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }], // 20px
        'content-h1': ['1.25rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }], // 20px
        'content-h2': ['1.125rem', { lineHeight: '1.5', letterSpacing: '-0.01em' }], // 18px
        'body-large': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0em' }], // 18px
        'body-base': ['1rem', { lineHeight: '1.6', letterSpacing: '0em' }], // 16px
        'body-small': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0em' }], // 14px
        'body-xs': ['0.75rem', { lineHeight: '1.6', letterSpacing: '0em' }], // 12px
      },
      spacing: {
        // Standardized spacing scale
        'xs': '4px',    // 4px
        'sm': '8px',    // 8px
        'md': '12px',   // 12px
        'base': '16px', // 16px
        'lg': '24px',   // 24px
        'xl': '32px',   // 32px
        '2xl': '48px',  // 48px
        '3xl': '64px',  // 64px
        '70': '17.5rem', // 280px for sidebar
        '80': '20rem',   // 320px for larger sidebar
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      width: {
        '70': '17.5rem', // 280px for sidebar
        '80': '20rem',   // 320px for larger sidebar
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      lineClamp: {
        '2': '2',
        '3': '3',
      },
    },
  },
  plugins: [],
} satisfies Config
