import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    // Catch-all for any future files at root level
    './*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        cardBg: '#12121a',
        primaryAccent: '#6366f1',
        secondaryAccent: '#8b5cf6',
        successColor: '#10b981',
        dangerColor: '#ef4444',
        warningColor: '#f59e0b',
        textPrimary: '#f1f5f9',
        textSecondary: '#94a3b8',
        borderColor: '#1e1e2e',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'indigo-violet': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)', filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.6))' },
          '50%': { opacity: '.7', transform: 'scale(1.05)', filter: 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.9))' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(15px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
export default config
