import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const landingPageStyles = {
  brand: {
    50: '#EEF1FC',
    100: '#DCE3F9',
    200: '#B7C4F1',
    300: '#8FA1E8',
    400: '#6B84E3',
    500: '#4A65D9',
    600: '#3A5BDA', // logo indigo
    700: '#2E48AE',
    800: '#243785',
    900: '#1D2C6E'
  },
  cream: '#FAFAF8',
  ink: '#2B2A28',
  muted: '#55524D',
  line: '#E5E3DE'
};

export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        ...landingPageStyles
      }
    }
  },
  plugins: [heroui()]
} satisfies Config;
