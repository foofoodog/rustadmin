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
        },
        zinc: {
          50: 'rgb(var(--color-zinc-50) / <alpha-value>)',
          100: 'rgb(var(--color-zinc-100) / <alpha-value>)',
          200: 'rgb(var(--color-zinc-200) / <alpha-value>)',
          300: 'rgb(var(--color-zinc-300) / <alpha-value>)',
          400: 'rgb(var(--color-zinc-400) / <alpha-value>)',
          500: 'rgb(var(--color-zinc-500) / <alpha-value>)',
          600: 'rgb(var(--color-zinc-600) / <alpha-value>)',
          700: 'rgb(var(--color-zinc-700) / <alpha-value>)',
          750: 'rgb(var(--color-zinc-750) / <alpha-value>)',
          800: 'rgb(var(--color-zinc-800) / <alpha-value>)',
          850: 'rgb(var(--color-zinc-850) / <alpha-value>)',
          900: 'rgb(var(--color-zinc-900) / <alpha-value>)',
          950: 'rgb(var(--color-zinc-950) / <alpha-value>)',
        }
      }
    },
  },
  plugins: [],
}

