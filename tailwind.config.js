/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6',
          dark: '#1e3a8a',
        },
        background: {
          light: '#ffffff',
          dark: '#0f172a',
        },
        surface: {
          light: '#f8fafc',
          dark: '#1e293b',
        },
        text: {
          light: '#0f172a',
          dark: '#f1f5f9',
        },
      },
    },
  },
  plugins: [],
};
