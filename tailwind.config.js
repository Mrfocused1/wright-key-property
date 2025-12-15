/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        'dark': '#1a1a1a',
        'light': '#f5f3ef',
        'gold': '#d4af37',
        'gray': '#888888',
      },
      fontFamily: {
        'cormorant': ['Cormorant Garamond', 'serif'],
        'manrope': ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
