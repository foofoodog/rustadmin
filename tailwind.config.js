/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rust: {
          50: '#fdf4f3',
          100: '#fbe7e4',
          200: '#f8d4ce',
          300: '#f1b4a9',
          400: '#e78978',
          500: '#db614c',
          600: '#c64630',
          700: '#a63725',
          800: '#893122',
          900: '#722e22',
          950: '#3e140d',
        }
      }
    },
  },
  plugins: [],
}
