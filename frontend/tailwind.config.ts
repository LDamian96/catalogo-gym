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
  			// V0 Soft Colors - Violet/Purple/Pink Palette
  			v0: {
  				bg: '#0a0a0f',
  				'bg-light': '#fafafa',
  				card: '#12121a',
  				'card-light': '#ffffff',
  				border: 'rgba(255, 255, 255, 0.06)',
  				'border-light': 'rgba(0, 0, 0, 0.06)',
  				hover: 'rgba(167, 139, 250, 0.1)',
  				'hover-light': 'rgba(139, 92, 246, 0.05)',
  				accent: '#a78bfa',
  				'accent-dark': '#8b5cf6',
  				'accent-glow': 'rgba(167, 139, 250, 0.3)',
  				// Extended soft palette
  				violet: '#8b5cf6',
  				'violet-light': '#a78bfa',
  				purple: '#a855f7',
  				'purple-light': '#c084fc',
  				pink: '#ec4899',
  				'pink-light': '#f472b6',
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'v0': '0.625rem',
  			'v0-lg': '0.875rem',
  			'v0-xl': '1rem',
  		},
  		// V0 Animation Keyframes
  		keyframes: {
  			'v0-fade-in': {
  				'0%': { opacity: '0' },
  				'100%': { opacity: '1' },
  			},
  			'v0-fade-up': {
  				'0%': { opacity: '0', transform: 'translateY(20px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			'v0-fade-down': {
  				'0%': { opacity: '0', transform: 'translateY(-20px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  			'v0-scale-in': {
  				'0%': { opacity: '0', transform: 'scale(0.95)' },
  				'100%': { opacity: '1', transform: 'scale(1)' },
  			},
  			'v0-slide-in-right': {
  				'0%': { opacity: '0', transform: 'translateX(20px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' },
  			},
  			'v0-slide-in-left': {
  				'0%': { opacity: '0', transform: 'translateX(-20px)' },
  				'100%': { opacity: '1', transform: 'translateX(0)' },
  			},
  			'v0-glow-pulse': {
  				'0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' },
  				'50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.4)' },
  			},
  			'v0-glow-pulse-pink': {
  				'0%, 100%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.2)' },
  				'50%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.4)' },
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
  				'50%': { transform: 'translateY(-10px)' },
  			},
  			'v0-pulse-soft': {
  				'0%, 100%': { opacity: '1' },
  				'50%': { opacity: '0.7' },
  			},
  			'v0-spin-slow': {
  				'0%': { transform: 'rotate(0deg)' },
  				'100%': { transform: 'rotate(360deg)' },
  			},
  			'v0-bounce-soft': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-5px)' },
  			},
  		},
  		// V0 Animation Classes
  		animation: {
  			'v0-fade-in': 'v0-fade-in 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-fade-up': 'v0-fade-up 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-fade-down': 'v0-fade-down 0.6s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-scale-in': 'v0-scale-in 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-slide-in-right': 'v0-slide-in-right 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-slide-in-left': 'v0-slide-in-left 0.5s cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-glow-pulse': 'v0-glow-pulse 2s ease-in-out infinite',
  			'v0-border-flow': 'v0-border-flow 3s linear infinite',
  			'v0-shimmer': 'v0-shimmer 2s ease-in-out infinite',
  			'v0-float': 'v0-float 4s ease-in-out infinite',
  			'v0-pulse-soft': 'v0-pulse-soft 2s ease-in-out infinite',
  			'v0-spin-slow': 'v0-spin-slow 8s linear infinite',
  			'v0-bounce-soft': 'v0-bounce-soft 2s ease-in-out infinite',
  		},
  		// V0 Transition Timing Functions
  		transitionTimingFunction: {
  			'v0': 'cubic-bezier(0.32, 0.72, 0, 1)',
  			'v0-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  			'v0-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
  		},
  		// V0 Transition Durations
  		transitionDuration: {
  			'v0-fast': '200ms',
  			'v0': '400ms',
  			'v0-slow': '600ms',
  			'v0-slower': '800ms',
  		},
  		// V0 Soft Box Shadows - Violet/Purple/Pink
  		boxShadow: {
  			'v0-glow': '0 0 20px rgba(139, 92, 246, 0.25)',
  			'v0-glow-sm': '0 0 10px rgba(139, 92, 246, 0.2)',
  			'v0-glow-lg': '0 0 40px rgba(139, 92, 246, 0.35)',
  			'v0-glow-intense': '0 0 60px rgba(139, 92, 246, 0.45)',
  			'v0-glow-pink': '0 0 20px rgba(236, 72, 153, 0.25)',
  			'v0-glow-purple': '0 0 20px rgba(168, 85, 247, 0.25)',
  			'v0-card': '0 0 0 1px rgba(255, 255, 255, 0.06)',
  			'v0-card-hover': '0 0 0 1px rgba(139, 92, 246, 0.3), 0 8px 40px rgba(139, 92, 246, 0.12)',
  			'v0-card-hover-pink': '0 0 0 1px rgba(236, 72, 153, 0.3), 0 8px 40px rgba(236, 72, 153, 0.12)',
  		},
  		// V0 Soft Background Images - Violet/Purple/Pink
  		backgroundImage: {
  			'v0-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%)',
  			'v0-gradient-soft': 'linear-gradient(135deg, #a78bfa 0%, #c084fc 50%, #f472b6 100%)',
  			'v0-gradient-radial': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(139, 92, 246, 0.25), transparent)',
  			'v0-mesh': 'radial-gradient(at 40% 20%, hsla(263, 70%, 60%, 0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(289, 70%, 60%, 0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(263, 70%, 60%, 0.08) 0px, transparent 50%)',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
