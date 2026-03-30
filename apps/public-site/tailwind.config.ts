import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx,mdx}',
    '../../shared/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#e11b22', // Realtor.ca Signature Red
          navy: '#0F172A',
          charcoal: '#333333',
        },
        neutral: {
          bg: '#f9fafb',
          card: '#FFFFFF',
          border: '#eeeeee',
          text: {
            primary: '#222222',
            secondary: '#666666',
            muted: '#999999',
          },
        },
        status: {
          success: '#1ea066',
          warning: '#f0ad4e',
          error: '#d9534f',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'premium': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
      keyframes: {
        'slow-zoom': {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.1)' },
        }
      },
      animation: {
        'slow-zoom': 'slow-zoom 20s ease-in-out infinite alternate',
      }

    },
  },
  plugins: [],
};

export default config;
