/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'app-dark': '#121212',
        'app-gray': '#1E1E1E',
        'app-light': '#2D2D2D',
      },
    },
  },
  plugins: [],
} 