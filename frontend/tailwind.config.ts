import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				primary: {
					DEFAULT: '#ff6b35',
					light: '#f7931e',
					foreground: '#fff',
				},
				orange: {
					DEFAULT: '#ff6b35',
					light: '#f7931e',
				},
				glass: 'rgba(30, 30, 40, 0.6)',
				'glass-light': 'rgba(255,255,255,0.15)',
				'glass-dark': 'rgba(30,30,40,0.7)',
			},
			backgroundImage: {
				'gradient-orange': 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)',
				'gradient-orange-hover': 'linear-gradient(90deg, #f7931e 0%, #ff6b35 100%)',
				'gradient-dark': 'linear-gradient(135deg, #232526 0%, #414345 100%)',
			},
			backdropBlur: {
				xl: '24px',
			},
			borderRadius: {
				lg: '1.25rem',
				md: '0.75rem',
				sm: '0.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
