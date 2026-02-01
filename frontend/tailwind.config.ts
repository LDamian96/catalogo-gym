import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			// V0 Colors - Cyan/Blue Palette
  			v0: {
  				bg: '#000000',
  				'bg-light': '#fafafa',
  				card: '#0a0a0a',
  				'card-light': '#ffffff',
  				border: 'rgba(255, 255, 255, 0.08)',
  				'border-light': 'rgba(0, 0, 0, 0.08)',
  				hover: 'rgba(34, 211, 238, 0.1)',
  				'hover-light': 'rgba(34, 211, 238, 0.08)',
  				accent: '#22d3ee',
  				'accent-dark': '#0891b2',
  				'accent-glow': 'rgba(34, 211, 238, 0.3)',
  				// Cyan/Blue palette
  				cyan: '#22d3ee',
  				'cyan-light': '#67e8f9',
  				'cyan-dark': '#06b6d4',
  				blue: '#3b82f6',
  				'blue-light': '#60a5fa',
  				'blue-dark': '#2563eb',
  				sky: '#0ea5e9',
  				'sky-light': '#38bdf8',
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'v0': '0.5rem',
  			'v0-lg': '0.75rem',
  			'v0-xl': '1rem',
  			'v0-2xl': '1.25rem',
  		},
  		// V0 Animation Keyframes
  		keyframes: {
  			'v0-fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			'v0-fade-up': {
  				'0%': { opacity: '0', transform: 'translateY(16px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			'v0-fade-down': {
  				'0%': { opacity: '0', transform: 'translateY(-16px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			'v0-scale-in': {
  				'0%': { opacity: '0', transform: 'scale(0.96)' },
  				'100%': { opacity: '1', transform: 'scale(1)' },
  			},
  			'v0-slide-in-right': {
  				'0%': { opacity: '0', transform: 'translateX(16px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' },
  			},
  			'v0-slide-in-left': {
  				'0%': { opacity: '0', transform: 'translateX(-16px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' },
  			},
  			'v0-glow-pulse': {
  				'0%, 100%': { boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)' },
  				'50%': { boxShadow: '0 0 40px rgba(34, 211, 238, 0.4)' },
  			},
  			'v0-glow-pulse-blue': {
  				'0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)' },
  				'50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)' },
  			},
  			'v0-border-flow': {
  				'0%': { backgroundPosition: '0% 50%' },
  				'50%': { backgroundPosition: '100% 50%' },
  				'100%': { backgroundPosition: '0% 50%' },
  			},
  			'v0-shimmer': {
  				'0%': { transform: 'translateX(-100%)' },
  				'100%': { transform: 'translateX(100%)' },
  			},
  			'v0-float': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-12px)' },
  			},
  			'v0-pulse-soft': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.6' },
  			},
  			'v0-spin-slow': {
  				'0%': { transform: 'rotate(0deg)' },
  				'100%': { transform: 'rotate(360deg)' },
  			},
  			'v0-bounce-soft': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-6px)' },
  			},
  			'v0-border-glow': {
  				'0%, 100%': { borderColor: 'rgba(34, 211, 238, 0.3)' },
  				'50%': { borderColor: 'rgba(34, 211, 238, 0.6)' },
  			},
  		},
  		// V0 Animation Classes
  		animation: {
  			'v0-fade-in': 'v0-fade-in 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-fade-up': 'v0-fade-up 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-fade-down': 'v0-fade-down 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-scale-in': 'v0-scale-in 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-slide-in-right': 'v0-slide-in-right 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-slide-in-left': 'v0-slide-in-left 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-glow-pulse': 'v0-glow-pulse 2.5s ease-in-out infinite',
  			'v0-glow-pulse-blue': 'v0-glow-pulse-blue 2.5s ease-in-out infinite',
  			'v0-border-flow': 'v0-border-flow 3s linear infinite',
  			'v0-shimmer': 'v0-shimmer 2s ease-in-out infinite',
  			'v0-float': 'v0-float 5s ease-in-out infinite',
  			'v0-pulse-soft': 'v0-pulse-soft 3s ease-in-out infinite',
  			'v0-spin-slow': 'v0-spin-slow 10s linear infinite',
  			'v0-bounce-soft': 'v0-bounce-soft 2s ease-in-out infinite',
  			'v0-border-glow': 'v0-border-glow 2s ease-in-out infinite',
  		},
  		// V0 Transition Timing Functions
  		transitionTimingFunction: {
  			'v0': 'cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'v0-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
  		},
  		// V0 Transition Durations
  		transitionDuration: {
  			'v0-fast': '150ms',
  			'v0': '300ms',
  			'v0-slow': '500ms',
  			'v0-slower': '700ms',
  		},
  		// V0 Box Shadows - Cyan/Blue
  		boxShadow: {
  			'v0-glow': '0 0 20px rgba(34, 211, 238, 0.25)',
  			'v0-glow-sm': '0 0 10px rgba(34, 211, 238, 0.2)',
  			'v0-glow-lg': '0 0 40px rgba(34, 211, 238, 0.35)',
  			'v0-glow-intense': '0 0 60px rgba(34, 211, 238, 0.45)',
  			'v0-glow-blue': '0 0 20px rgba(59, 130, 246, 0.25)',
  			'v0-glow-sky': '0 0 20px rgba(14, 165, 233, 0.25)',
  			'v0-card': '0 0 0 1px rgba(255, 255, 255, 0.08)',
  			'v0-card-hover': '0 0 0 1px rgba(34, 211, 238, 0.4), 0 8px 40px rgba(34, 211, 238, 0.15)',
  			'v0-card-hover-blue': '0 0 0 1px rgba(59, 130, 246, 0.4), 0 8px 40px rgba(59, 130, 246, 0.15)',
  		},
  		// V0 Background Images - Cyan/Blue
  		backgroundImage: {
  			'v0-gradient': 'linear-gradient(135deg, #22d3ee 0%, #0ea5e9 50%, #3b82f6 100%)',
  			'v0-gradient-soft': 'linear-gradient(135deg, #67e8f9 0%, #38bdf8 50%, #60a5fa 100%)',
  			'v0-gradient-radial': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(34, 211, 238, 0.2), transparent)',
  			'v0-mesh': 'radial-gradient(at 40% 20%, hsla(192, 91%, 60%, 0.1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(199, 89%, 60%, 0.08) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(192, 91%, 60%, 0.06) 0px, transparent 50%)',
  			'v0-gradient-border': 'linear-gradient(135deg, #22d3ee, #3b82f6)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
