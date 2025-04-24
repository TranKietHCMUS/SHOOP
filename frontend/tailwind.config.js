/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00B14F',
        'primary-dark': '#009F47',
        'primary-light': '#E5F5EB',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%', marginLeft: '0%' },
          '50%': { width: '100%', marginLeft: '0%' },
          '100%': { width: '0%', marginLeft: '100%' }
        }
      },
      animation: {
        'progress': 'progress 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
