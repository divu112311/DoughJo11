/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      colors: {
        // Exact brand colors
        brand: {
          teal: '#125B5F',
          rosegold: '#B76E79',
        },
        // Warm gold/yellow palette for outer elements
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Warm yellow variations
        warmyellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Teal variations
        teal: {
          50: '#f0f9fa',
          100: '#d9f2f4',
          200: '#b3e5e9',
          300: '#8dd8de',
          400: '#67cbd3',
          500: '#41bec8',
          600: '#2a9ba5',
          700: '#1f7882',
          800: '#125B5F', // Main brand color
          900: '#0d4347',
        },
        // Rose gold variations
        rosegold: {
          50: '#fdf2f5',
          100: '#fce7ec',
          200: '#f9cfd9',
          300: '#f5b7c6',
          400: '#f29fb3',
          500: '#ee87a0',
          600: '#e16f8d',
          700: '#d4577a',
          800: '#B76E79', // Main brand color
          900: '#9a5d68',
        },
        // Clean greys (main neutral palette)
        grey: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // Charcoal colors (for text)
        charcoal: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#1a1d20',
        },
        // Primary colors (using exact teal)
        primary: {
          50: '#f0f9fa',
          100: '#d9f2f4',
          200: '#b3e5e9',
          300: '#8dd8de',
          400: '#67cbd3',
          500: '#41bec8',
          600: '#2a9ba5',
          700: '#1f7882',
          800: '#125B5F', // Main brand color
          900: '#0d4347',
        },
        // Secondary colors (using exact rose gold)
        secondary: {
          50: '#fdf2f5',
          100: '#fce7ec',
          200: '#f9cfd9',
          300: '#f5b7c6',
          400: '#f29fb3',
          500: '#ee87a0',
          600: '#e16f8d',
          700: '#d4577a',
          800: '#B76E79', // Main brand color
          900: '#9a5d68',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};