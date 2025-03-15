/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        bold: '600',
        extrabold: '700',
        heavy: '900',
      },

      fontSize: {
        sm: '0.75rem', // 12px
        base: '0.875rem', // 14px
        lg: '1rem', // 16px
        xl: '1.125rem', // 18px
        '2xl': '1.25rem', // 20px
        '3xl': '1.5rem', // 24px
      },

      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        white: '#FFFFFF',
        primary2: {
          ultralight: '#FBFBFB',
          light: '#F4F5F6',
          medium: '#EEEFF1',
          dark: '#E6E7EA',
        },
        secondary: {
          placeholder: '#9FA1A7',
          tagsHints: '#75777C',
          labelsTitles: '#5D5E62',
          default: '#232529',
        },
        h1: {
          light: '#FCE1DD',
          medium: '#F7B4A9',
          dark: '#F1948A',
          new: '#00B8C3',
        },
        warning: {
          light: '#FFF9E0',
          medium: '#FFEA5E',
          dark: '#FFCB0E',
        },
        success: {
          light: '#E6F7F8',
          medium: '#9ADDB6',
          dark: '#0FC27B',
        },
        danger: {
          light: '#FFDEDC',
          dark: '#EA4436',
        },
      },

      borderRadius: {
        none: '0px',
        sm: '4px',
        d: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px', // Fully rounded
      },

      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
      }
    }
  },
  plugins: [],
}; 